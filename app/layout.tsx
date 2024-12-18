import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '喵哥 AI',
  description: '与 AI 对话，探索无限可能',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
