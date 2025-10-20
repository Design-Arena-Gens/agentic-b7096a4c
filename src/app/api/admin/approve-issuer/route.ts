import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { UserModel } from '@/lib/models'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({ userId: z.string() })

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 })

  const user = await UserModel.findById(parsed.data.userId)
  if (!user) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  user.role = 'issuer'
  user.approved = true
  await user.save()
  return new Response(JSON.stringify({ ok: true }))
}
