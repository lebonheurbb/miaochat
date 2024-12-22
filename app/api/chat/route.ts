import { NextResponse } from 'next/server'
import { generateResponse } from '../../utils/deepseek'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: '消息不能为空喵~' },
        { status: 400 }
      )
    }

    const response = await generateResponse(message)
    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: error.message || '服务器出错了喵~' },
      { status: 500 }
    )
  }
} 