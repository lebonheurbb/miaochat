import { NextResponse } from 'next/server'
import { Server as SocketServer } from 'socket.io'

export const config = {
  runtime: 'nodejs',
  dynamic: 'force-dynamic'
}

declare global {
  var io: SocketServer | undefined
}

const initSocket = () => {
  if (!global.io) {
    global.io = new SocketServer({
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    global.io.on('connection', (socket) => {
      console.log('Client connected')

      socket.on('join', (chatId) => {
        socket.join(chatId)
        console.log(`Client joined chat: ${chatId}`)
      })

      socket.on('leave', (chatId) => {
        socket.leave(chatId)
        console.log(`Client left chat: ${chatId}`)
      })

      socket.on('message', (data) => {
        const { chatId, message } = data
        global.io?.to(chatId).emit('message', message)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })
    })
  }
  return global.io
}

export async function GET() {
  try {
    initSocket()
    return new NextResponse('Socket server is running', { status: 200 })
  } catch (error) {
    console.error('Socket initialization error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST() {
  try {
    initSocket()
    return new NextResponse('Socket server is running', { status: 200 })
  } catch (error) {
    console.error('Socket initialization error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 