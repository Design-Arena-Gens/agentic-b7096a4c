import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { CertificateModel, TemplateModel } from '@/lib/models'
import { anchorCertificate } from '@/lib/blockchain'
import { saveBuffer, publicDownloadUrl, readToBuffer } from '@/lib/storage'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import ImageModule from 'docxtemplater-image-module-free'
import crypto from 'crypto'
import { rateLimit } from '@/lib/rate-limit'
import { requireRole } from '@/lib/route-helpers'

export const runtime = 'nodejs'

function genSerial() {
  return 'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase()
}

export async function POST(req: NextRequest) {
  await connectDB()
  try { requireRole(req, 'issuer') } catch (e: any) { return new Response(JSON.stringify({ error: e.message }), { status: e.message==='Unauthorized'?401:403 }) }
  const ip = req.headers.get('x-forwarded-for') || 'anon'
  if (!rateLimit(`issue:${ip}`, 20, 60_000)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 })
  }
  const body = await req.json()
  const tpl = await TemplateModel.findOne({ active: true })
  if (!tpl) return new Response(JSON.stringify({ error: 'No active template' }), { status: 400 })

  const tplBuf = await readToBuffer(tpl.gridfsId as string)

  const tags = {
    NAME: body.name,
    DATE_OF_BIRTH: body.dob,
    EMAIL: body.email,
    CANDIDATE_IMAGE: body.imageUrl,
    COURSE: body.course,
    GRADE: body.grade,
    ISSUE_DATE: body.issueDate,
  }
  const zip = new PizZip(tplBuf)
  const imageOpts = {
    centered: false,
    getImage: async (tag: string) => {
      if (tag !== 'CANDIDATE_IMAGE') return null
      const resp = await fetch(tags.CANDIDATE_IMAGE)
      const arr = await resp.arrayBuffer()
      return Buffer.from(arr)
    },
    getSize: () => [200, 200],
  }
  const doc = new Docxtemplater()
  // @ts-ignore - image module free expects plain object
  doc.attachModule(new (ImageModule as any)(imageOpts))
  doc.loadZip(zip)
  doc.setData(tags)
  doc.render()
  const out = doc.getZip().generate({ type: 'nodebuffer' })
  const serial = genSerial()
  const hash = crypto.createHash('sha256').update(out).digest('hex')
  const anchorTx = await anchorCertificate(serial, hash)
  const gridfsId = await saveBuffer(`${serial}.pptx`, Buffer.from(out), 'application/vnd.openxmlformats-officedocument.presentationml.presentation')

  const cert = await CertificateModel.create({
    serial,
    data: body,
    ownerEmail: body.email,
    templateId: tpl._id,
    pptxGridfsId: gridfsId,
    anchorTx,
  })

  return new Response(JSON.stringify({ id: cert._id.toString(), serial, downloadUrl: publicDownloadUrl(gridfsId), anchorTx }))
}
