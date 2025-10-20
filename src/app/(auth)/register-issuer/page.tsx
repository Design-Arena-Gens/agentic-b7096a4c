"use client"
import { useState } from 'react'

export default function RegisterIssuerPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', org: '' })
  const [status, setStatus] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Submitting...')
    const res = await fetch('/api/auth/register-issuer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setStatus(data.ok ? 'Submitted for approval' : data.error || 'Failed')
  }

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <main className="container py-8 space-y-6">
      <h2 className="text-2xl font-semibold">Register as Issuer</h2>
      <form onSubmit={onSubmit} className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ['name','Full Name'],
          ['org','Organization'],
          ['email','Email'],
          ['password','Password'],
        ].map(([k, label]) => (
          <div key={k}>
            <label className="label">{label}</label>
            <input className="input" type={k==='password'?'password':'text'} value={(form as any)[k]} onChange={e => update(k, e.target.value)} />
          </div>
        ))}
        <button className="btn btn-primary col-span-full">{status || 'Submit for Approval'}</button>
      </form>
    </main>
  )
}
