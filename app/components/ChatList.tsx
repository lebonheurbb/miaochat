'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Chat } from '../types/chat'
import { IoAdd } from 'react-icons/io5'
import { IoSettingsOutline } from 'react-icons/io5'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { BsChatSquareText } from 'react-icons/bs'
import { IoChevronDownOutline } from 'react-icons/io5'

export default function ChatList() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user])

  const fetchChats = async () => {
    const response = await fetch('/api/chats')
    if (response.ok) {
      const data = await response.json()
      setChats(data)
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '新对话'
        })
      })

      if (response.ok) {
        const newChat = await response.json()
        setChats(prev => [newChat, ...prev])
        router.push(`/chat/${newChat.id}`)
      } else {
        console.error('Failed to create chat')
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  return (
    <div className="w-64 bg-[#1A1B1E] h-full flex flex-col text-white">
      {/* 标题区域 */}
      <div className="flex items-center p-4">
        <span className="text-xl">Gemini</span>
        <span className="ml-2 text-sm text-gray-400">1.5 Flash</span>
      </div>

      {/* 新建对话按钮 */}
      <button
        onClick={createNewChat}
        className="mx-3 mb-4 flex items-center gap-2 px-4 py-2 bg-[#303134] hover:bg-[#404144] rounded-full text-[#E3E3E3] transition-colors"
      >
        <IoAdd size={20} />
        <span>发起新对话</span>
      </button>

      {/* 近期对话区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3">
          <div className="flex items-center justify-between px-2 py-2 text-sm text-[#9AA0A6]">
            <span>近期对话</span>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-[#303134] rounded-lg"
            >
              <IoChevronDownOutline
                className={`transform transition-transform ${isExpanded ? '' : '-rotate-90'}`}
              />
            </button>
          </div>
          {isExpanded && (
            <div className="space-y-1">
              {chats.map(chat => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="flex items-center gap-2 px-2 py-2 hover:bg-[#303134] rounded-lg text-[#9AA0A6] hover:text-white transition-colors"
                >
                  <BsChatSquareText />
                  <span className="truncate">{chat.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部设置和帮助 */}
      <div className="mt-auto p-3 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-2 py-2 hover:bg-[#303134] rounded-lg text-[#9AA0A6] hover:text-white transition-colors"
        >
          <IoSettingsOutline />
          <span>设置</span>
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-2 px-2 py-2 hover:bg-[#303134] rounded-lg text-[#9AA0A6] hover:text-white transition-colors"
        >
          <AiOutlineQuestionCircle />
          <span>帮助</span>
        </Link>
      </div>
    </div>
  )
} 