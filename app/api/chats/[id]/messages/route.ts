import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { generateResponse } from '@/app/utils/deepseek'
import { Server } from 'socket.io'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await request.json()

    // 添加用户消息
    const chat = await prisma.chat.update({
      where: { id: params.id },
      data: {
        messages: {
          create: {
            role: 'user',
            content
          }
        },
        updatedAt: new Date()
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    // 发送用户消息更新
    const io = (global as any).io
    if (io) {
      io.to(params.id).emit('message-update', chat)
    }

    // 生成 AI 响应
    const aiResponse = await generateResponse(content)

    // 添加 AI 响应
    const updatedChat = await prisma.chat.update({
      where: { id: params.id },
      data: {
        messages: {
          create: {
            role: 'assistant',
            content: aiResponse
          }
        },
        updatedAt: new Date()
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    // 发送 AI 响应更新
    if (io) {
      io.to(params.id).emit('message-update', updatedChat)
    }

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error('Failed to add message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 