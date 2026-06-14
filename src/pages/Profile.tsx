import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from '../components/ConfirmModal'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDeleteAccount = async () => {
    if (!user) return
    setLoading(true)

    await supabase.from('user_achievements').delete().eq('user_id', user.id)
    await supabase.from('user_inventory').delete().eq('user_id', user.id)
    await supabase.from('user_stats').delete().eq('user_id', user.id)
    await supabase.from('discoveries').delete().eq('user_id', user.id)

    await signOut()
  }

  const handleResetProgression = async () => {
    if (!user) return
    setLoading(true)

    await supabase.from('user_achievements').delete().eq('user_id', user.id)
    await supabase.from('discoveries').delete().eq('user_id', user.id)
    await supabase.from('user_inventory').delete().eq('user_id', user.id)
    await supabase.from('user_stats').update({
      level: 1,
      xp: 0,
      xp_to_next_level: 100,
      coins: 0,
    }).eq('user_id', user.id)

    setLoading(false)
    setShowResetModal(false)
    navigate('/')
  }

  return (
    <div className="py-6 space-y-6 max-w-lg mx-auto pb-24">
      <div className="text-center animate-slide-up">
        <div className="text-5xl mb-2">👤</div>
        <h1 className="text-xl font-bold text-accent tracking-wider">MON PROFIL</h1>
      </div>

      <div className="bg-card rounded-xl pixel-border p-4 space-y-4 animate-slide-up">
        <div className="space-y-1">
          <p className="text-sm text-text-muted">Email</p>
          <p className="text-sm font-bold">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full bg-card rounded-xl pixel-border p-4 text-left hover:bg-card/80 transition-colors"
        >
          <p className="text-sm font-bold">🔄 Réinitialiser ma progression</p>
          <p className="text-xs text-text-muted mt-1">
            Supprime toutes vos découvertes, objets, succès et remet le niveau à zéro.
          </p>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-card rounded-xl pixel-border p-4 text-left hover:bg-red-500/10 transition-colors"
        >
          <p className="text-sm font-bold text-red-400">🗑️ Supprimer mon compte</p>
          <p className="text-xs text-text-muted mt-1">
            Supprime définitivement votre compte et toutes vos données.
          </p>
        </button>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Supprimer mon compte ?"
          message="Cette action est irréversible. Toutes vos données seront supprimées définitivement."
          confirmLabel="Supprimer"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showResetModal && (
        <ConfirmModal
          title="Réinitialiser ma progression ?"
          message="Votre progression complète sera supprimée : votre classement, votre niveau ainsi que vos succès."
          confirmLabel="Réinitialiser"
          onConfirm={handleResetProgression}
          onCancel={() => setShowResetModal(false)}
        />
      )}
    </div>
  )
}
