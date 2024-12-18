'use client'

import { useState } from 'react'
import { generateResponse } from '../utils/deepseek'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
}

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])

  // 获取当前聊天的消息
  const currentMessages = chats.find(chat => chat.id === currentChatId)?.messages || []

  // 创建新对话
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: '新对话',
      messages: []
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  // 选择对话
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return
    
    // 如果没有当前对话，创建一个新的
    if (!currentChatId) {
      createNewChat()
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim()
    }

    // 更新聊天记录
    setChats(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        // 如果是第一条消息，更新标题
        if (chat.messages.length === 0) {
          return {
            ...chat,
            title: message.trim().slice(0, 20) + (message.length > 20 ? '...' : ''),
            messages: [...chat.messages, userMessage]
          }
        }
        return {
          ...chat,
          messages: [...chat.messages, userMessage]
        }
      }
      return chat
    }))

    setMessage('')
    setIsLoading(true)

    try {
      const response = await generateResponse(message.trim())
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || '抱歉，我现在无法回答。请稍后再试。'
      }

      // 更新聊天记录
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, aiMessage]
          }
        }
        return chat
      }))
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后再试。'
      }
      
      // 更新聊天记录
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, errorMessage]
          }
        }
        return chat
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#1A1B1E]">
      {/* 左侧工具栏 */}
      <div className="w-16 bg-[#1A1B1E] flex flex-col items-center py-2">
        {/* 新建聊天按钮 */}
        <button 
          onClick={createNewChat}
          className="w-10 h-10 flex items-center justify-center text-[#E3E3E3] hover:bg-[#35363A] rounded-full"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* 底部工具按钮 */}
        <div className="mt-auto space-y-2">
          <button className="w-10 h-10 flex items-center justify-center text-[#9AA0A6] hover:bg-[#35363A] rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-[#9AA0A6] hover:bg-[#35363A] rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 头部 */}
        <header className="h-14 px-4 flex items-center justify-between bg-[#1A1B1E]">
          <div className="flex items-center space-x-4">
            <h1 className="text-[#E3E3E3] text-lg">喵星人</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#9AA0A6]">1.5 Flash</span>
              <svg className="w-4 h-4 text-[#9AA0A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-1.5 bg-[#35363A] text-[#E3E3E3] rounded-lg text-sm flex items-center space-x-2">
              <span className="text-pink-400">✧</span>
              <span>试用喵星人 Pro</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#9AA0A6] hover:bg-[#35363A] rounded-full">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* 聊天区域 */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-4 space-y-6">
            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-4xl">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">hong</span>
                    <span className="text-pink-400">，你好</span>
                  </h2>
                  <p className="text-[#9AA0A6]">有什么我可以帮你的吗？</p>
                </div>
              </div>
            )}
            {currentMessages.map((msg) => (
              <div key={msg.id} className="flex space-x-4">
                <div className="w-8 h-8 flex-shrink-0">
                  {msg.role === 'assistant' ? (
                    <span className="flex items-center justify-center w-8 h-8 bg-[#8AB4F8] rounded-full text-[#1A1B1E] text-sm">喵</span>
                  ) : (
                    <span className="flex items-center justify-center w-8 h-8 bg-[#9AA0A6] rounded-full text-[#1A1B1E] text-sm">我</span>
                  )}
                </div>
                <div className="flex-1 text-[#E3E3E3] text-[15px] leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex space-x-4">
                <div className="w-8 h-8 flex-shrink-0">
                  <span className="flex items-center justify-center w-8 h-8 bg-[#8AB4F8] rounded-full text-[#1A1B1E] text-sm">喵</span>
                </div>
                <div className="text-[#9AA0A6]">思考中...</div>
              </div>
            )}
          </div>
        </div>

        {/* 输入框 */}
        <div className="p-4 bg-[#1A1B1E]">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="问一问喵星人"
                className="w-full p-4 pr-20 bg-[#35363A] rounded-2xl focus:outline-none text-[#E3E3E3] placeholder-[#9AA0A6]"
                disabled={isLoading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button className="p-2 text-[#9AA0A6] hover:bg-[#3C4043] rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="text-[#9AA0A6] disabled:opacity-50"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}