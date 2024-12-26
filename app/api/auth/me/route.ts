import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/app/lib/db'

export async function GET() {
  try {
    const userCookie = cookies().get('user')
    if (!userCookie?.value) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userData = JSON.parse(userCookie.value)
    const user = await prisma.user.findUnique({
      where: { email: userData.email },
      select: {
        id: true,
        email: true,
        nickname: true,
        bio: true,
        avatarUrl: true,
        points: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const userCookie = cookies().get('user')
    if (!userCookie?.value) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userData = JSON.parse(userCookie.value)
    const data = await req.json()

    // 只允许更新特定字段
    const allowedFields = ['nickname', 'bio', 'avatarUrl']
    const updateData = Object.keys(data).reduce((acc: any, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = data[key]
      }
      return acc
    }, {})

    const user = await prisma.user.update({
      where: { email: userData.email },
      data: updateData,
      select: {
        id: true,
        email: true,
        nickname: true,
        bio: true,
        avatarUrl: true,
        points: true,
      }
    })

    // 更新cookie
    cookies().set('user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: '更新用户信息失败' },
      { status: 500 }
    )
  }
} 