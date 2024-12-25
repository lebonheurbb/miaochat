'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    if (!email || !password) return
    
    try {
      setLoading(true)
      await login(email, password)
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
          <div className="relative w-[75px] h-[75px]">
            <Image
              src="/google.svg"
              alt="Google"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
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
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
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

        {/* 分割线 */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#303134]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1A1B1E] text-[#9AA0A6]">或者</span>
            </div>
          </div>
        </div>

        {/* 注册链接 */}
        <div className="mt-6 text-center">
          <Link
            href="/register"
            className="text-[#0B57D0] hover:text-[#0842A0] transition-colors"
          >
            创建新账号
          </Link>
        </div>
      </div>
    </div>
  )
} 