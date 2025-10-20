"use client"
import { useState } from 'react'

export default function IssuerPage() {
  const [form, setForm] = useState({ name: '', dob: '', email: '', imageUrl: '', course: '', grade: '', issueDate: '' })
  const [status, setStatus] = useState('')
  const [fileUrl, setFileUrl] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Creating certificate...')
    const res = await fetch('/api/issuer/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')||''}` },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setStatus('')
    if (data?.downloadUrl) setFileUrl(data.downloadUrl)
  }

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <main className="container py-8 space-y-6">
      <h2 className="text-2xl font-semibold">Issuer Portal</h2>
      <form onSubmit={onSubmit} className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ['name','Full Name'],
          ['dob','Date of Birth'],
          ['email','Email'],
          ['imageUrl','Candidate Image URL'],
          ['course','Course'],
          ['grade','Grade'],
          ['issueDate','Issue Date'],
        ].map(([k, label]) => (
          <div key={k}>
            <label className="label">{label}</label>
            <input className="input" value={(form as any)[k]} onChange={e => update(k, e.target.value)} />
          </div>
        ))}
        <button className="btn btn-primary col-span-full">{status || 'Generate Certificate'}</button>
      </form>
      {fileUrl && (
        <a className="btn btn-secondary" href={fileUrl}>Download Certificate</a>
      )}
    </main>
  )
}
