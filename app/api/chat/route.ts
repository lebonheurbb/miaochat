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
    
    return NextResponse.json({ message: response })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: '喵呜~ 出了点小问题，让我休息一下再试试吧！' },
      { status: 500 }
    )
  }
} 