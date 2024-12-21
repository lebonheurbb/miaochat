import { NextResponse } from 'next/server'
import { openDb } from '../../lib/db'

export async function GET() {
  try {
    const db = await openDb()
    
    // 获取用户数
    const { userCount } = await db.get('SELECT COUNT(*) as userCount FROM users')
    
    // 获取对话数
    const { conversationCount } = await db.get('SELECT COUNT(*) as conversationCount FROM conversations')
    
    // 获取消息数
    const { messageCount } = await db.get('SELECT COUNT(*) as messageCount FROM messages')
    
    return NextResponse.json({
      users: userCount,
      conversations: conversationCount,
      messages: messageCount
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
  }
} 