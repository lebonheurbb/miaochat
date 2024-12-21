import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { openDb } from '@/app/lib/db'

// 添加新消息
export async function POST(request: Request) {
  const cookieStore = cookies()
  const email = cookieStore.get('user_email')?.value
  
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()
  const { chatId, role, content } = data
  
  if (!chatId || !role || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = await openDb()
  
  try {
    // 验证对话是否属于当前用户
    const chat = await db.get(
      'SELECT * FROM chats WHERE id = ? AND user_email = ?',
      [chatId, email]
    )
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
    
    // 添加新消息
    const result = await db.run(
      'INSERT INTO messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)',
      [chatId, role, content, Date.now()]
    )
    
    if (!result?.lastID) {
      throw new Error('Failed to insert message')
    }
    
    // 更新对话的最后更新时间
    await db.run(
      'UPDATE chats SET last_updated = ? WHERE id = ?',
      [Date.now(), chatId]
    )
    
    const message = {
      id: result.lastID,
      chat_id: chatId,
      role,
      content,
      created_at: Date.now()
    }
    
    return NextResponse.json(message)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      error: 'Failed to save message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 