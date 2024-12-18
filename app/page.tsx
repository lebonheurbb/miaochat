export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* 导航栏 */}
      <nav className="bg-[#0B1120]/50 backdrop-blur-sm border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00AAFF] bg-clip-text text-transparent">
                喵哥 AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/login" className="text-gray-300 hover:text-[#0066FF]">
                登录
              </a>
              <a href="/register" className="px-4 py-2 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white">
                注册
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold sm:text-5xl md:text-6xl bg-gradient-to-r from-[#0066FF] to-[#00AAFF] bg-clip-text text-transparent">
            与 AI 对话，探索无限可能
          </h2>
          <p className="mt-6 text-xl text-[#94A3B8] max-w-3xl mx-auto">
            基于先进的人工智能技术，为您提供智能、自然的对话体验。
            无论是学习、工作还是娱乐，都能找到答案。
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/chat"
              className="px-8 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-[#0066FF] to-[#00AAFF] hover:from-[#0052CC] hover:to-[#0099FF] text-white transition-all duration-200"
            >
              开始对话
            </a>
            <a
              href="/about"
              className="px-8 py-3 text-lg font-medium rounded-full border border-[#1E293B] hover:border-[#0066FF] hover:text-[#0066FF] text-white transition-colors"
            >
              了解更多
            </a>
          </div>
        </div>

        {/* 特性展示 */}
        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative p-6 bg-[#0B1120]/50 rounded-2xl border border-[#1E293B] hover:border-[#0066FF] transition-colors">
            <div className="absolute -top-4 left-4 w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-[#0066FF]">即时响应</h3>
            <p className="mt-2 text-[#94A3B8]">快速、准确的回答，让您的对话流畅自然</p>
          </div>

          <div className="relative p-6 bg-[#0B1120]/50 rounded-2xl border border-[#1E293B] hover:border-[#00AAFF] transition-colors">
            <div className="absolute -top-4 left-4 w-8 h-8 bg-[#00AAFF] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-[#00AAFF]">安全可靠</h3>
            <p className="mt-2 text-[#94A3B8]">严格的隐私保护，确保您的对话安全</p>
          </div>

          <div className="relative p-6 bg-[#0B1120]/50 rounded-2xl border border-[#1E293B] hover:border-[#0066FF] transition-colors">
            <div className="absolute -top-4 left-4 w-8 h-8 bg-gradient-to-r from-[#0066FF] to-[#00AAFF] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold bg-gradient-to-r from-[#0066FF] to-[#00AAFF] bg-clip-text text-transparent">持续学习</h3>
            <p className="mt-2 text-[#94A3B8]">AI 不断进化，为您提供更好的服务</p>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-24 bg-[#0B1120]/50 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-[#94A3B8]">
            <p>© 2024 喵哥 AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
