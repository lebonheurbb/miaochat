import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/app/lib/db'

export async function GET() {
  try {
    const headersList = headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: '请先登录喵~' },
        { status: 401 }
      )
    }

    const chats = await prisma.chat.findMany({
      where: {
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(chats)
  } catch (error: any) {
    console.error('Error in chats route:', error)
    return NextResponse.json(
      { error: error.message || '服务器出错了喵~' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const headersList = headers()
    const userId = headersList.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: '请先登录喵~' },
        { status: 401 }
      )
    }

    const chat = await prisma.chat.create({
      data: {
        userId,
      },
    })

    return NextResponse.json(chat)
  } catch (error: any) {
    console.error('Error in chats route:', error)
    return NextResponse.json(
      { error: error.message || '服务器出错了喵~' },
      { status: 500 }
    )
  }
} 