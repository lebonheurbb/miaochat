'use client'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#1A1B1E]">
      {children}
    </div>
  )
} 