'use client'

import { useState, useRef, useEffect } from 'react'
import { generateResponse } from '../utils/deepseek'
import Link from 'next/link'
import { AI_CONFIG, getRandomGreeting, formatResponse } from '../utils/aiConfig'

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

  // 添加消息容器的引用
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 添加自动滚动函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 当消息更新时自动滚动
  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, isLoading])

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
    
    let chatId = currentChatId
    
    // 如果没有当前对话，创建一个新的
    if (!chatId) {
      chatId = Date.now().toString()
      const newChat: Chat = {
        id: chatId,
        title: message.trim().slice(0, 20) + (message.length > 20 ? '...' : ''),
        messages: []
      }
      setChats(prev => [newChat, ...prev])
      setCurrentChatId(chatId)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim()
    }

    // 立即更新聊天记录
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
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
        content: formatResponse(response || '哎呀，本喵突然有点累了，待会再回答你喵~')
      }

      // 更新聊天记录
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
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
        content: formatResponse('抱歉，本喵遇到了一点小问题，请稍后再试~')
      }
      
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
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
        {/* 返回主页按钮 */}
        <Link 
          href="/"
          className="w-10 h-10 mb-2 flex items-center justify-center text-[#9AA0A6] hover:bg-[#35363A] rounded-full"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {/* 聊天列表 */}
        <div className="flex-1 w-full overflow-y-auto py-2 space-y-1">
          {/* 新建聊天按钮 */}
          <button 
            onClick={createNewChat}
            className="w-10 h-10 mx-auto flex items-center justify-center text-[#E3E3E3] hover:bg-[#35363A] rounded-full"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* 聊天列表按钮 */}
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full ${
                currentChatId === chat.id 
                  ? 'bg-[#35363A] text-[#E3E3E3]' 
                  : 'text-[#9AA0A6] hover:bg-[#35363A]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          ))}
        </div>

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
          <div className="max-w-3xl mx-auto p-4 space-y-8">
            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">hong</span>
                    <span className="text-pink-400">，你好</span>
                  </h2>
                  <p className="text-[#9AA0A6]">{getRandomGreeting()}</p>
                </div>
              </div>
            )}
            {currentMessages.map((msg) => (
              <div key={msg.id} className="group">
                <div className="flex items-start space-x-6 px-6">
                  <div className="w-10 h-10 flex-shrink-0 mt-1">
                    {msg.role === 'assistant' ? (
                      <span className="flex items-center justify-center w-10 h-10 bg-[#8AB4F8] rounded-full text-[#1A1B1E] text-base">喵</span>
                    ) : (
                      <span className="flex items-center justify-center w-10 h-10 bg-[#9AA0A6] rounded-full text-[#1A1B1E] text-base">我</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-base text-[#9AA0A6]">
                      {msg.role === 'assistant' ? AI_CONFIG.name : '我'}
                    </div>
                    <div className="text-[#E3E3E3] text-base leading-7 whitespace-pre-wrap">
                      {msg.content.split('\n').map((paragraph, index) => (
                        <div 
                          key={index} 
                          className={`mb-4 ${
                            paragraph.startsWith('1.') || 
                            paragraph.startsWith('2.') || 
                            paragraph.startsWith('3.') || 
                            paragraph.startsWith('4.') || 
                            paragraph.startsWith('5.') || 
                            paragraph.startsWith('6.') || 
                            paragraph.startsWith('7.') || 
                            paragraph.startsWith('8.') 
                              ? 'pl-4' // 列表项缩进
                              : ''
                          }`}
                        >
                          {paragraph}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-4 px-4">
                <div className="w-8 h-8 flex-shrink-0 mt-1">
                  <span className="flex items-center justify-center w-8 h-8 bg-[#8AB4F8] rounded-full text-[#1A1B1E] text-sm">喵</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-sm text-[#9AA0A6]">喵星人</div>
                  <div className="text-[#9AA0A6]">思考中...</div>
                </div>
              </div>
            )}
            {/* 添加一个空的 div 作为滚动目标 */}
            <div ref={messagesEndRef} />
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