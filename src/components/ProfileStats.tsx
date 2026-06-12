import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface ProfileStats {
  createdAt: string | null
  discoveryCount: number
  itemCount: number
  topRegion: string
  topFamily: string
  topFamilyCount: number
}

const nominatimCache = new Map<string, string>()

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = `${lat.toFixed(1)},${lng.toFixed(1)}`
  if (nominatimCache.has(key)) return nominatimCache.get(key)!
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`,
      { headers: { 'User-Agent': 'PokePlants/1.0' } }
    )
    const data = await res.json()
    const region =
      data.address?.state ||
      data.address?.region ||
      data.address?.county ||
      data.address?.country ||
      'Inconnu'
    nominatimCache.set(key, region)
    return region
  } catch {
    nominatimCache.set(key, 'Inconnu')
    return 'Inconnu'
  }
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-text-muted flex items-center gap-2">
        <span className="text-base">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-bold text-text">{value}</span>
    </div>
  )
}

export default function ProfileStatsSection({ userId, itemCount }: { userId?: string; itemCount?: number }) {
  const [stats, setStats] = useState<ProfileStats | null>(null)

  useEffect(() => {
    if (!userId) return

    const load = async () => {
      const [{ data: profile }, { count: discoveryCount }, { data: discoveries }] = await Promise.all([
        supabase.from('user_stats').select('created_at').eq('user_id', userId).maybeSingle(),
        supabase.from('discoveries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('discoveries').select('latitude, longitude, plant_species!inner(family)').eq('user_id', userId),
      ])

      let topFamily = 'Non classifié'
      let topFamilyCount = 0
      if (discoveries && discoveries.length > 0) {
        const familyCounts = new Map<string, number>()
        for (const d of discoveries) {
          const family = (d as any).plant_species?.family
          if (family) {
            familyCounts.set(family, (familyCounts.get(family) || 0) + 1)
          }
        }
        for (const [family, count] of familyCounts) {
          if (count > topFamilyCount) {
            topFamilyCount = count
            topFamily = family
          }
        }
      }

      let topRegion = 'Inconnu'
      if (discoveries && discoveries.length > 0) {
        const zoneCounts = new Map<string, { lat: number; lng: number; count: number }>()
        for (const d of discoveries) {
          const lat = (d as any).latitude
          const lng = (d as any).longitude
          if (lat == null || lng == null) continue
          const key = `${Number(lat).toFixed(1)},${Number(lng).toFixed(1)}`
          const existing = zoneCounts.get(key)
          if (existing) {
            existing.count++
          } else {
            zoneCounts.set(key, { lat: Number(lat), lng: Number(lng), count: 1 })
          }
        }
        let maxZone = { lat: 0, lng: 0, count: 0 }
        for (const zone of zoneCounts.values()) {
          if (zone.count > maxZone.count) maxZone = zone
        }
        if (maxZone.count > 0) {
          topRegion = await reverseGeocode(maxZone.lat, maxZone.lng)
        }
      }

      setStats({
        createdAt: profile?.created_at ?? null,
        discoveryCount: discoveryCount ?? 0,
        itemCount: itemCount ?? 0,
        topRegion,
        topFamily,
        topFamilyCount,
      })
    }

    load()
  }, [userId, itemCount])

  if (!stats) return null

  return (
    <div className="bg-card rounded-xl pixel-border p-4 space-y-3 animate-slide-up">
      <h3 className="text-sm font-bold tracking-wider text-accent">📊 STATISTIQUES</h3>
      <StatRow
        icon="📅"
        label="Membre depuis"
        value={
          stats.createdAt
            ? new Date(stats.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Inconnu'
        }
      />
      <StatRow icon="🌿" label="Plantes découvertes" value={stats.discoveryCount} />
      <StatRow icon="🛍️" label="Objets possédés" value={stats.itemCount} />
      <StatRow icon="🗺️" label="Région favorite" value={stats.topRegion} />
      <StatRow
        icon="🧬"
        label="Famille de plantes les plus scannées"
        value={
          stats.topFamilyCount > 0
            ? `${stats.topFamily} (${stats.topFamilyCount})`
            : 'Aucune donnée'
        }
      />
    </div>
  )
}
