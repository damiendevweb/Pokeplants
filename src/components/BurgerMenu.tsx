import { useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function BurgerMenu({ open, onClose }: Props) {
  const { user, signOut } = useAuth()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />

      <div
        className="absolute top-0 right-0 h-full w-72 bg-surface shadow-2xl animate-slide-in-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50">
          <p className="text-sm text-text-muted">Connecté en tant que</p>
          <p className="text-sm font-bold text-accent truncate">
            {user?.email?.split('@')[0] || 'Dresseur'}
          </p>
        </div>

        {/* Links */}
        <div className="flex-1 py-2">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-card transition-colors"
          >
            <span className="text-lg">👤</span>
            <span>Mon profil</span>
          </Link>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-card transition-colors"
          >
            <span className="text-lg">📜</span>
            <span>Mentions légales</span>
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-card transition-colors"
          >
            <span className="text-lg">🔒</span>
            <span>Politique de confidentialité</span>
          </a>
        </div>

        {/* Disconnect */}
        <div className="p-5 border-t border-border/50">
          <button
            onClick={() => { onClose(); signOut() }}
            className="w-full text-sm text-text-muted hover:text-red-400 transition-colors pixel-border px-3 py-2"
          >
            DÉCONNEXION
          </button>
        </div>
      </div>
    </div>
  )
}
