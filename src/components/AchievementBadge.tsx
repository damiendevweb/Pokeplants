import type { Achievement } from '../data/achievements'

interface Props {
  achievement: Achievement
  unlocked: boolean
}

export default function AchievementBadge({ achievement, unlocked }: Props) {
  return (
    <div
      className={`relative pixel-border rounded-xl p-3 flex items-center gap-3 transition-all ${
        unlocked ? 'bg-card' : 'bg-dark/50 opacity-50 grayscale'
      }`}
    >
      <div className="text-3xl flex-shrink-0">{unlocked ? achievement.icon : '🔒'}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold truncate">{achievement.name}</p>
        <p className="text-xs text-text-muted">{achievement.description}</p>
      </div>
      <div className="text-xs font-bold text-accent flex-shrink-0">+{achievement.points} 💰 et XP</div>
      {unlocked && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-success rounded-full flex items-center justify-center text-white text-xs">
          ✓
        </div>
      )}
    </div>
  )
}
