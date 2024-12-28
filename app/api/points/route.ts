import { NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

// 获取用户积分
export async function GET(req: Request) {
  try {
    const userCookie = cookies().get('user')
    if (!userCookie?.value) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userData = JSON.parse(userCookie.value)
    const user = await prisma.user.findUnique({
      where: { email: userData.email },
      select: { points: true }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({ points: user.points })
  } catch (error) {
    console.error('获取积分失败:', error)
    return NextResponse.json(
      { error: '获取积分失败' },
      { status: 500 }
    )
  }
}

// 更新用户积分
export async function POST(req: Request) {
  try {
    const userCookie = cookies().get('user')
    if (!userCookie?.value) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userData = JSON.parse(userCookie.value)
    const { amount, description } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 开始事务
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // 更新用户积分
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: amount } }
      })

      // 记录积分历史
      await tx.pointsHistory.create({
        data: {
          userId: user.id,
          points: amount,
          reason: description
        }
      })

      return updatedUser
    })

    return NextResponse.json({ points: result.points })
  } catch (error) {
    console.error('更新积分失败:', error)
    return NextResponse.json(
      { error: '更新积分失败' },
      { status: 500 }
    )
  }
} 