import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/app/lib/db'

export const runtime = 'edge'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: '请先登录喵~' },
        { status: 401 }
      )
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!chat) {
      return NextResponse.json(
        { error: '找不到这个对话喵~' },
        { status: 404 }
      )
    }

    const { content, role = 'user' } = await request.json()

    const message = await prisma.message.create({
      data: {
        content,
        role,
        chatId: params.id,
      },
    })

    return NextResponse.json(message)
  } catch (error: any) {
    console.error('Error in messages route:', error)
    return NextResponse.json(
      { error: error.message || '服务器出错了喵~' },
      { status: 500 }
    )
  }
} 