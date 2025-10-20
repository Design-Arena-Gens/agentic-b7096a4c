import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChainCert - Secure Certificate Platform',
  description: 'AI-powered certificate generation and verification',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}
