import { jwtVerify, SignJWT } from 'jose'
import prisma from './db'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-this'
)

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

export async function signToken(payload: any) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)
    return token
  } catch (error) {
    return null
  }
}

export async function getCurrentUser(token: string) {
  try {
    const payload = await verifyToken(token)
    if (!payload || !payload.userId) return null
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string }
    })
    return user
  } catch (error) {
    return null
  }
} 