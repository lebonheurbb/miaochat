import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/prisma'

export async function GET(
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

    const chat = await prisma.chat.findUnique({
      where: {
        id: params.id,
        userId: session.user.email,
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '请先登录喵~' },
        { status: 401 }
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