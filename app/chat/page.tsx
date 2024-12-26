'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { generateResponse } from '../utils/gemini';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AI_CONFIG, getRandomGreeting, formatResponse } from '../utils/aiConfig';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';
import { HiMenuAlt2, HiOutlineRefresh } from 'react-icons/hi';
import { IoSettingsOutline, IoAdd } from 'react-icons/io5';
import { BiHistory } from 'react-icons/bi';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { BsImage, BsArrowRightCircleFill } from 'react-icons/bs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;  // 添加图片支持
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

// 生成对话标题
const generateTitle = async (messages: Message[]): Promise<string> => {
  if (messages.length === 0) return '新对话';
  
  // 获取最近的几条消息用于生成标题
  const recentMessages = messages.slice(-3);
  const prompt = `请5�����以内总结这段对话的主题:\n${recentMessages.map(m => m.content).join('\n')}`;
  
  try {
    const title = await generateResponse(prompt);
    return title?.trim() || '新对话';
  } catch (error) {
    console.error('Failed to generate title:', error);
    return '新对话';
  }
};

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

// 添加消息动画的 framer-motion 组件
const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function ChatPage() {
  const router = useRouter();
  const { user, logout } = useAuth();  // 获取用户信息和登出函数
  const [message, setMessage] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [greeting, setGreeting] = useState('');
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string | null>(null);  // 添加图片状态
  const fileInputRef = useRef<HTMLInputElement>(null);  // 添加文件输入引用
  const [shouldShift, setShouldShift] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [bottomSpaceHeight, setBottomSpaceHeight] = useState(200);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 优化滚动效果
  const scrollToBottom = useCallback(() => {
    const messageList = messagesContainerRef.current;
    if (!messageList) return;

    const scrollDistance = messageList.scrollHeight - messageList.clientHeight;
    
    // 使用 spring 动画
    const start = messageList.scrollTop;
    const change = scrollDistance - start;
    const startTime = performance.now();
    const duration = 500;

    function easeOutSpring(t: number) {
      const c4 = (2 * Math.PI) / 3;
      return t === 0
        ? 0
        : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      messageList.scrollTop = start + change * easeOutSpring(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, []);

  // 获取当前聊天的消息
  const currentChat = chats.find(chat => chat.id === currentChatId);
  const currentMessages = currentChat?.messages || [];

  // 监听消息变化自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  // 监听加载状态变化自动滚动
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading, scrollToBottom]);

  // 监听键盘事件，随机切换欢迎语
  useEffect(() => {
    const handleKeyPress = () => {
      setGreeting(getRandomGreeting());
    };

    window.addEventListener('keydown', handleKeyPress);
    // 初始化欢迎语
    setGreeting(getRandomGreeting());

    // 清理事件监听
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // 创建新对话
  const createNewChat = () => {
    // 如果当前已经在新对话中（没有消息），则不创建
    if (currentChat && currentChat.messages.length === 0) {
      return;
    }
    
    const newChat: Chat = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      lastUpdated: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  // 更新对话标
  const updateChatTitle = async (chatId: string, messages: Message[]) => {
    const newTitle = await generateTitle(messages);
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, title: newTitle };
      }
      return chat;
    }));
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !image) || isLoading) return;
    
    let chatId = currentChatId;
    
    // 如果没有当前对话，创建一个新的
    if (!chatId) {
      chatId = Date.now().toString();
      const newChat: Chat = {
        id: chatId,
        title: '新对话',
        messages: [],
        lastUpdated: Date.now()
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(chatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      image: image || undefined  // 修复类型错误
    };

    // 更新聊天记录
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          lastUpdated: Date.now()
        };
      }
      return chat;
    }));

    setMessage('');
    setImage(null);  // 清除图片
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message.trim(),
          image,
          messages: currentChat?.messages || []  // 添加历史消息
        }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatResponse(data.message || '哎呀，本喵突然有点累了，待会再回答你喵~')
      };

      // 更新聊天记录
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages, aiMessage];
          // 异步更新标题
          updateChatTitle(chatId, updatedMessages);
          return {
            ...chat,
            messages: updatedMessages,
            lastUpdated: Date.now()
          };
        }
        return chat;
      }));
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatResponse('抱歉，本喵遇到了一点小问题，请稍后再试~')
      };
      
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, errorMessage],
            lastUpdated: Date.now()
          };
        }
        return chat;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 处理点击空白处关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // 如果点击的是菜单按钮本身，不处理（让按钮的点击事件处理）
      const menuButton = document.querySelector('[data-menu-button]');
      if (menuButton && menuButton.contains(event.target as Node)) {
        return;
      }
      
      // 如果点击的是菜单内容之外的区域，关闭菜单
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    // 添加点击和触摸事件监听
    document.addEventListener('mousedown', handleClickOutside as EventListener);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, []);

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 添加检查滚动位置的函数
  const checkScrollPosition = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    
    // 如果距离底部小于 200px，触发上移动画
    if (distanceFromBottom < 200) {
      setShouldShift(true);
      setTimeout(() => setShouldShift(false), 500); // 动画结束后重置状态
    }
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollPosition);
    return () => container.removeEventListener('scroll', checkScrollPosition);
  }, [checkScrollPosition]);

  // 更新底部空间高度
  useEffect(() => {
    const updateBottomSpace = () => {
      const inputHeight = inputAreaRef.current?.getBoundingClientRect().height || 0;
      setBottomSpaceHeight(inputHeight + 20); // 从 100 改为 20，减小额外的缓冲空间
    };

    updateBottomSpace();
    window.addEventListener('resize', updateBottomSpace);
    return () => window.removeEventListener('resize', updateBottomSpace);
  }, []);

  // 处理点击空白处关闭侧边栏
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // 如果点击的是菜单按钮本身，不处理
      const sidebarButton = document.querySelector('[data-sidebar-button]');
      if (sidebarButton && sidebarButton.contains(event.target as Node)) {
        return;
      }
      
      // 如果点击的是侧边栏内容之外的区域，关闭侧边栏
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebarOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    // 添加点击和触摸事件监听
    document.addEventListener('mousedown', handleClickOutside as EventListener);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-[#1A1B1E] overflow-hidden">
      {/* 侧边栏 */}
      <div 
        data-sidebar
        className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        w-[280px] sm:w-64 bg-[#202124] transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="flex flex-col h-full text-white">
          <div className="flex items-center p-4">
            <span className="text-xl font-semibold">Gemini</span>
            <span className="ml-2 text-sm text-gray-400">1.5 Flash</span>
          </div>

          {/* 添加发起新对话按钮 */}
          <div className="px-4 space-y-2">
            <button
              onClick={() => {
                setCurrentChatId(null);  // 清除当前聊天
                setSidebarOpen(false);   // 关闭侧边栏
                router.push('/?from=chat');  // 返回首页，带上来源参数
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#303134] hover:bg-[#404144] rounded-full text-[#E3E3E3] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>返回首页</span>
            </button>
            <button
              onClick={createNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#303134] hover:bg-[#404144] rounded-full text-[#E3E3E3] transition-colors"
            >
              <IoAdd size={20} />
              <span>发起新对话</span>
            </button>
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
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between h-14 px-2 sm:px-4 bg-[#1A1B1E] z-20">
          <div className="flex items-center">
            <button 
              data-sidebar-button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white p-2 hover:bg-[#303134] rounded-lg"
            >
              <HiMenuAlt2 size={24} />
            </button>
            
            {currentChat && (
              <span className="ml-4 text-white truncate max-w-[150px] sm:max-w-[300px]">{currentChat.title}</span>
            )}
          </div>
          
          {/* 个人信息头像和下拉菜单 */}
          <div className="relative" ref={userMenuRef}>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-[#1E2330] rounded-lg text-sm">
                <span className="text-[#9AA0A6]">积分</span>
                <span className="font-medium text-white">
                  {user?.points ?? 0}
                </span>
              </div>
              <button
                data-menu-button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-gray-500 transition-all"
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="用户头像"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#9AA0A6] flex items-center justify-center text-[#1A1B1E] text-sm">
                    {user?.email?.[0].toUpperCase() || '?'}
                  </div>
                )}
              </button>
            </div>

            {/* 下拉菜单 */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-96 backdrop-blur-xl bg-[#202124]/80 rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.3)] overflow-hidden z-50">
                {/* 用户信息部分 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        {user?.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt="用户头像"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#9AA0A6] flex items-center justify-center text-[#1A1B1E] text-lg">
                            {user?.email?.[0].toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-white font-medium">
                          {user?.nickname || user?.email?.split('@')[0]}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user?.email}
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#1E2330] rounded-lg text-sm mt-1">
                          <span className="text-[#9AA0A6]">积分</span>
                          <span className="font-medium text-white">
                            {user?.points ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <button className="w-full mt-2 px-4 py-2 bg-[#303134]/90 hover:bg-[#404144]/90 rounded-xl text-white text-sm transition-colors backdrop-blur-md">
                    管理您的 Google 账号
                  </button>
                </div>

                {/* 菜单选项 */}
                <div className="px-2">
                  <button
                    onClick={() => {/* 添加账号逻辑 */}}
                    className="w-full px-4 py-2 text-left text-white hover:bg-[#303134]/80 rounded-lg flex items-center space-x-2 my-1 backdrop-blur-md"
                  >
                    <IoAdd className="text-gray-400" />
                    <span>添加账号</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-white hover:bg-[#303134]/80 rounded-lg flex items-center space-x-2 my-1 backdrop-blur-md"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>退出账号</span>
                  </button>
                </div>

                {/* 底部链接 */}
                <div className="px-4 py-3 text-xs text-gray-400 flex items-center justify-center space-x-2 bg-[#1A1B1E]/50 backdrop-blur-md">
                  <a href="#" className="hover:text-white">隐私权政策</a>
                  <span>•</span>
                  <a href="#" className="hover:text-white">服务条款</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 消息列表区域 */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto pt-14 scroll-smooth"
        >
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="text-center space-y-4 animate-fade-in">
                <h2 className="text-2xl sm:text-4xl">
                  {mounted && (
                    <>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                        {user?.nickname || 'lebonheur'}
                      </span>
                      <span className="text-pink-400">，你好</span>
                    </>
                  )}
                </h2>
                <p className="text-sm sm:text-base text-[#9AA0A6] transition-all duration-200 ease-in-out">
                  {greeting || '让本喵猜猜...你一定是来找我解答人生难题的吧？不对吗？喵~'}
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-2 sm:px-4 py-2 space-y-4">
              {currentMessages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className="group transition-all duration-300 ease-out"
                  style={{
                    opacity: 0,
                    transform: 'translateY(10px)',
                    animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s forwards`
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {msg.role === 'assistant' ? (
                        <span className="text-2xl"></span>
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
                    <div className="flex-1">
                      <div className="text-[13px] text-[#9AA0A6] mb-1">
                        {msg.role === 'assistant' ? AI_CONFIG.name : (user?.nickname || '我')}
                      </div>
                      <div className="text-[#E3E3E3] text-[15px] leading-[1.5]">
                        {/* 如果有图片，先显示图片 */}
                        {msg.image && (
                          <div className="mb-2">
                            <img
                              src={msg.image}
                              alt="用户上传的图片"
                              className="max-w-sm rounded-lg"
                            />
                          </div>
                        )}
                        {/* 显示本内容 */}
                        {msg.content.split('\n').map((paragraph, index) => (
                          <div 
                            key={index} 
                            className={`${
                              paragraph.startsWith('•') || paragraph.startsWith('・')
                                ? 'pl-4 mb-2'
                                : paragraph.trim() === '' 
                                  ? 'h-4'
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
                <div 
                  className="group transition-all duration-300 ease-out"
                  style={{
                    opacity: 0,
                    transform: 'translateY(10px)',
                    animation: 'fadeSlideIn 0.2s ease-out forwards'
                  }}
                >
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
                </div>
              )}
              <div style={{ height: `${bottomSpaceHeight}px` }} />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入框区域 */}
        <div ref={inputAreaRef} className="fixed bottom-0 left-0 right-0 px-2 sm:px-4">
          <div 
            className="h-[40px] bg-gradient-to-t from-[#1A1B1E] via-[#1A1B1E] to-transparent pointer-events-none"
            style={{
              transition: 'opacity 0.3s ease-in-out',
              opacity: shouldShift ? 0.8 : 1
            }}
          />
          <div 
            className="bg-[#1A1B1E] pb-4"
            style={{
              transition: 'transform 0.3s ease-in-out',
              transform: shouldShift ? 'translateY(-10px)' : 'translateY(0)'
            }}
          >
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-center gap-3 bg-[#303134] rounded-full pl-4 pr-3 hover:bg-[#404144] transition-colors">
                  <button
                    type="button"
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <BsImage size={20} />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="问一问"
                    className="flex-1 bg-transparent text-white py-3 focus:outline-none text-[14px] sm:text-[16px]"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || (!message.trim() && !image)}
                    className="flex-shrink-0 p-2 text-[#8E8EA0] hover:text-white disabled:opacity-40 disabled:hover:text-[#8E8EA0] transition-colors"
                  >
                    <BsArrowRightCircleFill size={20} />
                  </button>
                </div>
                {/* 隐藏的文件输入 */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {/* 图片预览 */}
                {image && (
                  <div className="absolute bottom-full mb-2 left-0">
                    <div className="relative inline-block">
                      <img
                        src={image}
                        alt="预览"
                        className="h-20 rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        onClick={() => setImage(null)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
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
  );
}

// 更新动画关键帧
const styles = `
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeSlideIn 0.5s ease-out forwards;
  }

  /* 优化滚动条样式 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #404144;
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: #505154;
  }

  /* 添加平滑滚动 */
  .scroll-smooth {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
`;

// 将样式注入到页面
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}