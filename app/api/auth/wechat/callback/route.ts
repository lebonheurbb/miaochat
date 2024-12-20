import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return new Response('Missing code', { status: 400 })
  }

  try {
    // 调用我们的 API 处理微信登录
    const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/wechat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    // 设置登录 cookie
    cookies().set('user', JSON.stringify({
      openid: data.openid,
      nickname: data.nickname,
      avatarUrl: data.avatar,
      provider: 'wechat'
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    // 重定向到聊天页面
    return NextResponse.redirect(new URL('/chat', process.env.NEXT_PUBLIC_DOMAIN))
  } catch (error) {
    console.error('WeChat callback error:', error)
    return NextResponse.redirect(new URL('/login?error=wechat_login_failed', process.env.NEXT_PUBLIC_DOMAIN))
  }
} 