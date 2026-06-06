import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Leaderboard from '../components/Leaderboard'
import LevelBar from '../components/LevelBar'

interface UserStats {
  total_discoveries: number
  total_species: number
  level: number
  xp: number
  xp_to_next_level: number
  coins: number
}

interface RecentDiscovery {
  id: number
  discovered_at: string
  image_url: string
  plant_species: {
    scientific_name: string
    common_name: string
    category: string
  }
}

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [recent, setRecent] = useState<RecentDiscovery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadStats = async () => {
      const { data: userData } = await supabase
        .from('user_stats')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle()

      if (userData?.display_name) {
        setDisplayName(userData.display_name)
      }

      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (statsData) {
        setStats(statsData)
      } else {
        const { count: totalScans } = await supabase
          .from('discoveries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        const { count: totalUnique } = await supabase
          .from('discoveries')
          .select('plant_species_id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setStats({
          total_discoveries: totalScans || 0,
          total_species: totalUnique || 0,
          level: 1,
          xp: 0,
          xp_to_next_level: 100,
          coins: 0,
        })
      }

      const { data: recentData } = await supabase
        .from('discoveries')
        .select(`
          id,
          discovered_at,
          image_url,
          plant_species (scientific_name, common_name, category)
        `)
        .eq('user_id', user.id)
        .order('discovered_at', { ascending: false })
        .limit(3)

      if (recentData) setRecent(recentData as any)
      setLoading(false)
    }

    loadStats()
  }, [user])

  return (
    <div className="py-6 space-y-6 max-w-lg mx-auto">
      <div className="text-center animate-slide-up">
        <div className="text-5xl mb-2 animate-float">🌿</div>
        <p className="text-text-muted text-sm tracking-wider">
          Bienvenue, {displayName || user?.email?.split('@')[0] || 'Dresseur'} !
        </p>
      </div>

      {stats && (
        <LevelBar level={stats.level} xp={stats.xp} xpToNextLevel={stats.xp_to_next_level} coins={stats.coins} />
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl pixel-border p-3 text-center">
          <div className="text-2xl mb-1">📷</div>
           <div className="text-lg font-bold">{stats?.total_discoveries || 0}</div>
            <div className="text-sm text-text-muted">Scans</div>
        </div>
        <div className="bg-card rounded-xl pixel-border p-3 text-center">
          <div className="text-2xl mb-1">🌿</div>
           <div className="text-lg font-bold">{stats?.total_species || 0}</div>
            <div className="text-sm text-text-muted">Espèces</div>
        </div>
        <div className="bg-card rounded-xl pixel-border p-3 text-center">
          <div className="text-2xl mb-1">⭐</div>
           <div className="text-lg font-bold">{stats?.level || 1}</div>
            <div className="text-sm text-text-muted">Niveau</div>
        </div>
      </div>

      <Leaderboard />

      <Link
        to="/scan"
        className="block w-full pixel-btn bg-primary text-white font-bold py-4 px-6 rounded-xl text-center tracking-wider hover:bg-red-700 transition-colors animate-pulse-glow"
      >
        📷 SCANNER UNE PLANTE
      </Link>

      {recent.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-wider text-accent">DERNIÈRES DÉCOUVERTES</h3>
          <div className="grid grid-cols-3 gap-2">
              {recent.map((r, i) => (
              <div key={i} className="bg-card rounded-xl pixel-border overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="h-16 bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center">
                  <span className="text-2xl">🌿</span>
                </div>
                <div className="p-2">
                  <p className="text-sm font-bold truncate">{r.plant_species?.common_name}</p>
                  <p className="text-sm text-text-muted">{r.plant_species?.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && stats?.total_species === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-text-muted text-sm mb-2">Aucune plante découverte</p>
          <p className="text-text-muted/60 text-sm">Scanne ta première plante pour commencer l'aventure !</p>
        </div>
      )}
    </div>
  )
}
