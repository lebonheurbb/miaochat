import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function UserPoints() {
  const { user } = useAuth()
  const [points, setPoints] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchPoints()
    }
  }, [user])

  const fetchPoints = async () => {
    try {
      const response = await fetch('/api/points')
      const data = await response.json()
      if (data.points !== undefined) {
        setPoints(data.points)
      }
    } catch (error) {
      console.error('获取积分失败:', error)
    }
  }

  if (!user || points === null) return null

  return (
    <div className="flex items-center space-x-1 text-sm">
      <span className="text-gray-400">积分:</span>
      <span className="font-medium text-pink-400">{points}</span>
    </div>
  )
} 