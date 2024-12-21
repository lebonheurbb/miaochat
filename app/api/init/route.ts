import { NextResponse } from 'next/server'
import { initDb } from '../../lib/db'

export async function GET() {
  try {
    await initDb()
    return NextResponse.json({ message: '数据库初始化成功' })
  } catch (error) {
    console.error('初始化数据库失败:', error)
    return NextResponse.json({ error: '初始化数据库失败' }, { status: 500 })
  }
} 