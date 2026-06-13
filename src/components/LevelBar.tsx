interface Props {
  level: number
  xp: number
  xpToNextLevel: number
  coins: number
  displayName?: string
}

export default function LevelBar({ level, xp, xpToNextLevel, coins, displayName }: Props) {
  const xpPercent = (xp / xpToNextLevel) * 100

  return (
    <div className="bg-card rounded-xl pixel-border p-4 animate-slide-up space-y-3">
      {displayName && (
        <h1 className="text-xl font-bold text-accent tracking-wider text-center">
          {displayName}
        </h1>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold tracking-wider text-accent">DRESSEUR NIVEAU {level}</h2>
        <div className="flex items-center gap-1 text-sm font-bold text-accent">
          <span>💰</span> {coins}
        </div>
      </div>
      <div className="w-full h-3 bg-dark rounded-full overflow-hidden pixel-border">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(xpPercent, 100)}%` }}
        />
      </div>
      <p className="text-sm text-text-muted">XP: {xp} / {xpToNextLevel} · +{(level + 1) * 50} 💰 au prochain niveau</p>
    </div>
  )
}
