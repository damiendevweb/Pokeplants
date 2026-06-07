import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ACHIEVEMENTS, CATEGORY_META, type AchievementCategory } from '../data/achievements'
import { getUnlockedAchievements } from '../services/achievementService'
import AchievementBadge from '../components/AchievementBadge'

export default function Achievements() {
  const { user } = useAuth()
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<AchievementCategory | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUnlockedAchievements(user.id).then((set) => {
      setUnlocked(set)
      setLoading(false)
    })
  }, [user])

  const tabs: { key: AchievementCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Tous', icon: '🏆' },
    { key: 'scan', label: 'Scan', icon: '📷' },
    { key: 'collection', label: 'Collection', icon: '🌿' },
    { key: 'exploration', label: 'Exploration', icon: '🗺️' },
    { key: 'progression', label: 'Progression', icon: '⭐' },
    { key: 'streak', label: 'Séries', icon: '🔥' },
  ]

  const filtered = activeTab === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter((a) => a.category === activeTab)

  const totalUnlocked = unlocked.size

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-24">
      <h1 className="text-lg font-bold text-accent tracking-wider text-center">SUCCÈS</h1>

      <div className="bg-card rounded-xl pixel-border p-4 text-center">
        <p className="text-3xl font-bold">{totalUnlocked}/{ACHIEVEMENTS.length}</p>
        <p className="text-sm text-text-muted">succès débloqués</p>
        <div className="mt-2 w-full h-3 bg-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all"
            style={{ width: `${(totalUnlocked / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-bold pixel-border transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'bg-card text-text-muted hover:bg-dark'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl animate-float">🏆</div>
          <p className="text-text-muted text-sm mt-2">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTab !== 'all' && (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_META[activeTab].color} flex items-center justify-center text-lg`}>
                {CATEGORY_META[activeTab].icon}
              </div>
              <span className="text-sm font-bold">{CATEGORY_META[activeTab].label}</span>
              <span className="text-xs text-text-muted">
                ({filtered.filter((a) => unlocked.has(a.id)).length}/{filtered.length})
              </span>
            </div>
          )}
          {filtered.map((ach) => (
            <AchievementBadge key={ach.id} achievement={ach} unlocked={unlocked.has(ach.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
