import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { identifyPlant } from '../services/plantApi'

interface Coords {
  latitude: number
  longitude: number
}

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [streaming, setStreaming] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const startCamera = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreaming(true)
      }
    } catch {
      setError('Impossible d\'accéder à la caméra. Utilise la galerie à la place.')
    }
  }, [])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setPreview(dataUrl)
    stopCamera()
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setStreaming(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  const requestLocation = (): Promise<Coords | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      )
    })
  }

  const handleIdentify = async () => {
    if (!preview) return
    setError('')
    setScanning(true)
    try {
      const base64 = preview.split(',')[1]
      const [results, coords] = await Promise.all([
        identifyPlant(base64),
        requestLocation(),
      ])
      console.log('🌿 Résultats d\'identification :', results)
      navigate('/plant-result', { state: { results, imageUrl: preview, coords } })
    } catch (err: any) {
      console.error('🌿 Erreur identification :', err)
      setError(err.message || 'Erreur lors de l\'identification')
      setScanning(false)
    }
  }

  const retake = () => {
    setPreview(null)
    setError('')
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-accent tracking-wider text-center">SCANNER</h1>

      {error && (
        <div className="bg-red-500/10 border-2 border-red-400 text-red-400 rounded-xl px-4 py-3 text-sm text-center">
          {error}
        </div>
      )}

      <div className="relative bg-dark rounded-xl pixel-border overflow-hidden aspect-square">
        {!streaming && !preview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
            <div className="text-6xl animate-float">🌿</div>
            <p className="text-text-muted text-sm">Prends une photo ou choisis dans la galerie</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${streaming ? 'block' : 'hidden'}`}
        />

        {preview && (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {streaming && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-scan-line" />
        )}
      </div>

      <div className="flex justify-center gap-3">
        {!streaming && !preview && (
          <>
            <button
              onClick={startCamera}
              className="pixel-btn bg-primary text-white font-bold py-3 px-6 rounded-xl tracking-wider hover:bg-red-700 transition-colors text-sm"
            >
              📷 CAMÉRA
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="pixel-btn bg-dark font-bold py-3 px-6 rounded-xl tracking-wider hover:bg-[#c4b599] transition-colors text-sm"
            >
              🖼 GALERIE
            </button>
          </>
        )}

        {streaming && (
          <button
            onClick={capturePhoto}
            className="pixel-btn bg-accent text-dark font-bold py-3 px-8 rounded-xl tracking-wider hover:bg-yellow-500 transition-colors"
          >
            📸 CAPTURER
          </button>
        )}

        {preview && (
          <>
            <button
              onClick={retake}
              className="pixel-btn bg-dark font-bold py-3 px-6 rounded-xl tracking-wider hover:bg-[#c4b599] transition-colors text-sm"
            >
              ↩ RETOUR
            </button>
            {!error && (
              <button
                onClick={handleIdentify}
                disabled={scanning}
                className="pixel-btn bg-success text-dark font-bold py-3 px-6 rounded-xl tracking-wider hover:bg-green-500 transition-colors text-sm disabled:opacity-50"
              >
                {scanning ? '🔍 ANALYSE...' : '🔍 IDENTIFIER'}
              </button>
            )}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="text-center pt-4 border-t border-dark/30">
        <p className="text-xs text-text-muted/60 leading-relaxed">
          The image-based plant species identification service used, is based on the{' '}
          <a href="https://my.plantnet.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            Pl@ntNet recognition API
          </a>, regularly updated and accessible through the site{' '}
          <a href="https://my.plantnet.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            https://my.plantnet.org/
          </a>
        </p>
      </div>
    </div>
  )
}
