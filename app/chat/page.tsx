'use client'

import React, { useState, useRef, useEffect } from 'react'
import { generateResponse } from '../utils/deepseek'
import Link from 'next/link'

interface Chat {
  id: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    id: string
  }>
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([{
    id: Date.now().toString(),
    messages: []
  }])
  const [currentChatId, setCurrentChatId] = useState(chats[0].id)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 获取当前聊天
  const currentChat = chats.find(chat => chat.id === currentChatId)

  // 创建新聊天
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      messages: []
    }
    setChats(prev => [...prev, newChat])
    setCurrentChatId(newChat.id)
  }

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    setIsLoading(true)
    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      id: Date.now().toString()
    }
    
    // 更新当前聊天的消息
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ))
    setInput('')
    
    try {
      const aiResponse = await generateResponse(input.trim())
      
      if (!aiResponse) {
        throw new Error('No response from AI')
      }
      
      const formattedResponse = aiResponse.split('\n').map(line => 
        line.trim()
      ).filter(line => line).join('\n')

      const aiMessage = {
        role: 'assistant' as const,
        content: formattedResponse,
        id: (Date.now() + 1).toString()
      }
      
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, aiMessage] }
          : chat
      ))
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        role: 'assistant' as const,
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        id: (Date.now() + 1).toString()
      }
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      ))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-gray-100">
      {/* 侧边栏 */}
      <div className="w-16 bg-[#242424] border-r border-gray-800 flex flex-col items-center py-4 space-y-4">
        <Link 
          href="/" 
          className="p-2 hover:bg-[#2D2D2D] rounded-lg transition-colors group"
          title="返回主页"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 group-hover:scale-110 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Link>

        {/* 新建聊天按钮 */}
        <button 
          onClick={createNewChat}
          className="p-2 hover:bg-[#2D2D2D] rounded-lg transition-colors group"
          title="新建聊天"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 group-hover:scale-110 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
        </button>

        {/* 聊天列表 */}
        <div className="flex-1 w-full overflow-y-auto px-2 space-y-2">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`w-full p-2 rounded-lg transition-colors ${
                chat.id === currentChatId 
                  ? 'bg-blue-600' 
                  : 'hover:bg-[#2D2D2D]'
              }`}
              title={`聊天 ${chat.messages.length ? '#' + chat.messages[0].content.slice(0, 10) : '(空)'}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 mx-auto" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium">喵哥 AI</h1>
            <span className="text-xs px-2 py-1 bg-[#2D2D2D] rounded-full">2.0</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#2D2D2D] rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {currentChat?.messages.length === 0 && (
              <div className="text-center mt-20">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  你好，我是喵哥
                </h2>
                <p className="text-gray-400 mt-2">让我们开始对话吧</p>
              </div>
            )}
            
            {currentChat?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-[#2D2D2D]'
                }`}>
                  <pre className="whitespace-pre-wrap font-sans text-lg">
                    {message.content}
                  </pre>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2D2D2D] rounded-2xl p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-800 p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="向喵哥提问..."
                className="w-full bg-[#2D2D2D] rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}