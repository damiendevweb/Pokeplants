import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import Login from './pages/Login'
import Home from './pages/Home'
import Scan from './pages/Scan'
import PlantResult from './pages/PlantResult'
import Collection from './pages/Collection'
import Achievements from './pages/Achievements'
import MapView from './pages/MapView'

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
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
        <Route path="/plant-result" element={<ProtectedRoute><PlantResult /></ProtectedRoute>} />
        <Route path="/collection" element={<ProtectedRoute><Collection /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
