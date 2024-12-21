'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  useEffect(() => {
    // 只在直接访问（不是从聊天页面返回）且用户已登录时重定向
    if (user && from !== 'chat') {
      router.push('/chat')
    }
  }, [user, router, from])

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      {/* 固定的顶部标题栏 */}
      <div className="fixed top-0 left-0 right-0 bg-[#1A1B1E] z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <span className="text-xl text-white">
                Gemini
              </span>
            </div>
            {user ? (
              <Link 
                href="/chat"
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-gray-500 transition-all"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="用户头像"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#9AA0A6] flex items-center justify-center text-[#1A1B1E] text-sm">
                    {user.email?.[0].toUpperCase() || '?'}
                  </div>
                )}
              </Link>
            ) : (
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
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            {/* 图片容器 */}
            <div className="max-w-md mx-auto mb-8">
              <Image
                src="/anime-girl.jpg"
                alt="动漫人物"
                width={400}
                height={400}
                className="rounded-lg shadow-lg"
                priority
              />
            </div>

            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Gemini
            </h1>
            <h2 className="text-3xl font-bold text-white">
              获取创意灵感，提升工作效率
            </h2>
            <p className="text-[#9AA0A6] text-xl max-w-2xl mx-auto">
              轻松对话，让 Google AI 帮你写作、规划、学习或处理其他事务
            </p>
            <div className="mt-8">
              <Link
                href={user ? "/chat" : "/login"}
                className="inline-block px-8 py-3 bg-[#0B57D0] hover:bg-[#0842A0] rounded-2xl text-white text-lg font-medium"
              >
                {user ? "进入对话" : "登录"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
