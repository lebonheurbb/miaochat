import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/app/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password, nickname } = await req.json()

    // 验证邮箱格式
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 创建新用户
    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: nickname || email.split('@')[0],
        points: 50  // 默认赠送50积分
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        points: true,
      }
    })

    // 记录积分历史
    await prisma.pointsHistory.create({
      data: {
        userId: user.id,
        points: 50,
        reason: '注册赠送积分'
      }
    })

    // 设置cookie
    cookies().set('user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return NextResponse.json(user)

  } catch (error: any) {
    console.error('Registration error:', error)
    
    // 处理具体的错误类型
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }
    
    if (error?.message) {
      return NextResponse.json(
        { error: `注册失败: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
} 