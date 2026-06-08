import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
const API_KEY = process.env.VITE_PLANT_ID_API_KEY

async function getFrenchName(scientificName) {
  const url = `https://plant.id/api/v3/kb/plants/name_search?q=${encodeURIComponent(scientificName)}&lang=fr&limit=1`

  const res = await fetch(url, { headers: { 'Api-Key': API_KEY } })
  if (!res.ok) return null

  const { entities } = await res.json()
  if (!entities?.length) return null

  const detailUrl = `https://plant.id/api/v3/kb/plants/${entities[0].access_token}?details=common_names&lang=fr`
  const detailRes = await fetch(detailUrl, { headers: { 'Api-Key': API_KEY } })
  if (!detailRes.ok) return null

  const detail = await detailRes.json()
  return detail?.common_names?.[0] || null
}

async function main() {

  const { data: plants, error } = await supabase
    .from('plant_species')
    .select('id, scientific_name, common_name')

  if (error) { console.error('Erreur Supabase:', error.message); return }
  if (!plants?.length) { console.log('Aucune plante trouvée.'); return }

  for (const plant of plants) {
    process.stdout.write(`${plant.scientific_name}... `)
    const frenchName = await getFrenchName(plant.scientific_name)

    if (frenchName && frenchName !== plant.common_name) {
      const { error: updateError } = await supabase
        .from('plant_species')
        .update({ common_name: frenchName })
        .eq('id', plant.id)

      if (updateError) {
        console.log(`❌ ${updateError.message}`)
      } else {
        console.log(`✅ "${frenchName}"`)
      }
    } else if (!frenchName) {
      console.log('⚠️  aucun nom français trouvé')
    } else {
      console.log('➡️  déjà bon')
    }

    // petit délai pour pas spammer l'API
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n✨ Terminé !')
}

main().catch(console.error)
