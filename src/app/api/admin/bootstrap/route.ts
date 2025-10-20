import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { UserModel } from '@/lib/models'
import { hashPassword } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest) {
  await connectDB()
  const adminExists = await UserModel.findOne({ role: 'admin' })
  if (adminExists) return new Response(JSON.stringify({ ok: true }))
  const passwordHash = await hashPassword(process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeMeNow!123')
  await UserModel.create({ email: 'admin@chaincert.io', passwordHash, role: 'admin', name: 'Admin', org: 'Authority', approved: true })
  return new Response(JSON.stringify({ ok: true }))
}
