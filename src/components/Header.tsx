import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import BurgerMenu from './BurgerMenu'

export const TOP_HEADER_H = 'h-14'
export const BOTTOM_NAV_H = 'h-16'

export default function Header() {
  const { user } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user || location.pathname === '/login') return null

  const isActive = (path: string) =>
    location.pathname === path ? 'text-accent' : 'text-text-muted'

  const navItems = [
    { path: '/', label: 'Accueil', icon: '🏠' },
    { path: '/scan', label: 'Scanner', icon: '📷' },
    { path: '/collection', label: 'PokéPlants', icon: '🌿' },
    { path: '/leaderboard', label: 'Classement', icon: '🏆' },
    { path: '/achievements', label: 'Succès', icon: '🎖️' },
  ]

  return (
    <>
      <header className={`fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-2 border-primary/30 ${BOTTOM_NAV_H}`}>
        <nav className="flex justify-around items-center h-full px-1">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-colors min-w-0 ${isActive(path)}`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs uppercase tracking-wider font-bold truncate">{label}</span>
            </Link>
          ))}
        </nav>
      </header>

      <header className={`fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b-2 border-primary/30 px-4 py-3 flex justify-between items-center ${TOP_HEADER_H}`}>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <h1 className="font-bold text-lg tracking-wider text-accent">POKÉPLANTS</h1>
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col gap-1 p-2"
          aria-label="Menu"
        >
          <span className="w-5 h-0.5 bg-text-muted rounded-full" />
          <span className="w-5 h-0.5 bg-text-muted rounded-full" />
          <span className="w-5 h-0.5 bg-text-muted rounded-full" />
        </button>
      </header>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
