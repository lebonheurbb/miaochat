'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from './contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      {/* 固定的顶部标题栏 */}
      <div className="fixed top-0 left-0 right-0 bg-[#1A1B1E] z-10">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button className="p-2 text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="ml-2 text-xl text-white">
                Gemini
              </span>
            </div>
            {mounted && (
              <Link 
                href="/login" 
                className="px-6 py-2 bg-[#E3E3E3]/10 hover:bg-[#E3E3E3]/20 rounded-full text-[#E3E3E3]"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="flex flex-col items-center justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-sm mx-auto">
          {/* 图片容器 */}
          <div className="mb-6 rounded-lg overflow-hidden">
            <img 
              src="/anime-girl.jpg"
              alt="动漫人物"
              className="w-full h-auto"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          </div>

          {/* 文本内容 */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Gemini
            </h1>
            <h2 className="text-2xl font-bold text-white">
              获取创意灵感，提升工作效率
            </h2>
            <p className="text-[#9AA0A6] text-lg">
              轻松对话，让 Google AI 帮你写作、规划、学习或处理其他事务
            </p>
            {mounted && (
              <Link 
                href="/login" 
                className="inline-block w-full px-8 py-3 bg-[#0B57D0] hover:bg-[#0842A0] rounded-2xl text-white text-center font-medium"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
