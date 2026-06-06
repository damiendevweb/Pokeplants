import { Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-surface">
      <Routes>
        <Route path="*" element={<div className="p-8 text-center text-2xl">PokéPlants 🌿</div>} />
      </Routes>
    </div>
  )
}
