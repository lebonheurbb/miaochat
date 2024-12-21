'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login, user } = useAuth()

  useEffect(() => {
    // 如果用户已登录，直接重定向到聊天页面
    if (user) {
      router.push('/chat')
    }
  }, [user, router])

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
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="电子邮件地址"
              className="w-full px-4 py-3 bg-[#303134] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
} 