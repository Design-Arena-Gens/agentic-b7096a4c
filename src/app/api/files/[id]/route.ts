import { NextRequest } from 'next/server'
import { readToBuffer, getBucket } from '@/lib/storage'
import { ObjectId } from 'mongodb'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bucket = await getBucket()
    const fileId = new ObjectId(params.id)
    const stream = bucket.openDownloadStream(fileId)
    const chunks: Uint8Array[] = []
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (d) => chunks.push(d))
      stream.on('error', reject)
      stream.on('end', () => resolve())
    })
    const buf = Buffer.concat(chunks)
    return new Response(buf, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 404 })
  }
}
