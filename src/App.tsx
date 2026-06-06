import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="text-4xl animate-float">🌿</div></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="text-6xl animate-float">🌿</div>
        <p className="text-text-muted text-sm tracking-wider">CHARGEMENT...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-5 md:px-8">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<ProtectedRoute><div className="p-8 text-center text-2xl">PokéPlants 🌿</div></ProtectedRoute>} />
      </Routes>
    </div>
  )
}
