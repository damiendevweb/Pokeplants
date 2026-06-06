export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'collection' | 'scan' | 'rare' | 'social' | 'special'
  points: number
  condition: (stats: any) => boolean
}

export const ACHIEVEMENTS: Achievement[] = []

export const CATEGORY_META: Record<string, { label: string; icon: string }> = {}
