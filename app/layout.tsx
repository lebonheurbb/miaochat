import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from './contexts/AuthContext'

export const metadata: Metadata = {
  title: 'NovaAI - 智能对话助手',
  description: '基于先进的人工智能技术，为您提供智能、自然的对话体验。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-[#0F1115] text-white">
        <AuthProvider>
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
