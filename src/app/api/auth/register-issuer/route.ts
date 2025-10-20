import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { UserModel } from '@/lib/models'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(2), org: z.string().min(2) })

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 })

  const exists = await UserModel.findOne({ email: parsed.data.email })
  if (exists) return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 409 })

  const passwordHash = await hashPassword(parsed.data.password)
  await UserModel.create({ email: parsed.data.email, passwordHash, role: 'pending_issuer', name: parsed.data.name, org: parsed.data.org, approved: false })
  return new Response(JSON.stringify({ ok: true }))
}
