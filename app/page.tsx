import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1B1E] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%] bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-20">
        <div className="text-center space-y-12">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              与喵对话，探索无限可能
            </span>
          </h1>

          <div className="flex items-center justify-center space-x-6 pt-8">
            <Link 
              href="/chat"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-[#E3E3E3] text-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <span className="mr-3">开始对话</span>
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link 
              href="#features"
              className="group inline-flex items-center px-8 py-4 bg-[#27282A] hover:bg-[#35363A] rounded-2xl text-[#E3E3E3] text-lg font-medium transition-all hover:scale-105"
            >
              <span className="mr-3">了解更多</span>
              <svg className="w-6 h-6 transition-transform group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>

          <div id="features" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-20">
            {[
              {
                title: '智能对话',
                description: '基于先进的大语言模型，提供流畅自然的对话体验',
                icon: '🤖'
              },
              {
                title: '知识渊博',
                description: '拥有海量知识储备，助你探索任何领域的奥秘',
                icon: '🌟'
              },
              {
                title: '个性化回答',
                description: '深度解上下文，提供量身定制的专业解答',
                icon: '✨'
              },
              {
                title: '实时响应',
                description: '毫秒级响应速度，让对话如行云流水般自然',
                icon: '⚡'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 bg-[#27282A]/50 backdrop-blur-sm rounded-3xl space-y-4 hover:bg-[#27282A] transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="text-2xl font-medium text-[#E3E3E3] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400">
                  {feature.title}
                </h3>
                <p className="text-lg text-[#9AA0A6]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-20 text-[#9AA0A6]">
            <p className="text-sm">基于 Next.js 和 Claude 构建</p>
          </div>
        </div>
      </div>
    </div>
  )
}
