import { Server as SocketServer } from 'socket.io'
import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { NextApiResponse } from 'next'

// 使用新的路由配置格式
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const initSocket = (req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any
    const io = new SocketServer(httpServer, {
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

    res.socket.server.io = io
  }
  res.end()
}

export const GET = initSocket
export const POST = initSocket 