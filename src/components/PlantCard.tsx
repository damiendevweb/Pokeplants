import { useState } from 'react'

interface Props {
  commonName: string
  scientificName: string
  family: string
  category: string
  imageUrl?: string
  discoveredAt: string
}

const categoryConfig: Record<string, { color: string; label: string }> = {
  common: { color: 'from-blue-400 to-cyan-300', label: 'COMMUNE' },
  rare: { color: 'from-purple-400 to-pink-300', label: 'RARE' },
  legendary: { color: 'from-yellow-400 to-orange-300', label: 'LÉGENDAIRE' },
}

export default function PlantCard(props: Props) {
  const [imgError, setImgError] = useState(false)
  const config = categoryConfig[props.category] || categoryConfig.common

  return (
    <div className="bg-card rounded-xl pixel-border overflow-hidden animate-slide-up hover:scale-[1.02] transition-transform">
      <div className={`h-32 bg-gradient-to-br ${config.color} flex items-center justify-center overflow-hidden`}>
        {props.imageUrl && !imgError ? (
          <img
            src={props.imageUrl}
            alt={props.commonName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-5xl animate-float">🌿</span>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{props.commonName}</h3>
            <p className="text-sm text-text-muted italic truncate">{props.scientificName}</p>
          </div>
          <span className={`text-sm px-2 py-1 rounded-full bg-gradient-to-r ${config.color} text-black font-bold ml-2`}>
            {config.label}
          </span>
        </div>

        {props.family && (
          <p className="text-sm text-text-muted">
            Famille: <span>{props.family}</span>
          </p>
        )}

        <p className="text-sm text-text-muted/60">
          {new Date(props.discoveredAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}
