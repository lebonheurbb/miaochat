import { NextResponse } from 'next/server'
import { Server as SocketServer } from 'socket.io'

declare global {
  var io: SocketServer | undefined
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

let io: SocketServer

if (!global.io) {
  io = new SocketServer({
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected')

    socket.on('join-chat', (chatId) => {
      console.log('Client joined chat:', chatId)
      socket.join(chatId)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  global.io = io
} else {
  io = global.io
}

export async function GET() {
  return new NextResponse(null, { status: 200 })
}

export async function POST() {
  return new NextResponse(null, { status: 200 })
} 