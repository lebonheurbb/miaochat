import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '../../../../../lib/prisma'
import { generateResponse } from '../../../../utils/deepseek'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '请先登录喵~' },
        { status: 401 }
      )
    }

    const { message } = await request.json() as { message: string }
    if (!message) {
      return NextResponse.json(
        { error: '消息不能为空喵~' },
        { status: 400 }
      )
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: params.id,
        userId: session.user.email,
      },
    })

    if (!chat) {
      return NextResponse.json(
        { error: '找不到这个对话喵~' },
        { status: 404 }
      )
    }

    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        chatId: params.id,
      },
    })

    const aiResponse = await generateResponse(message)
    if (!aiResponse) {
      throw new Error('AI响应为空')
    }
    
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        chatId: params.id,
      },
    })

    return NextResponse.json({
      messages: [userMessage, aiMessage],
    })
  } catch (error: any) {
    console.error('Error in messages route:', error)
    return NextResponse.json(
      { error: error.message || '服务器出错了喵~' },
      { status: 500 }
    )
  }
} 