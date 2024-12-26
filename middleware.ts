import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 这些路由不需要认证
const publicRoutes = ['/', '/login', '/register']

export function middleware(request: NextRequest) {
  // 如果是公开路由，直接通过
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // 如果是API路由，直接通过
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 获取用户信息
  const user = request.cookies.get('user')?.value

  // 如果用户未登录且访问的不是公开路由，重定向到登录页
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 