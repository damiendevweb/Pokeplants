import { useEffect, useState } from 'react'
import type { Achievement } from '../data/achievements'

interface Props {
  achievements: Achievement[]
  onDone: () => void
}

export default function AchievementToast({ achievements, onDone }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (current >= achievements.length) {
      const t = setTimeout(onDone, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), 3000)
    return () => clearTimeout(t)
  }, [current, achievements.length, onDone])

  if (current >= achievements.length) return null

  const ach = achievements[current]

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-card pixel-border rounded-xl p-4 flex items-center gap-3 shadow-lg min-w-[280px]">
        <div className="text-4xl animate-bounce-in">{ach.icon}</div>
        <div>
          <p className="text-xs text-accent font-bold tracking-wider">SUCCÈS DÉBLOQUÉ !</p>
          <p className="text-sm font-bold">{ach.name}</p>
          <p className="text-xs text-text-muted">{ach.description}</p>
        </div>
        <div className="text-xs font-bold text-accent">+{ach.points} 💰</div>
      </div>
    </div>
  )
}
