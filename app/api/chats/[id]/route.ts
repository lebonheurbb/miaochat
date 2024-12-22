import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

// 获取单个对话
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chat = await prisma.chat.findUnique({
      where: { id: params.id },
      include: { messages: true }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // 验证用户是否有权限访问该对话
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (chat.userId !== user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Failed to get chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新对话标题
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title } = await request.json()

    const chat = await prisma.chat.update({
      where: { id: params.id },
      data: { title },
      include: { messages: true }
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Failed to update chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 