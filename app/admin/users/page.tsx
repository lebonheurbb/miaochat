'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface User {
  id: number
  email: string
  nickname: string
  created_at: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?page=${currentPage}&search=${searchTerm}`)
      const data = await res.json()
      setUsers(data.users)
      setTotalUsers(data.total)
      setLoading(false)
    } catch (error) {
      console.error('获取用户列表失败:', error)
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalUsers / usersPerPage)

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">用户管理</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 h-10 px-4 pr-10 bg-[#202124] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="bg-[#202124] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">邮箱</th>
                    <th className="px-6 py-4 text-left">昵称</th>
                    <th className="px-6 py-4 text-left">注册时间</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-[#2C2D31]">
                      <td className="px-6 py-4">{user.id}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.nickname}</td>
                      <td className="px-6 py-4">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className="text-blue-400 hover:text-blue-300 mr-4"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <FiEdit2 className="inline-block" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <FiTrash2 className="inline-block" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-gray-400">
                共 {totalUsers} 个用户
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#202124] text-gray-400 hover:bg-[#2C2D31]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 