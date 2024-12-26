'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user) {
      setNickname(user.nickname || '')
      setBio(user.bio || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({
        nickname,
        bio
      })
      router.back()
    } catch (error) {
      console.error('更新个人信息失败:', error)
      alert('更新个人信息失败，请重试')
    }
  }

  if (!mounted) {
    return null
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: 'auto' }}>
      {/* 半透明背景 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* 弹出层内容 */}
      <div className="relative flex items-center justify-center min-h-screen">
        <div className="w-[300px] bg-[#2C2C2C] rounded-lg overflow-hidden" style={{ marginTop: '-15vh' }}>
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3A]">
            <button
              onClick={() => router.back()}
              className="text-[#9AA0A6] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="text-[#E3E3E3] font-medium">个人资料</span>
            <button
              type="submit"
              form="profile-form"
              className="text-sm text-[#5B68F6] font-medium hover:text-[#6B77FF] transition-colors"
            >
              保存
            </button>
          </div>

          {/* 表单内容 */}
          <form id="profile-form" onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* 邮箱显示（只读） */}
            <div>
              <label className="block text-sm font-medium text-[#9AA0A6] mb-1">邮箱</label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-3 py-2 bg-[#1E1E1E] text-[#E3E3E3] rounded-lg focus:outline-none cursor-not-allowed opacity-70 text-sm"
              />
            </div>

            {/* 积分显示 */}
            <div>
              <label className="block text-sm font-medium text-[#9AA0A6] mb-1">积分</label>
              <div className="w-full px-3 py-2 bg-[#1E1E1E] text-[#E3E3E3] rounded-lg text-sm">
                {user.points || 0} 点
              </div>
            </div>

            {/* 昵称输入 */}
            <div>
              <label className="block text-sm font-medium text-[#9AA0A6] mb-1">用户名</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="设置用户名"
                className="w-full px-3 py-2 bg-[#1E1E1E] text-[#E3E3E3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5B68F6] text-sm"
              />
            </div>

            {/* 个人简介输入 */}
            <div>
              <label className="block text-sm font-medium text-[#9AA0A6] mb-1">个人简介</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="写点什么介绍一下自己吧"
                className="w-full px-3 py-2 bg-[#1E1E1E] text-[#E3E3E3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5B68F6] resize-none h-24 text-sm"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 