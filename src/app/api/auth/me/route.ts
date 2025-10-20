import { NextRequest } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return new Response(JSON.stringify({ authenticated: false }), { status: 401 })
  try {
    const payload = verifyJwt<any>(token)
    return new Response(JSON.stringify({ authenticated: true, user: payload }))
  } catch {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 })
  }
}
