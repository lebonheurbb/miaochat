'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function PointsDisplay() {
  const { user, refreshUser } = useAuth()
  const [points, setPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPoints = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/points')
        if (response.ok) {
          const data = await response.json()
          if (data.points !== undefined) {
            setPoints(data.points)
          }
        } else {
          // 如果获取失败，使用 user.points
          setPoints(user.points)
        }
      } catch (error) {
        console.error('获取积分失败:', error)
        // 出错时使用 user.points
        setPoints(user.points)
      } finally {
        setLoading(false)
      }
    }

    fetchPoints()
    // 定期刷新积分
    const interval = setInterval(fetchPoints, 30000)
    return () => clearInterval(interval)
  }, [user])

  if (!user || loading) return null

  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#1E2330] rounded-full">
      <span className="text-[#9AA0A6]">积分</span>
      <span className="font-medium bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        {points ?? user.points ?? 0}
      </span>
    </div>
  )
} 