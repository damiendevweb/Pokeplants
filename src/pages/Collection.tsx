import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PlantCard from '../components/PlantCard'
import PlantDetailModal from '../components/PlantDetailModal'

interface PlantDiscovery {
  id: number
  discovered_at: string
  image_url: string
  latitude: number | null
  longitude: number | null
  plant_species: {
    scientific_name: string
    common_name: string
    family: string
    genus: string
    category: string
  }
}

type FilterType = 'all' | 'common' | 'rare' | 'legendary'
type SortType = 'recent' | 'name' | 'rarity'

export default function Collection() {
  const { user } = useAuth()
  const [discoveries, setDiscoveries] = useState<PlantDiscovery[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('recent')
  const [search, setSearch] = useState('')
  const [selectedDiscovery, setSelectedDiscovery] = useState<PlantDiscovery | null>(null)

  useEffect(() => {
    if (!user) return
    loadDiscoveries()
  }, [user])

  const loadDiscoveries = async () => {
    const { data } = await supabase
      .from('discoveries')
      .select('id, discovered_at, image_url, latitude, longitude, plant_species (scientific_name, common_name, family, genus, category)')
      .eq('user_id', user!.id)
      .order('discovered_at', { ascending: false })

    if (data) setDiscoveries(data as any)
    setLoading(false)
  }

  let filtered = [...discoveries]

  if (filter !== 'all') {
    filtered = filtered.filter(d => (d.plant_species as any).category === filter)
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(d =>
      (d.plant_species as any).common_name?.toLowerCase().includes(q) ||
      (d.plant_species as any).scientific_name?.toLowerCase().includes(q)
    )
  }

  if (sort === 'name') {
    filtered.sort((a, b) => (a.plant_species as any).common_name?.localeCompare((b.plant_species as any).common_name))
  } else if (sort === 'rarity') {
    const order: Record<string, number> = { legendary: 0, rare: 1, common: 2 }
    filtered.sort((a, b) => (order[(a.plant_species as any).category] || 0) - (order[(b.plant_species as any).category] || 0))
  }

  const commonCount = discoveries.filter(d => (d.plant_species as any).category === 'common').length
  const rareCount = discoveries.filter(d => (d.plant_species as any).category === 'rare').length
  const legendaryCount = discoveries.filter(d => (d.plant_species as any).category === 'legendary').length

  const filterTabs: { key: FilterType; label: string; icon: string, count: number }[] = [
    { key: 'all', label: 'Tous', icon: '📋', count: discoveries.length },
    { key: 'common', label: 'Communes', icon: '🟦', count: commonCount },
    { key: 'rare', label: 'Rares', icon: '🟪', count: rareCount },
    { key: 'legendary', label: 'Légendaires', icon: '⭐', count: legendaryCount },
  ]

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-accent tracking-wider">POKÉPLANTS</h1>
        <div className="flex gap-1">
          <span className="text-sm bg-red-500/20 text-red-500 w-7 h-7 flex items-center justify-center rounded-full">{commonCount}</span>
          <span className="text-sm bg-purple-500/20 text-purple-500 w-7 h-7 flex items-center justify-center rounded-full">{rareCount}</span>
          <span className="text-sm bg-yellow-500/20 text-yellow-500 w-7 h-7 flex items-center justify-center rounded-full">{legendaryCount}</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="🔍 Rechercher une plante..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-dark px-4 py-2.5 rounded-xl pixel-border text-sm outline-none focus:border-primary transition-colors"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map(({ key, label, icon, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 pixel-btn text-sm font-bold py-2 px-3 rounded-xl tracking-wider transition-colors ${
              filter === key ? 'bg-primary text-white' : 'bg-card text-text-muted'
            }`}
          >
            {icon} {label} <span className="text-xs">({count})</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setSort('recent')}
          className={`text-sm px-2 py-1 rounded tracking-wider ${sort === 'recent' ? 'text-primary' : 'text-text-muted'}`}
        >
          Récents
        </button>
        <button
          onClick={() => setSort('name')}
          className={`text-sm px-2 py-1 rounded tracking-wider ${sort === 'name' ? 'text-primary' : 'text-text-muted'}`}
        >
          A-Z
        </button>
        <button
          onClick={() => setSort('rarity')}
          className={`text-sm px-2 py-1 rounded tracking-wider ${sort === 'rarity' ? 'text-primary' : 'text-text-muted'}`}
        >
          Rareté
        </button>
      </div>

      <Link
        to="/map"
        className="block w-full pixel-btn bg-card text-text-muted font-bold py-3 px-4 rounded-xl text-center tracking-wider hover:bg-[#d4c5a9] transition-colors text-sm"
      >
        🗺️ VOIR MES PLANTES SUR UNE CARTE
      </Link>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl animate-float">🌿</div>
          <p className="text-text-muted text-sm mt-2">Chargement...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-text-muted text-sm">
            {discoveries.length === 0
              ? "Aucune plante découverte ! Va scanner ta première plante."
              : "Aucun résultat pour ce filtre."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((d, i) => {
            const species = d.plant_species as any
            return (
              <div
                key={d.id}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="cursor-pointer"
                onClick={() => setSelectedDiscovery(d)}
              >
                <PlantCard
                  commonName={species.common_name || species.scientific_name}
                  scientificName={species.scientific_name}
                  family={species.family}
                  category={species.category}
                  imageUrl={d.image_url}
                  discoveredAt={d.discovered_at}
                />
              </div>
            )
          })}
        </div>
      )}

      {selectedDiscovery && (
        <PlantDetailModal
          discovery={selectedDiscovery}
          onClose={() => setSelectedDiscovery(null)}
        />
      )}
    </div>
  )
}
