import { useEffect } from 'react'
import type { Achievement } from '../data/achievements'

interface Props {
  achievements: Achievement[]
  onDone: () => void
}

export default function AchievementToast({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 100)
    return () => clearTimeout(timer)
  }, [onDone])
  return null
}
