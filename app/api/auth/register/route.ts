import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from '@node-rs/bcrypt'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse('User already exists', { status: 409 })
    }

    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    return NextResponse.json({ 
      id: user.id,
      email: user.email,
      name: user.name
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 