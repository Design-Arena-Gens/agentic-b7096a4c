"use client"
import { useState } from 'react'

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('')
  const [result, setResult] = useState<any>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setStatus('Uploading and verifying...')

    const body = new FormData()
    body.append('file', file)

    const res = await fetch('/api/verify', { method: 'POST', body })
    const data = await res.json()
    setResult(data)
    setStatus('')
  }

  return (
    <main className="container py-8 space-y-6">
      <h2 className="text-2xl font-semibold">Verify Certificate</h2>
      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Upload Certificate (PNG/JPG/PDF)</label>
          <input className="input" type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <button className="btn btn-primary" disabled={!file}>{status || 'Verify'}</button>
      </form>
      {result && (
        <pre className="card p-4 overflow-auto text-sm bg-slate-900 text-slate-100">{JSON.stringify(result, null, 2)}</pre>
      )}
    </main>
  )
}
