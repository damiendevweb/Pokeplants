import { useEffect, useState, useCallback, useRef } from 'react'

interface Discovery {
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

interface Props {
  discovery: Discovery
  onClose: () => void
}

const categoryConfig: Record<string, { color: string; label: string }> = {
  common: { color: 'from-blue-400 to-cyan-300', label: 'COMMUNE' },
  rare: { color: 'from-purple-400 to-pink-300', label: 'RARE' },
  legendary: { color: 'from-yellow-400 to-orange-300', label: 'LÉGENDAIRE' },
}

async function reverseGeocodeFull(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`,
      { headers: { 'User-Agent': 'PokePlants/1.0' } }
    )
    const data = await res.json()
    const a = data.address || {}
    const parts = [a.house_number, a.road, a.city || a.town || a.village, a.state || a.region, a.country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Adresse inconnue'
  } catch {
    return 'Adresse indisponible'
  }
}

export default function PlantDetailModal({ discovery, onClose }: Props) {
  const [address, setAddress] = useState('Chargement...')
  const [closing, setClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const species = discovery.plant_species as any
  const config = categoryConfig[species.category] || categoryConfig.common

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 250)
  }, [onClose])

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }, [handleClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  useEffect(() => {
    if (discovery.latitude != null && discovery.longitude != null) {
      reverseGeocodeFull(discovery.latitude, discovery.longitude).then(setAddress)
    } else {
      setAddress('Pas de localisation')
    }
  }, [discovery.latitude, discovery.longitude])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 transition-opacity duration-250 ${closing ? 'opacity-0' : mounted ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-surface w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden transition-all duration-250 ${
          closing
            ? 'translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0'
            : mounted
              ? 'translate-y-0 sm:scale-100 sm:opacity-100'
              : 'translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className={`h-56 bg-gradient-to-br ${config.color} relative flex items-center justify-center overflow-hidden`}>
          {discovery.image_url ? (
            <img
              src={discovery.image_url}
              alt={species.common_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-7xl animate-float">🌿</span>
          )}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white text-lg font-bold"
          >
            ✕
          </button>
          <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-gradient-to-r ${config.color} text-black font-bold`}>
            {config.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-14rem)]">
          {/* Name */}
          <div>
            <h2 className="text-lg font-bold">{species.common_name || species.scientific_name}</h2>
            <p className="text-sm text-text-muted italic">{species.scientific_name}</p>
          </div>

          {/* Infos */}
          <div className="space-y-3">
            {species.family && (
              <InfoRow icon="🧬" label="Famille" value={species.family} />
            )}
            {species.genus && (
              <InfoRow icon="🌱" label="Genre" value={species.genus} />
            )}
            <InfoRow
              icon="📅"
              label="Découverte le"
              value={new Date(discovery.discovered_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
            <div className="border-t border-border/50 pt-3">
              <p className="text-sm text-text-muted flex items-start gap-2">
                <span className="text-base flex-shrink-0">📍</span>
                <span>{address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-muted flex items-center gap-2">
        <span className="text-base">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  )
}
