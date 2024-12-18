import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              AI Chat
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              登录
            </Link>
            <Link 
              href="/register" 
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              注册
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content (保持原有内容) */}
      <main className="flex-grow bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            与AI对话，探索无限可能
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            基于先进的人工智能技术，为您提供智能、自然的对话体验。无论是学习、工作还是娱乐，都能找到答案。
          </p>
          <div className="mt-10">
            <Link 
              href="/chat"
              className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              开始对话
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">即时响应</h3>
                <p className="mt-2 text-gray-600">快速、准确的回答，让您的对话流畅自然</p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 mx-auto text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">安全可靠</h3>
                <p className="mt-2 text-gray-600">严格的隐私保护，确保您的对话安全</p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 mx-auto text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">持续学习</h3>
                <p className="mt-2 text-gray-600">AI不断进化，为您提供更好的服务</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900">关于我们</h3>
              <p className="mt-4 text-gray-600">
                我们致力于为用户提供最先进的AI对话体验，让科技更好地服务于人类。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">快速链接</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                    定价方案
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">法律条款</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                    隐私政策
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                    使用条款
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>© 2024 AI Chat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
