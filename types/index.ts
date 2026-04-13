export type Plan = 'FREE' | 'PRO' | 'TEAM'
export type ItemType = 'ARTICLE' | 'NOTE' | 'VOICE' | 'PDF' | 'SCREENSHOT' | 'BOOKMARK'
export type ItemStatus = 'PROCESSING' | 'READY' | 'FAILED'

export interface User {
  id: string
  clerkId: string
  email: string
  name: string | null
  avatarUrl: string | null
  plan: Plan
  itemCount: number
  createdAt: Date
}

export interface Item {
  id: string
  userId: string
  type: ItemType
  title: string
  url: string | null
  rawContent: string | null
  summary: string | null
  keyInsights: string[]
  tags: string[]
  fileKey: string | null
  status: ItemStatus
  isPublic: boolean
  publicSlug: string | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Connection {
  id: string
  userId: string
  title: string
  description: string | null
  strength: number
  items: Item[]
  createdAt: Date
}

export interface WeeklyDigest {
  id: string
  userId: string
  content: string
  weekStart: Date
  sentAt: Date
}

export const PLAN_LIMITS = {
  FREE: { items: 50, aiQueries: 10 },
  PRO:  { items: Infinity, aiQueries: Infinity },
  TEAM: { items: Infinity, aiQueries: Infinity },
} as const
