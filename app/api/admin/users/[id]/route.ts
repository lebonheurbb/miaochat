import { NextResponse } from 'next/server'
import { openDb } from '../../../../lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await openDb()
    
    const user = await db.get(
      'SELECT id, email, nickname, created_at FROM users WHERE id = ?',
      [params.id]
    )
    
    await db.close()
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { nickname } = await request.json()
    
    if (!nickname) {
      return NextResponse.json(
        { error: '昵称不能为空' },
        { status: 400 }
      )
    }
    
    const db = await openDb()
    
    // 检查用户是否存在
    const user = await db.get('SELECT id FROM users WHERE id = ?', [params.id])
    if (!user) {
      await db.close()
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }
    
    // 更新用户昵称
    await db.run(
      'UPDATE users SET nickname = ? WHERE id = ?',
      [nickname, params.id]
    )
    
    await db.close()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { error: '更新用户信息失败' },
      { status: 500 }
    )
  }
} 