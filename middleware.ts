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
    requestHeaders.set('x-user-id', payload.id as string)
    requestHeaders.set('x-user-email', payload.email as string)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
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
    '/api/stats/:path*'
  ]
} 