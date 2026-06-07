const PLANTNET_API_KEY = import.meta.env.VITE_PLANTNET_API_KEY

export interface IdentificationResult {
  id: string
  scientificName: string
  commonName: string
  family: string
  genus: string
  probability: number
  imageUrl: string
  similarImages: string[]
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64)
  const byteNumbers = new Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i)
  }
  return new Blob([new Uint8Array(byteNumbers).buffer], { type: mimeType })
}

export async function identifyPlant(imageBase64: string): Promise<IdentificationResult[]> {
  const hasPrefix = imageBase64.includes('base64,')
  const base64Data = hasPrefix ? imageBase64.split(',')[1] : imageBase64
  const mimeType = hasPrefix
    ? imageBase64.split(',')[0].split(':')[1].split(';')[0]
    : 'image/jpeg'
  const blob = base64ToBlob(base64Data, mimeType)

  const formData = new FormData()
  formData.append('images', blob, 'plant.jpg')
  formData.append('organs', 'auto')

  const url = `/api/plantnet/v2/identify/all?api-key=${PLANTNET_API_KEY}&lang=fr`

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Aucune plante identifiée. Réessaye avec une photo plus nette.')
  }

  const data = await response.json()

  console.log('🌿 PlantNet - Réponse complète :', JSON.stringify(data, null, 2))
  console.log('🌿 PlantNet - Premier résultat :', data.results?.[0])

  if (!data.results?.length) {
    throw new Error('Aucune plante identifiée')
  }

  return data.results.map((r: any) => ({
    id: r.species?.scientificNameWithoutAuthor || '',
    scientificName: r.species?.scientificNameWithoutAuthor || '',
    commonName: r.species?.commonNames?.[0] || r.species?.scientificNameWithoutAuthor || '',
    family: r.species?.family?.scientificNameWithoutAuthor || '',
    genus: r.species?.genus?.scientificNameWithoutAuthor || '',
    probability: Math.round(r.score * 100),
    imageUrl: '',
    similarImages: [],
  }))
}
