import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id }
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function createUser(data: { email: string; password: string; name?: string }) {
  return prisma.user.create({
    data
  })
}

export async function updateUser(id: string, data: { name?: string; avatar?: string }) {
  return prisma.user.update({
    where: { id },
    data
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id }
  })
}

export async function getUsers() {
  return prisma.user.findMany()
}

export async function getStats() {
  const [users, chats, messages] = await Promise.all([
    prisma.user.count(),
    prisma.chat.count(),
    prisma.message.count()
  ])
  return { users, chats, messages }
} 