import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  if (!user || location.pathname === '/login') return null

  const isActive = (path: string) =>
    location.pathname === path ? 'text-accent' : 'text-text-muted'

  const navItems = [
    { path: '/', label: 'Accueil', icon: '🏠' },
    { path: '/scan', label: 'Scanner', icon: '📷' },
    { path: '/collection', label: 'PokéPlants', icon: '🌿' },
    { path: '/achievements', label: 'Succès', icon: '🏆' },
    { path: '/trainer', label: 'Dresseur', icon: '🧑‍🌾' },
  ]

  return (
    <>
      <header className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-2 border-primary/30">
        <nav className="flex justify-around items-center h-16 px-1">
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

      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b-2 border-primary/30 px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-lg tracking-wider text-accent">POKÉPLANTS</span>
        </Link>
        <button
          onClick={signOut}
          className="text-sm text-text-muted hover:text-red-400 transition-colors pixel-border px-3 py-1"
        >
          DÉCONNEXION
        </button>
      </header>

      <div className="h-16" />
      <div className="h-16" />
    </>
  )
}
