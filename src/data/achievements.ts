export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  points: number
  condition: (stats: UserStats) => boolean
}

export type AchievementCategory = 'scan' | 'collection' | 'exploration' | 'progression' | 'streak'

export interface UserStats {
  total_discoveries: number
  total_species: number
  common_count: number
  rare_count: number
  legendary_count: number
  level: number
  xp: number
  coins: number
  countries: string[]
  consecutive_days: number
}

export const CATEGORY_META: Record<AchievementCategory, { label: string; icon: string; color: string }> = {
  scan: { label: 'Scan', icon: '📷', color: 'from-blue-400 to-cyan-300' },
  collection: { label: 'Collection', icon: '🌿', color: 'from-green-400 to-emerald-300' },
  exploration: { label: 'Exploration', icon: '🗺️', color: 'from-orange-400 to-amber-300' },
  progression: { label: 'Progression', icon: '⭐', color: 'from-purple-400 to-pink-300' },
  streak: { label: 'Séries', icon: '🔥', color: 'from-red-400 to-orange-300' },
}

export const ACHIEVEMENTS: Achievement[] = [
  // SCAN
  { id: 'scan_1', name: 'Première capture', description: 'Scanne ta première plante', icon: '📸', category: 'scan', points: 10, condition: (s) => s.total_discoveries >= 1 },
  { id: 'scan_2', name: 'Apprenti botaniste', description: 'Scanne 5 plantes', icon: '🔍', category: 'scan', points: 20, condition: (s) => s.total_discoveries >= 5 },
  { id: 'scan_3', name: 'Chasseur de plantes', description: 'Scanne 25 plantes', icon: '🎯', category: 'scan', points: 50, condition: (s) => s.total_discoveries >= 25 },
  { id: 'scan_4', name: 'Maître scanner', description: 'Scanne 100 plantes', icon: '📱', category: 'scan', points: 100, condition: (s) => s.total_discoveries >= 100 },
  { id: 'scan_5', name: 'Légende du scan', description: 'Scanne 500 plantes', icon: '🌟', category: 'scan', points: 200, condition: (s) => s.total_discoveries >= 500 },

  // COLLECTION
  { id: 'col_1', name: 'Petit herbier', description: 'Collecte 3 espèces différentes', icon: '🌱', category: 'collection', points: 10, condition: (s) => s.total_species >= 3 },
  { id: 'col_2', name: 'Jardinier', description: 'Collecte 10 espèces', icon: '🌻', category: 'collection', points: 30, condition: (s) => s.total_species >= 10 },
  { id: 'col_3', name: 'Botaniste', description: 'Collecte 25 espèces', icon: '📖', category: 'collection', points: 50, condition: (s) => s.total_species >= 25 },
  { id: 'col_4', name: 'Professeur Oak', description: 'Collecte 50 espèces', icon: '🎓', category: 'collection', points: 100, condition: (s) => s.total_species >= 50 },
  { id: 'col_5', name: 'Encyclopédie vivante', description: 'Collecte 100 espèces', icon: '📚', category: 'collection', points: 200, condition: (s) => s.total_species >= 100 },

  // RARE
  { id: 'rare_1', name: 'Première rare', description: 'Découvre une plante rare', icon: '🟪', category: 'collection', points: 25, condition: (s) => s.rare_count >= 1 },
  { id: 'rare_2', name: 'Collectionneur de rares', description: 'Découvre 5 plantes rares', icon: '💎', category: 'collection', points: 50, condition: (s) => s.rare_count >= 5 },
  { id: 'rare_3', name: 'Chasseur de trésors', description: 'Découvre 15 plantes rares', icon: '🏆', category: 'collection', points: 100, condition: (s) => s.rare_count >= 15 },
  { id: 'legend_1', name: 'Premier Pokémon', description: 'Découvre une plante légendaire', icon: '⭐', category: 'collection', points: 50, condition: (s) => s.legendary_count >= 1 },
  { id: 'legend_2', name: 'Légende vivante', description: 'Découvre 3 plantes légendaires', icon: '👑', category: 'collection', points: 100, condition: (s) => s.legendary_count >= 3 },
  { id: 'legend_3', name: 'Mythique', description: 'Découvre 5 plantes légendaires', icon: '🌈', category: 'collection', points: 200, condition: (s) => s.legendary_count >= 5 },

  // EXPLORATION
  { id: 'exp_1', name: 'Explorateur', description: 'Découvre une plante dans un pays', icon: '🌍', category: 'exploration', points: 10, condition: (s) => s.countries.length >= 1 },
  { id: 'exp_2', name: 'Voyageur', description: 'Découvre des plantes dans 3 pays', icon: '✈️', category: 'exploration', points: 50, condition: (s) => s.countries.length >= 3 },
  { id: 'exp_3', name: 'Globe-trotter', description: 'Découvre des plantes dans 5 pays', icon: '🌐', category: 'exploration', points: 100, condition: (s) => s.countries.length >= 5 },
  { id: 'exp_4', name: 'Citoyen du monde', description: 'Découvre des plantes dans 10 pays', icon: '🗺️', category: 'exploration', points: 200, condition: (s) => s.countries.length >= 10 },

  // PROGRESSION
  { id: 'prog_1', name: 'Niveau 5', description: 'Atteins le niveau 5', icon: '⭐', category: 'progression', points: 20, condition: (s) => s.level >= 5 },
  { id: 'prog_2', name: 'Niveau 10', description: 'Atteins le niveau 10', icon: '🌟', category: 'progression', points: 50, condition: (s) => s.level >= 10 },
  { id: 'prog_3', name: 'Niveau 25', description: 'Atteins le niveau 25', icon: '💫', category: 'progression', points: 100, condition: (s) => s.level >= 25 },
  { id: 'prog_4', name: 'Niveau 50', description: 'Atteins le niveau 50', icon: '🔥', category: 'progression', points: 200, condition: (s) => s.level >= 50 },

  // STREAK
  { id: 'streak_1', name: 'Assidu', description: 'Connecte-toi 2 jours d\'affilée', icon: '📅', category: 'streak', points: 10, condition: (s) => s.consecutive_days >= 2 },
  { id: 'streak_2', name: 'Régulier', description: 'Connecte-toi 7 jours d\'affilée', icon: '🗓️', category: 'streak', points: 30, condition: (s) => s.consecutive_days >= 7 },
  { id: 'streak_3', name: 'Inébranlable', description: 'Connecte-toi 30 jours d\'affilée', icon: '💪', category: 'streak', points: 100, condition: (s) => s.consecutive_days >= 30 },
]
