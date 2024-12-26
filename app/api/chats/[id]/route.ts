import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/app/lib/db'

export const runtime = 'edge'

export async function GET(
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
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!chat) {
      return NextResponse.json(
        { error: '找不到这个对话喵~' },
        { status: 404 }
      )
    }

    return NextResponse.json(chat)
  } catch (error: any) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: error.message || '服务器出错了喵~' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.chat.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: error.message || '服务器出错了喵~' },
      { status: 500 }
    )
  }
} 