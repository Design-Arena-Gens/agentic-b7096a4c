import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { UserModel } from '@/lib/models'
import { verifyPassword, signJwt } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({ email: z.string().email(), password: z.string() })

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 })

  const user = await UserModel.findOne({ email: parsed.data.email })
  if (!user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
  if (user.role === 'pending_issuer' || !user.approved) return new Response(JSON.stringify({ error: 'Awaiting admin approval' }), { status: 403 })
  const ok = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!ok) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })

  const token = signJwt({ sub: user._id.toString(), role: user.role as any })
  return new Response(JSON.stringify({ token }))
}
