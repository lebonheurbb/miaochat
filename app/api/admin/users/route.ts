import { NextResponse } from 'next/server'
import { openDb } from '../../../lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const limit = 10
    const offset = (page - 1) * limit

    const db = await openDb()
    
    // 构建搜索条件
    const searchCondition = search 
      ? "WHERE email LIKE ? OR nickname LIKE ?"
      : ""
    const searchValue = search 
      ? [`%${search}%`, `%${search}%`] 
      : []
    
    // 获取总用户数
    const { total } = await db.get(
      `SELECT COUNT(*) as total FROM users ${searchCondition}`,
      searchValue
    )
    
    // 获取用户列表
    const users = await db.all(`
      SELECT id, email, nickname, created_at 
      FROM users 
      ${searchCondition}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [...searchValue, limit, offset])
    
    await db.close()
    
    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' }, 
      { status: 500 }
    )
  }
} 