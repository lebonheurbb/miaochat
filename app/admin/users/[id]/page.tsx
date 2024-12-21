'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiSave } from 'react-icons/fi'

interface User {
  id: number
  email: string
  nickname: string
  created_at: string
}

export default function UserEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${params.id}`)
      const data = await res.json()
      setUser(data)
      setNickname(data.nickname)
      setLoading(false)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      })

      if (!res.ok) {
        throw new Error('更新失败')
      }

      router.push('/admin/users')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] text-white p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">用户不存在</h1>
          <button
            onClick={() => router.push('/admin/users')}
            className="text-blue-400 hover:text-blue-300"
          >
            返回用户列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/admin/users')}
            className="text-gray-400 hover:text-white mr-4"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">编辑用户</h1>
        </div>

        <div className="bg-[#202124] rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-gray-400 mb-2">ID</label>
              <div className="text-lg">{user.id}</div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">邮箱</label>
              <div className="text-lg">{user.email}</div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full h-12 px-4 bg-[#2C2D31] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">注册时间</label>
              <div className="text-lg">
                {new Date(user.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#202124] disabled:opacity-50"
              >
                <FiSave className="mr-2" />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 