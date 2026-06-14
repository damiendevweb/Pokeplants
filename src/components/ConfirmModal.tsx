import { useEffect, useCallback } from 'react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ title, message, confirmLabel = 'Confirmer', onConfirm, onCancel }: Props) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onCancel()
  }, [onCancel])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 animate-fade-in" onClick={onCancel}>
      <div
        className="bg-surface w-full max-w-sm mx-4 rounded-2xl p-6 space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-accent">{title}</h3>
        <p className="text-sm text-text-muted">{message}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-bold py-2.5 rounded-xl pixel-btn bg-card text-text-muted"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-sm font-bold py-2.5 rounded-xl pixel-btn bg-red-500 text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
