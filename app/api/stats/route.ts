import { NextResponse } from 'next/server'
import { getStats } from '@/lib/db'

export async function GET() {
  try {
    const stats = await getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 