import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface LeaderboardEntry {
  user_id: string
  species_count: number
  rank_num: number
  display_name: string
}

const rankStyles: Record<number, string> = {
  1: 'bg-accent/20 border-accent',
  2: 'bg-gray-300/20 border-gray-400',
  3: 'bg-orange-400/20 border-orange-400',
}

const rankEmojis: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc('get_leaderboard')
      if (data) setEntries(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-xl pixel-border p-4">
        <p className="text-text-muted text-sm text-center">Chargement du classement...</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-xl pixel-border overflow-hidden">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-bold tracking-wider text-accent flex items-center gap-2">
          🏆 CLASSEMENT
        </h3>
      </div>
      <div className="divide-y divide-dark/50">
        {entries.map((entry) => {
          const rank = entry.rank_num
          const isMe = entry.user_id === user?.id
          return (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                rankStyles[rank] || ''
              } ${isMe ? 'ring-2 ring-primary/50' : ''}`}
            >
              <span className="text-sm font-bold w-8 text-center flex flex-col items-center leading-none">
                <span>{rankEmojis[rank] || ''}</span>
                <span className="text-text-muted text-xs">#{rank}</span>
              </span>
              <span className="text-sm font-bold flex-1 truncate">
                {entry.display_name}
              </span>
              <span className={`text-sm font-bold ${rank <= 3 ? 'text-accent' : 'text-text-muted'}`}>
                {entry.species_count} {entry.species_count > 1 ? 'espèces' : 'espèce'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
