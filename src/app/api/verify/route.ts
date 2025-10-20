import { NextRequest } from 'next/server'
import Busboy from 'busboy'
import { extractFromImage } from '@/lib/ai'
import { connectDB } from '@/lib/db'
import { CertificateModel } from '@/lib/models'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  await connectDB()
  const ip = req.headers.get('x-forwarded-for') || 'anon'
  if (!rateLimit(`verify:${ip}`, 10, 60_000)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 })
  }
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.startsWith('multipart/form-data')) {
    return new Response(JSON.stringify({ error: 'Invalid content-type' }), { status: 400 })
  }

  const bb = Busboy({ headers: { 'content-type': contentType } })
  const files: { filename: string, buffer: Buffer, mime: string }[] = []

  const done = new Promise<void>((resolve, reject) => {
    bb.on('file', (_name, file, info) => {
      const chunks: Buffer[] = []
      file.on('data', (d: Buffer) => chunks.push(d))
      file.on('end', () => files.push({ filename: info.filename, buffer: Buffer.concat(chunks), mime: info.mimeType }))
    })
    bb.on('error', reject)
    bb.on('finish', () => resolve())
  })

  const arrayBuffer = await req.arrayBuffer()
  bb.end(Buffer.from(arrayBuffer))
  await done

  if (!files.length) return new Response(JSON.stringify({ error: 'No file' }), { status: 400 })

  const base64 = files[0].buffer.toString('base64')
  const extracted = await extractFromImage(base64)

  const byEmail = extracted.EMAIL ? await CertificateModel.findOne({ ownerEmail: extracted.EMAIL }).lean<{ serial: string, anchorTx: string, data: any }>() : null
  const match = byEmail || await CertificateModel.findOne({ 'data.name': extracted.NAME }).lean<{ serial: string, anchorTx: string, data: any }>({})

  const isMatch = !!match && (
    (!extracted.NAME || match!.data?.name === extracted.NAME) &&
    (!extracted.COURSE || match!.data?.course === extracted.COURSE)
  )

  return new Response(JSON.stringify({ extracted, matched: isMatch, serial: match?.serial ?? null, anchorTx: match?.anchorTx ?? null }))
}
