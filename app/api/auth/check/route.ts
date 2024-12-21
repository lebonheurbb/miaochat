import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { openDb } from '../../../lib/db'

export async function GET() {
  try {
    const cookieStore = cookies()
    const userEmail = cookieStore.get('userEmail')?.value

    if (!userEmail) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const db = await openDb()
    const user = await db.get('SELECT id, email, nickname FROM users WHERE email = ?', [userEmail])

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('检查登录状态失败:', error)
    return NextResponse.json({ error: '检查登录状态失败' }, { status: 500 })
  }
} 