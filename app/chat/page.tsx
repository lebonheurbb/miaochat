'use client'

import { useState, useRef, useEffect } from 'react'
import { generateResponse } from '../utils/deepseek'
import Link from 'next/link'
import { AI_CONFIG, getRandomGreeting, formatResponse } from '../utils/aiConfig'
import { useAuth } from '../contexts/AuthContext'
import Image from 'next/image'
import { HiMenuAlt2, HiOutlineRefresh } from 'react-icons/hi'
import { IoSettingsOutline } from 'react-icons/io5'
import { BiHistory } from 'react-icons/bi'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { BsImage, BsArrowRightCircleFill } from 'react-icons/bs'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  lastUpdated: number
}

// 生成对话标题
const generateTitle = async (messages: Message[]): Promise<string> => {
  if (messages.length === 0) return '新对话'
  
  // 获取最近的几条消息用于生成标题
  const recentMessages = messages.slice(-3)
  const prompt = `请用5个字以内总结这段对话的主题:\n${recentMessages.map(m => m.content).join('\n')}`
  
  try {
    const title = await generateResponse(prompt)
    return title?.trim() || '新对话'
  } catch (error) {
    console.error('Failed to generate title:', error)
    return '新对话'
  }
}

// 添加一个动态省略号组件
const LoadingDots = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className="inline-block w-16">{dots}</span>
  );
};

export default function ChatPage() {
  const { user } = useAuth()  // 获取用户信息
  const [message, setMessage] = useState('')
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [greeting, setGreeting] = useState('')
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 获取当前聊天的消息
  const currentChat = chats.find(chat => chat.id === currentChatId)
  const currentMessages = currentChat?.messages || []

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

  // 监听键盘事件，随机切换欢迎语
  useEffect(() => {
    const handleKeyPress = () => {
      setGreeting(getRandomGreeting())
    }

    window.addEventListener('keydown', handleKeyPress)
    // 初始化欢迎语
    setGreeting(getRandomGreeting())

    // 清理事件监听
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  // 创建新对话
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      lastUpdated: Date.now()
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  // 更新对话标题
  const updateChatTitle = async (chatId: string, messages: Message[]) => {
    const newTitle = await generateTitle(messages)
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, title: newTitle }
      }
      return chat
    }))
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
        title: '新对话',
        messages: [],
        lastUpdated: Date.now()
      }
      setChats(prev => [newChat, ...prev])
      setCurrentChatId(chatId)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim()
    }

    // 更新聊天记录
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          lastUpdated: Date.now()
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
          const updatedMessages = [...chat.messages, aiMessage]
          // 异步更新标题
          updateChatTitle(chatId, updatedMessages)
          return {
            ...chat,
            messages: updatedMessages,
            lastUpdated: Date.now()
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
            messages: [...chat.messages, errorMessage],
            lastUpdated: Date.now()
          }
        }
        return chat
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#1A1B1E] overflow-hidden">
      {/* 侧边栏 */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-[#202124] transition-transform duration-300 ease-in-out z-30`}>
        <div className="flex flex-col h-full text-white">
          <div className="flex items-center p-4">
            <span className="text-xl font-semibold">Gemini</span>
            <span className="ml-2 text-sm text-gray-400">1.5 Flash</span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm text-gray-400 mb-2">近期对话</h3>
              <div className="space-y-2">
                {chats
                  .sort((a, b) => b.lastUpdated - a.lastUpdated)
                  .map(chat => (
                    <div 
                      key={chat.id}
                      onClick={() => setCurrentChatId(chat.id)}
                      className={`flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg cursor-pointer ${
                        chat.id === currentChatId ? 'bg-gray-700' : ''
                      }`}
                    >
                      <BiHistory className="text-gray-400" />
                      <span className="truncate">{chat.title}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                  <IoSettingsOutline className="text-gray-400" />
                  <span>设置</span>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                  <AiOutlineQuestionCircle className="text-gray-400" />
                  <span>帮助</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col h-screen">
        {/* 顶部导航栏 - 固定定位 */}
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between h-14 px-4 bg-[#202124] z-20">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white p-2 hover:bg-gray-700 rounded-lg"
            >
              <HiMenuAlt2 size={24} />
            </button>
            
            {currentChat && (
              <span className="ml-4 text-white truncate">{currentChat.title}</span>
            )}
          </div>
          
          <button
            onClick={createNewChat}
            className="text-white p-2 hover:bg-gray-700 rounded-lg"
            title="新建聊天"
          >
            <HiOutlineRefresh size={24} />
          </button>
        </div>

        {/* 消息列表区域 - 添加底部内边距为输入框留出空间 */}
        <div className="flex-1 overflow-y-auto pt-14 pb-20">
          <div className="h-full">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl">
                    {mounted && (
                      <>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                          {user?.nickname || 'lebonheur'}
                        </span>
                        <span className="text-pink-400">，你好</span>
                      </>
                    )}
                  </h2>
                  <p className="text-[#9AA0A6] transition-all duration-200 ease-in-out">
                    {greeting || '听说你在找一个博学多才的AI? 巧了，本喵正好符合条件，喵~'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className="group">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {msg.role === 'assistant' ? (
                          <span className="text-2xl">🐱</span>
                        ) : (
                          user?.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt="用户头像"
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="flex items-center justify-center w-8 h-8 bg-[#9AA0A6] rounded-full text-[#1A1B1E] text-sm">
                              {user?.nickname?.[0] || '我'}
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-[14px] text-[#9AA0A6]">
                          {msg.role === 'assistant' ? AI_CONFIG.name : (user?.nickname || '我')}
                        </div>
                        <div className="text-[#E3E3E3] text-[16px] leading-7">
                          {msg.content.split('\n').map((paragraph, index) => (
                            <div 
                              key={index} 
                              className={`${
                                paragraph.startsWith('•') || paragraph.startsWith('・')
                                  ? 'pl-4 mb-1.5'
                                  : paragraph.trim() === '' 
                                    ? 'h-3'
                                    : 'mb-2'
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
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl animate-bounce">🐱</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-[14px] text-[#9AA0A6]">{AI_CONFIG.name}</div>
                      <div className="text-[#9AA0A6] text-[16px] flex items-center space-x-2">
                        <span className="animate-pulse">思考中</span>
                        <LoadingDots />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* 输入框 - 固定在底部 */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1A1B1E] p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => console.log('Upload image')}
              >
                <BsImage size={20} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="问一问 Gemini"
                className="w-full bg-[#303134] text-white rounded-3xl pl-12 pr-12 py-3 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:hover:text-blue-500"
              >
                <BsArrowRightCircleFill size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}