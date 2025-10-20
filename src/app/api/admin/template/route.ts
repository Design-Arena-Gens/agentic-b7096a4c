import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { TemplateModel } from '@/lib/models'
import { saveBuffer } from '@/lib/storage'
import Busboy from 'busboy'
import { rateLimit } from '@/lib/rate-limit'
import { requireRole } from '@/lib/route-helpers'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  await connectDB()
  try { requireRole(req, 'admin') } catch (e: any) { return new Response(JSON.stringify({ error: e.message }), { status: e.message==='Unauthorized'?401:403 }) }
  const ip = req.headers.get('x-forwarded-for') || 'anon'
  if (!rateLimit(`admin-upload:${ip}`, 20, 60_000)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 })
  }
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.startsWith('multipart/form-data')) {
    return new Response(JSON.stringify({ error: 'Invalid content-type' }), { status: 400 })
  }

  const bb = Busboy({ headers: { 'content-type': contentType } })
  const fileBuffers: { filename: string, buffer: Buffer }[] = []

  const done = new Promise<void>((resolve, reject) => {
    bb.on('file', (_name, file, info) => {
      const chunks: Buffer[] = []
      file.on('data', (d: Buffer) => chunks.push(d))
      file.on('end', () => {
        fileBuffers.push({ filename: info.filename, buffer: Buffer.concat(chunks) })
      })
    })
    bb.on('error', reject)
    bb.on('finish', () => resolve())
  })

  const arrayBuffer = await req.arrayBuffer()
  bb.end(Buffer.from(arrayBuffer))
  await done

  if (!fileBuffers.length) return new Response(JSON.stringify({ error: 'No file' }), { status: 400 })

  const { filename, buffer } = fileBuffers[0]
  const gridfsId = await saveBuffer(filename, buffer, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')

  await TemplateModel.updateMany({}, { $set: { active: false } })
  const doc = await TemplateModel.create({ filename, gridfsId, fields: [] , active: true })

  return new Response(JSON.stringify({ ok: true, templateId: doc._id.toString() }))
}
