import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (request.headers.get('upgrade') !== 'websocket') {
    return new NextResponse('Expected Upgrade: websocket', { status: 426 })
  }

  try {
    const { socket, response } = new WebSocket(request)

    socket.onopen = () => {
      console.log('Client connected')
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data.toString())
      if (data.type === 'join-chat') {
        console.log('Client joined chat:', data.chatId)
        // Handle join chat logic
      }
    }

    socket.onclose = () => {
      console.log('Client disconnected')
    }

    return response
  } catch (err) {
    console.error('WebSocket error:', err)
    return new NextResponse('WebSocket error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return new NextResponse('Method not allowed', { status: 405 })
} 