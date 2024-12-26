'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import PointsDisplay from '../components/PointsDisplay'

export default function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // 基础导航栏布局
  const baseNavbar = (
    <nav className="relative bg-[#151820] backdrop-blur-xl border-b border-[#1E2330]/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
                喵哥 AI
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!mounted ? (
              <div className="w-8 h-8" /> // 占位符
            ) : user ? (
              <>
                <PointsDisplay />
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-violet-500 hover:ring-cyan-500 transition-all duration-300 hover:scale-105">
                      <Image
                        src="/cat-avatar.png"
                        alt="用户头像"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#151820] border border-[#1E2330] rounded-lg shadow-xl py-1">
                      <div className="px-4 py-2 text-sm text-[#8B95A5] border-b border-[#1E2330]">
                        {user.email}
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-[#8B95A5] hover:bg-[#1E2330] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        个人信息
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1E2330] transition-colors"
                      >
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[#8B95A5] hover:text-violet-400 transition-colors">
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white shadow-lg shadow-violet-500/10 hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )

  return baseNavbar
} 