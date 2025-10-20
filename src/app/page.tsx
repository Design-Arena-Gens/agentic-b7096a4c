import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="container py-10">
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold">ChainCert</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          AI-powered, blockchain-anchored certificate generation and verification platform.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/verify" className="btn btn-primary">Verify Certificate</Link>
          <Link href="/issuer" className="btn btn-secondary">Issuer Portal</Link>
          <Link href="/admin" className="btn">Admin Portal</Link>
        </div>
      </section>
    </main>
  )
}
