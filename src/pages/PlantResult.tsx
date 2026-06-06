import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import DiscoveryAnimation from '../components/DiscoveryAnimation'
import AchievementToast from '../components/AchievementToast'
import type { IdentificationResult } from '../services/plantApi'
import { FAMILY_RARITY } from '../data/plantFamilies'
import type { Achievement } from '../data/achievements'
import { checkAndUnlockAchievements } from '../services/achievementService'

interface LocationState {
  results: IdentificationResult[]
  imageUrl: string
  coords?: { latitude: number; longitude: number } | null
}

export default function PlantResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const state = location.state as LocationState | null
  const [selected, setSelected] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [savedPlantName, setSavedPlantName] = useState('')
  const [savedCategory, setSavedCategory] = useState('common')
  const [savedImage, setSavedImage] = useState('')
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    if (!state) navigate('/scan')
  }, [state, navigate])

  if (!state) return null

  const { results, imageUrl, coords } = state
  const plant = results[selected]

  console.log('🌿 Plante sélectionnée :', plant)
  console.log('🌿 Famille reçue de l\'API :', `"${plant.family}"`)
  console.log('🌿 Catégorie trouvée dans le mapping :', FAMILY_RARITY[plant.family] || 'common (fallback)')

  const determineCategory = (family: string): string => {
    return FAMILY_RARITY[family] || 'common'
  }

  const handleConfirm = async () => {
    if (!user) return
    setSaving(true)

    try {
      const category = determineCategory(plant.family)

      const { data: existing } = await supabase
        .from('plant_species')
        .select('id')
        .eq('scientific_name', plant.scientificName)
        .maybeSingle()

      let speciesId: number
      if (existing) {
        speciesId = existing.id
        await supabase
          .from('plant_species')
          .update({ category, common_name: plant.commonName, family: plant.family })
          .eq('id', speciesId)
      } else {
        const { data: newSpecies, error: insertError } = await supabase
          .from('plant_species')
          .insert({
            scientific_name: plant.scientificName,
            common_name: plant.commonName,
            family: plant.family,
            genus: plant.genus,
            category,
            image_url: plant.imageUrl,
          })
          .select('id')
          .single()

        if (insertError || !newSpecies) {
          throw new Error(insertError?.message || "Erreur lors de l'ajout de l'espèce")
        }
        speciesId = newSpecies.id
      }

      const { error } = await supabase.from('discoveries').insert({
        user_id: user.id,
        plant_species_id: speciesId,
        image_url: imageUrl,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      })

      if (error) {
        if (error.code === '23505') {
          alert('Cette plante a déjà été découverte !')
          navigate('/collection')
          return
        }
        throw error
      }

      setSavedPlantName(plant.commonName)
      setSavedCategory(category)
      setSavedImage(plant.imageUrl)
      setShowAnimation(true)

      const xpAmount = category === 'legendary' ? 200 : category === 'rare' ? 100 : 50
      await supabase.rpc('add_xp', { p_user_id: user.id, p_amount: xpAmount })

      const achs = await checkAndUnlockAchievements(user.id)
      if (achs.length > 0) setNewAchievements(achs)
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleAnimationComplete = () => {
    setShowAnimation(false)
    navigate('/collection')
  }

  const category = determineCategory(plant.family)
  const categoryColor =
    category === 'legendary' ? 'from-yellow-400 to-orange-300 text-white' :
    category === 'rare' ? 'from-purple-400 to-pink-300 text-white' :
    'from-blue-400 to-cyan-300 text-white'

  return (
    <>
      <div className="py-6 space-y-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-accent tracking-wider text-center">RÉSULTAT</h1>

        <div className="bg-card rounded-xl pixel-border overflow-hidden">
          <div className={`h-48 bg-gradient-to-br ${categoryColor} flex items-center justify-center`}>
            <img src={imageUrl} alt="Scan" className="h-full w-full object-cover" />
          </div>

          <div className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{plant.commonName}</h2>
                <p className="text-sm text-text-muted italic">(Nom scientifique: {plant.scientificName})</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full bg-gradient-to-r ${categoryColor} font-bold`}>
                {category.toUpperCase()}
              </span>
            </div>

            <div className="w-full h-3 bg-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success to-accent rounded-full transition-all"
                style={{ width: `${plant.probability}%` }}
              />
            </div>
            <p className="text-sm text-text-muted text-right">{plant.probability}% de correspondance</p>

            {plant.family && (
              <p className="text-sm text-text-muted">
                Famille: <span>{plant.family}</span>
              </p>
            )}
            {plant.genus && (
              <p className="text-sm text-text-muted">
                Genre: <span>{plant.genus}</span>
              </p>
            )}
          </div>
        </div>

        {results.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm text-text-muted tracking-wider">Autres suggestions :</p>
            <div className="grid grid-cols-2 gap-2">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`p-3 rounded-xl pixel-border text-left transition-all ${
                    selected === i ? 'bg-primary/20 border-primary' : 'bg-card'
                  }`}
                >
                  <p className="text-sm font-bold truncate">{r.commonName}</p>
                  <p className="text-sm text-text-muted">{r.probability}%</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/scan')}
            className="flex-1 pixel-btn bg-dark font-bold py-3 rounded-xl tracking-wider hover:bg-[#c4b599] transition-colors text-sm"
          >
            ↺ RESCANNER
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 pixel-btn bg-success text-white font-bold py-3 rounded-xl tracking-wider hover:bg-green-500 transition-colors text-sm disabled:opacity-50"
          >
            {saving ? 'SAUVEGARDE...' : '✓ CONFIRMER'}
          </button>
        </div>
      </div>

      {showAnimation && (
        <DiscoveryAnimation
          plantName={savedPlantName}
          category={savedCategory}
          imageUrl={savedImage}
          onComplete={handleAnimationComplete}
        />
      )}

      {newAchievements.length > 0 && (
        <AchievementToast
          achievements={newAchievements}
          onDone={() => setNewAchievements([])}
        />
      )}
    </>
  )
}
