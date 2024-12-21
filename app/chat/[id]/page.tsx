'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Message, Chat } from '../../types/chat'
import ChatList from '../../components/ChatList'
import Link from 'next/link'
import { HiHome } from 'react-icons/hi'
import { io } from 'socket.io-client'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [chat, setChat] = useState<Chat | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)

  // 强制滚动到底部
  const forceScrollToBottom = () => {
    if (chatContainerRef.current) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      })
    }
  }

  // 初始化 WebSocket 连接
  useEffect(() => {
    if (!params.id) return

    // 连接 WebSocket
    socketRef.current = io('http://localhost:3000', {
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // 连接事件处理
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server')
      // 加入聊天室
      socketRef.current.emit('join-chat', params.id)
    })

    socketRef.current.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error)
    })

    // 监听消息更新
    socketRef.current.on('message-update', (updatedChat: Chat) => {
      console.log('Received message update:', updatedChat)
      setChat(updatedChat)
      forceScrollToBottom()
    })

    // 清理函数
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [params.id])

  // 初始加载时
  useEffect(() => {
    if (params.id) {
      fetchChat(params.id as string)
    }
  }, [params.id])

  const fetchChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`)
      if (response.ok) {
        const data = await response.json()
        setChat(data)
        forceScrollToBottom()
      }
    } catch (error) {
      console.error('Failed to fetch chat:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !chat || isLoading) return

    const userInput = input
    setInput('')
    
    try {
      setIsLoading(true)
      
      // 立即添加用户消息到界面
      setChat(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, {
            id: Date.now().toString(),
            role: 'user',
            content: userInput,
            chatId: prev.id,
            createdAt: new Date()
          }]
        }
      })

      forceScrollToBottom()

      const response = await fetch(`/api/chats/${chat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: userInput }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#1A1B1E]">
      <ChatList />
      <div className="flex-1 flex flex-col max-h-screen">
        {/* 聊天内容区域 */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex flex-col space-y-4">
            {chat?.messages.map((message) => (
              <div key={message.id} className="flex">
                <div className="flex-shrink-0 mr-4">
                  {message.role === 'assistant' ? (
                    <span className="text-2xl">🐱</span>
                  ) : (
                    <div className="w-8 h-8 bg-[#9AA0A6] rounded-full flex items-center justify-center text-[#1A1B1E]">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="text-sm text-[#9AA0A6] mb-1">
                    {message.role === 'assistant' ? '喵哥' : (user?.email?.split('@')[0] || '我')}
                  </div>
                  <div className="text-white whitespace-pre-wrap bg-[#303134] rounded-lg p-3">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-2xl animate-bounce">🐱</span>
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="text-sm text-[#9AA0A6] mb-1">喵哥</div>
                  <div className="text-[#9AA0A6] bg-[#303134] rounded-lg p-3">
                    思考中...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 输入框 */}
        <div className="p-4 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 bg-[#303134] text-white rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="问一问 Gemini..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA0A6] hover:text-white disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 