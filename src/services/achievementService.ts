import { supabase } from '../lib/supabase'
import { ACHIEVEMENTS, type Achievement, type UserStats } from '../data/achievements'

export async function getUnlockedAchievements(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  return new Set(data?.map((r) => r.achievement_id) ?? [])
}

async function getUserStats(userId: string): Promise<UserStats> {
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const { count: totalSpecies } = await supabase
    .from('discoveries')
    .select('plant_species_id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { data: rarityData } = await supabase
    .from('discoveries')
    .select('plant_species(category)')
    .eq('user_id', userId)

  const discoveries = (rarityData ?? []) as any[]
  const common_count = discoveries.filter((d) => d.plant_species?.category === 'common').length
  const rare_count = discoveries.filter((d) => d.plant_species?.category === 'rare').length
  const legendary_count = discoveries.filter((d) => d.plant_species?.category === 'legendary').length

  const { data: coordData } = await supabase
    .from('discoveries')
    .select('latitude, longitude')
    .eq('user_id', userId)
    .not('latitude', 'is', null)

  const countries = [...new Set(
    (coordData ?? [])
      .filter((c) => c.latitude && c.longitude)
      .map(() => 'unknown')
  )]

  return {
    total_discoveries: stats?.total_discoveries ?? 0,
    total_species: totalSpecies ?? 0,
    common_count,
    rare_count,
    legendary_count,
    level: stats?.level ?? 1,
    xp: stats?.xp ?? 0,
    coins: stats?.coins ?? 0,
    countries,
    consecutive_days: stats?.consecutive_days ?? 0,
  }
}

export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
  const stats = await getUserStats(userId)
  const unlocked = await getUnlockedAchievements(userId)
  const newAchievements: Achievement[] = []

  for (const ach of ACHIEVEMENTS) {
    if (unlocked.has(ach.id)) continue
    if (ach.condition(stats)) {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: ach.id,
      })
      await supabase.rpc('add_xp', { p_user_id: userId, p_amount: ach.points })
      newAchievements.push(ach)
    }
  }

  return newAchievements
}
