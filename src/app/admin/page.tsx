"use client"
import { useState } from 'react'

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setStatus('Uploading template...')
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/admin/template', { method: 'POST', body, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')||''}` } })
    const data = await res.json()
    setStatus(data?.ok ? 'Uploaded' : 'Failed')
  }

  return (
    <main className="container py-8 space-y-6">
      <h2 className="text-2xl font-semibold">Admin Portal</h2>
      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Upload PPTX Template</label>
          <input className="input" type="file" accept=".pptx" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <button className="btn btn-primary" disabled={!file}>{status || 'Save Template'}</button>
      </form>
    </main>
  )
}
