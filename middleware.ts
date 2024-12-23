import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-this'
)

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: '请先登录喵~' },
      { status: 401 }
    )
  }

  try {
    const token = authHeader.split(' ')[1]
    const { payload } = await jwtVerify(token, secret)
    
    // 添加用户信息到请求头
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId as string)

    // 克隆请求对象并添加修改后的头部
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // 添加 CORS 头部
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return response
  } catch (error) {
    return NextResponse.json(
      { error: '登录已过期喵~' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: [
    '/api/chats/:path*',
    '/api/stats/:path*',
    '/api/messages/:path*'
  ]
} 