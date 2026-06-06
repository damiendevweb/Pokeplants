import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import 'leaflet/dist/leaflet.css'

interface Discovery {
  id: number
  image_url: string
  latitude: number
  longitude: number
  plant_species: {
    common_name: string
    scientific_name: string
    category: string
  }
}

const pixelPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32" style="image-rendering:pixelated">
  <rect x="6" y="13" width="4" height="2" fill="#5c3a1e"/>
  <rect x="5" y="12" width="6" height="2" fill="#5c3a1e"/>
  <rect x="5" y="11" width="6" height="2" fill="#5c3a1e"/>
  <rect x="6" y="10" width="4" height="2" fill="#5c3a1e"/>
  <rect x="7" y="9" width="2" height="2" fill="#5c3a1e"/>
  <rect x="3" y="3" width="10" height="8" fill="#be2e3a" rx="0"/>
  <rect x="4" y="2" width="8" height="8" fill="#be2e3a" rx="0"/>
  <rect x="5" y="1" width="6" height="6" fill="#be2e3a" rx="0"/>
  <rect x="5" y="2" width="2" height="2" fill="#ffffff" opacity="0.4"/>
  <rect x="6" y="1" width="2" height="2" fill="#ffffff" opacity="0.2"/>
</svg>`

const pixelIcon = L.divIcon({
  html: pixelPinSvg,
  iconSize: [32, 32],
  iconAnchor: [16, 30],
  popupAnchor: [0, -28],
  className: '',
})

const categoryEmoji: Record<string, string> = {
  common: '🟦',
  rare: '🟪',
  legendary: '⭐',
}

export default function MapView() {
  const { user } = useAuth()
  const [discoveries, setDiscoveries] = useState<Discovery[]>([])
  const [loading, setLoading] = useState(true)
  const [userPos, setUserPos] = useState<[number, number]>([46.603354, 1.888334])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    )

    const load = async () => {
      const { data } = await supabase
        .from('discoveries')
        .select('id, image_url, latitude, longitude, plant_species (common_name, scientific_name, category)')
        .eq('user_id', user!.id)
        .not('latitude', 'is', null)

      if (data) setDiscoveries(data as any)
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="py-6 space-y-4 max-w-lg mx-auto pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-accent tracking-wider">MA CARTE</h1>
        <Link to="/collection" className="text-sm text-primary underline">
          ← Retour
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl animate-float">🗺️</div>
          <p className="text-text-muted text-sm mt-2">Chargement...</p>
        </div>
      ) : discoveries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📍</div>
          <p className="text-text-muted text-sm">Aucune plante géolocalisée</p>
          <p className="text-text-muted/60 text-sm mt-1">Accepte la localisation quand tu scannes !</p>
        </div>
      ) : (
        <div className="map-pixel rounded-xl pixel-border overflow-hidden" style={{ height: '400px' }}>
          <MapContainer
            center={userPos}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {discoveries.map((d) => (
              <Marker key={d.id} position={[d.latitude, d.longitude]} icon={pixelIcon}>
                <Popup>
                  <div className="text-center min-w-[120px]">
                    <img
                      src={d.image_url}
                      alt={d.plant_species.common_name}
                      className="w-16 h-16 rounded-lg object-cover mx-auto mb-1"
                    />
                    <p className="font-bold text-sm">{d.plant_species.common_name}</p>
                    <p className="text-xs text-gray-500 italic">{d.plant_species.scientific_name}</p>
                    <p className="text-xs mt-1">{categoryEmoji[d.plant_species.category] || ''} {d.plant_species.category}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <p className="text-center text-text-muted text-sm">
        {discoveries.length} plante{discoveries.length > 1 ? 's' : ''} sur la carte
      </p>
    </div>
  )
}
