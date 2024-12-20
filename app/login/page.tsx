'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    try {
      setLoading(true)
      await login(email)
      router.push('/chat')
    } catch (error) {
      console.error('Login failed:', error)
      alert('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1B1E] flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Google Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/google.svg"
            alt="Google"
            width={75}
            height={75}
            priority
          />
        </div>

        {/* 登录标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-normal text-white mb-2">
            登录
          </h1>
          <h2 className="text-xl font-normal text-white">
            使用您的 Google 账号
          </h2>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#202124] rounded-lg p-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="电子邮件地址或电话号码"
              className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              required
            />
          </div>

          <div className="text-sm text-[#8ab4f8] hover:text-blue-400 cursor-pointer">
            忘记了电子邮件地址？
          </div>

          <div className="text-sm text-[#9AA0A6]">
            不是您自己的计算机？请使用无痕浏览窗口进行登录。
            <span className="text-[#8ab4f8] hover:text-blue-400 cursor-pointer ml-1">
              详细了解如何使用访客模式
            </span>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              className="text-[#8ab4f8] hover:text-blue-400 font-medium text-sm"
              onClick={() => router.push('/signup')}
            >
              创建账号
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#8ab4f8] hover:bg-blue-400 text-[#202124] rounded-md font-medium"
            >
              下一步
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 