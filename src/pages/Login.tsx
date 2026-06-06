import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = mode === 'login'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, displayName || email.split('@')[0])
    setLoading(false)
    if (err) {
      setError(err)
    } else if (mode === 'signup') {
      setError('Compte créé ! Vérifie tes emails pour confirmer.')
      setMode('login')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10 animate-slide-up">
        <div className="text-7xl mb-4 animate-float">🌿</div>
        <h1 className="text-4xl font-bold text-accent tracking-widest mb-2">POKÉPLANTS</h1>
        <p className="text-text-muted text-sm tracking-wider">Attrapez-les toutes !</p>
      </div>

      <div className="w-full max-w-sm space-y-4 animate-slide-up">
        <button
          onClick={signInWithGoogle}
            className="w-full pixel-btn bg-white text-text font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">G</span>
          <span className="tracking-wider">Google</span>
        </button>

        <button
          onClick={signInWithFacebook}
          className="w-full pixel-btn bg-[#1877F2] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-colors"
        >
          <span className="text-xl">f</span>
          <span className="tracking-wider">Facebook</span>
        </button>

        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-text-muted/30" />
          <span className="text-text-muted text-sm tracking-wider">OU</span>
          <div className="flex-1 h-px bg-text-muted/30" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Ton pseudo de dresseur"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-dark px-4 py-3 rounded-xl pixel-border text-sm outline-none focus:border-primary transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-dark px-4 py-3 rounded-xl pixel-border text-sm outline-none focus:border-primary transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-dark px-4 py-3 rounded-xl pixel-border text-sm outline-none focus:border-primary transition-colors"
            required
          />

          {error && (
            <p className={`text-sm text-center ${error.includes('Vérifie') ? 'text-success' : 'text-red-400'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full pixel-btn bg-primary text-white font-bold py-3 px-4 rounded-xl tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted">
          {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-primary underline ml-1"
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  )
}
