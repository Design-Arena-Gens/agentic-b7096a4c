"use client"
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [token, setToken] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Signing in...')
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    setStatus('')
    if (data.token) {
      setToken(data.token)
      localStorage.setItem('token', data.token)
    } else {
      alert(data.error || 'Login failed')
    }
  }

  return (
    <main className="container py-8 space-y-6">
      <h2 className="text-2xl font-semibold">Login</h2>
      <form onSubmit={onSubmit} className="card p-6 space-y-4 max-w-md">
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary">{status || 'Sign in'}</button>
      </form>
      {token && <pre className="card p-4 overflow-auto text-sm">{token}</pre>}
    </main>
  )
}
