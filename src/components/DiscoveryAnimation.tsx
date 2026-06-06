import { useEffect, useState } from 'react'

interface Props {
  plantName: string
  category: string
  imageUrl: string
  onComplete: () => void
}

const categoryColors: Record<string, string> = {
  common: 'from-blue-400 to-cyan-300',
  rare: 'from-purple-400 to-pink-300',
  legendary: 'from-yellow-400 to-orange-300',
}

const categoryEmojis: Record<string, string> = {
  common: '🟦',
  rare: '🟪',
  legendary: '⭐',
}

export default function DiscoveryAnimation({ plantName, category, imageUrl, onComplete }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500)
    const t2 = setTimeout(() => setStep(2), 3500)
    const t3 = setTimeout(() => setStep(3), 5500)
    const t4 = setTimeout(onComplete, 7000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onComplete])

  const bgColor = categoryColors[category] || categoryColors.common

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center space-y-6 animate-bounce-in">

        {step === 0 && (
          <div className="space-y-4">
            <div className="text-8xl animate-pokeball-shake">🔴</div>
            <p className="text-white text-sm tracking-widest animate-pulse">Capture en cours...</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center animate-bounce-in overflow-hidden`}>
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-white text-lg font-bold tracking-wider animate-slide-up">{plantName}</p>
          </div>
        )}

        {step >= 2 && (
          <div className="space-y-4">
            <div className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center overflow-hidden animate-reveal`}>
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-white text-lg font-bold tracking-wider">{plantName}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm">{categoryEmojis[category]}</span>
              <span className="text-white text-sm tracking-wider uppercase font-bold">{category}</span>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step >= i ? 'bg-primary scale-125' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
