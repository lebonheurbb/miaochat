export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  chatId: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  userId: string
  createdAt: Date
  updatedAt: Date
} 