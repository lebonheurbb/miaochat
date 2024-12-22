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
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)

  // 强制滚动到底部
  const forceScroll = () => {
    if (containerRef.current && contentRef.current) {
      const container = containerRef.current;
      const content = contentRef.current;
      const lastMessage = content.lastElementChild;
      
      if (lastMessage) {
        lastMessage.scrollIntoView({ block: 'end' });
        // 额外的强制滚动
        container.scrollTop = container.scrollHeight + 1000;
      }
    }
  };

  // 设置 DOM 变化监听
  useEffect(() => {
    if (contentRef.current) {
      const observer = new MutationObserver(() => {
        forceScroll();
      });

      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });

      return () => observer.disconnect();
    }
  }, []);

  // 监听消息和加载状态变化
  useEffect(() => {
    forceScroll();
  }, [chat?.messages, isLoading]);

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
      forceScroll()
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
        forceScroll()
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

      forceScroll()

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
      <div className="flex-1 flex flex-col h-screen">
        {/* 消息列表区域 */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8"
        >
          <div 
            ref={contentRef}
            className="max-w-3xl mx-auto py-4 space-y-6"
          >
            {chat?.messages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {message.role === 'assistant' ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-2xl">🦊</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-[#9AA0A6] rounded-full flex items-center justify-center text-[#1A1B1E]">
                        {user?.email?.[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="text-[14px] text-[#9AA0A6]">
                      {message.role === 'assistant' ? 'Gemini' : (user?.email?.split('@')[0] || '我')}
                    </div>
                    <div className="text-[#E3E3E3] text-[16px] leading-7 whitespace-pre-wrap">
                      {message.content.split('\n').map((paragraph, index) => (
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
              <div className="group">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <span className="text-2xl animate-bounce">🦊</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-[14px] text-[#9AA0A6]">Gemini</div>
                    <div className="text-[#9AA0A6] text-[16px] flex items-center space-x-2">
                      <span className="animate-pulse">思考中</span>
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 输入框区域 */}
        <div className="flex-shrink-0 border-t border-gray-800 bg-[#1A1B1E]">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="flex items-center gap-3 bg-[#303134] rounded-full pl-4 pr-3 hover:bg-[#404144] transition-colors">
                <button
                  type="button"
                  className="flex-shrink-0 text-gray-400"
                  onClick={() => console.log('Upload image')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="问一问"
                  className="flex-1 bg-transparent text-white py-3 focus:outline-none text-[16px]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex-shrink-0 p-2 text-[#8E8EA0] hover:text-white disabled:opacity-40 disabled:hover:text-[#8E8EA0] transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4L3 11L10 14L13 21L20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 