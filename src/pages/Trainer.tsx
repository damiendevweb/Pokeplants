import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ModelViewer from '../components/ModelViewer'
import LevelBar from '../components/LevelBar'
import ProfileStatsSection from '../components/ProfileStats'

interface UserStats {
  level: number
  xp: number
  xp_to_next_level: number
  coins: number
}

interface ShopItem {
  id: number
  name: string
  type: string
  price: number
  image_url: string | null
  model_path: string | null
  bone_name: string | null
  item_position: string | null
  item_rotation: string | null
  item_scale: number | null
}

interface InventoryItem {
  item_id: number
  equipped: boolean
  shop_item?: ShopItem
}

const categoryLabels: Record<string, string> = {
  hat: 'Chapeaux / Casquettes',
  beard: 'Barbe',
  top: 'Hauts',
  bottom: 'Bas',
  shoes: 'Chaussures',
  accessory: 'Accessoires',
  bag: 'Sacs',
  pet: 'Familiers',
}

const categoryEmojis: Record<string, string> = {
  hat: '🧢',
  beard: '🧔',
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  accessory: '⌚',
  bag: '🎒',
  pet: '🐾',
}

export default function Trainer() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('pet')
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('display_name, level, xp, xp_to_next_level, coins')
        .eq('user_id', user.id)
        .maybeSingle()

      if (statsData) {
        setStats(statsData)
        if (statsData.display_name) setDisplayName(statsData.display_name)
      } else {
        setStats({ level: 1, xp: 0, xp_to_next_level: 100, coins: 0 })
      }

      const { data: shopData } = await supabase
        .from('shop_items')
        .select('*')
        .order('price')

      if (shopData) setShopItems(shopData)

      const { data: invData } = await supabase
        .from('user_inventory')
        .select('item_id, equipped')
        .eq('user_id', user.id)

      if (invData) {
        const enriched = invData.map(inv => ({
          ...inv,
          shop_item: shopData?.find(s => s.id === inv.item_id) || undefined,
        }))
        setInventory(enriched)
      }

      setLoading(false)
    }

    load()
  }, [user])

  const ownedIds = new Set(inventory.map(i => i.item_id))
  const equippedIds = new Set(inventory.filter(i => i.equipped).map(i => i.item_id))
  const categories = ['pet', 'hat', 'beard', 'top', 'bottom', 'shoes', 'accessory', 'bag'] as const
  const filteredItems = shopItems.filter(i => i.type === activeCategory)

  const equippedItems = inventory
    .filter(i => i.equipped && i.shop_item?.model_path && i.shop_item?.bone_name && i.shop_item?.type !== 'pet')
    .map(i => {
      let pos: [number, number, number] = [0, 0, 0]
      try {
        const raw = (i.shop_item as any).item_position
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (Array.isArray(parsed) && parsed.length >= 3) {
            pos = [parsed[0], parsed[1], parsed[2]]
          }
        }
      } catch {}
      let rot: [number, number, number] = [0, 0, 0]
      try {
        const raw = (i.shop_item as any).item_rotation
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (Array.isArray(parsed) && parsed.length >= 3) {
            rot = [parsed[0], parsed[1], parsed[2]]
          }
        }
      } catch {}
      return {
        model_path: i.shop_item!.model_path!,
        bone_name: i.shop_item!.bone_name!,
        position: pos,
        rotation: rot,
        scale: (i.shop_item as any).item_scale ?? undefined,
      }
    })

  const equippedPets = inventory
    .filter(i => i.equipped && i.shop_item?.model_path && i.shop_item?.type === 'pet')
    .map(i => {
      let pos: [number, number, number] = [0.5, 0, 0]
      try {
        const raw = (i.shop_item as any).item_position
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (Array.isArray(parsed) && parsed.length >= 3) {
            pos = [parsed[0], parsed[1], parsed[2]]
          }
        }
      } catch {}
      let rot: [number, number, number] = [0, 0, 0]
      try {
        const raw = (i.shop_item as any).item_rotation
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (Array.isArray(parsed) && parsed.length >= 3) {
            rot = [parsed[0], parsed[1], parsed[2]]
          }
        }
      } catch {}
      return {
        model_path: i.shop_item!.model_path!,
        type: 'pet' as const,
        position: pos,
        rotation: rot,
        scale: (i.shop_item as any).item_scale ?? undefined,
      }
    })

  const handleBuy = async (item: ShopItem) => {
    if (!user || !stats || stats.coins < item.price) return
    const { error } = await supabase.from('user_inventory').insert({
      user_id: user.id,
      item_id: item.id,
    })
    if (error) return
    const newCoins = stats.coins - item.price
    await supabase.from('user_stats').update({ coins: newCoins }).eq('user_id', user.id)
    setStats({ ...stats, coins: newCoins })
    setInventory([...inventory, { item_id: item.id, equipped: false, shop_item: item }])
  }

  const handleToggleEquip = async (itemId: number, currentlyEquipped: boolean) => {
    if (!user) return
    const newEquipped = !currentlyEquipped
    let newInventory = [...inventory]

    if (newEquipped) {
      const itemType = shopItems.find(s => s.id === itemId)?.type
      if (itemType) {
        const prev = inventory.find(i => i.equipped && i.shop_item?.type === itemType)
        if (prev) {
          await supabase
            .from('user_inventory')
            .update({ equipped: false })
            .eq('user_id', user.id)
            .eq('item_id', prev.item_id)
          newInventory = newInventory.map(i =>
            i.item_id === prev.item_id ? { ...i, equipped: false } : i
          )
        }
      }
    }

    const { error } = await supabase
      .from('user_inventory')
      .update({ equipped: newEquipped })
      .eq('user_id', user.id)
      .eq('item_id', itemId)

    if (error) {
      console.error('Equip error:', error)
      return
    }

    setInventory(newInventory.map(i =>
      i.item_id === itemId ? { ...i, equipped: newEquipped } : i
    ))
  }

  return (
    <div className="py-6 space-y-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="text-center animate-slide-up">
        <div className="text-5xl mb-2">🧑‍🌾</div>
        <h1 className="text-xl font-bold text-accent tracking-wider">
          {displayName || user?.email?.split('@')[0] || 'Dresseur'}
        </h1>
      </div>

      {/* Level + Coins */}
      {stats && (
        <LevelBar level={stats.level} xp={stats.xp} xpToNextLevel={stats.xp_to_next_level} coins={stats.coins} />
      )}

      {/* 3D Model */}
      <div className="bg-card rounded-xl pixel-border aspect-square overflow-hidden animate-slide-up">
        <ModelViewer equippedItems={equippedItems} pets={equippedPets} />
      </div>

      {/* Boutique */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-wider text-accent flex items-center gap-2">
          🏪 BOUTIQUE
        </h3>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 pixel-btn text-sm font-bold py-2 px-3 rounded-xl tracking-wider transition-colors ${
                activeCategory === cat ? 'bg-primary text-white' : 'bg-card text-text-muted'
              }`}
            >
              {categoryEmojis[cat]} {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">Chargement...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">Aucun article dans cette catégorie</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map(item => {
              const owned = ownedIds.has(item.id)
              const equipped = equippedIds.has(item.id)
              return (
                <div key={item.id} className="bg-card rounded-xl pixel-border p-3 space-y-2">
                  <div className="h-20 bg-dark rounded-lg flex items-center justify-center text-3xl">
                    {categoryEmojis[item.type] || '🛍️'}
                  </div>
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <p className="text-xs text-text-muted">
                    {owned ? 'Possédé' : `💰 ${item.price}`}
                  </p>
                  {owned ? (
                    <button
                      onClick={() => handleToggleEquip(item.id, equipped)}
                      className={`w-full text-xs font-bold py-1.5 rounded-lg tracking-wider transition-colors pixel-btn ${
                        equipped
                          ? 'bg-primary text-white'
                          : 'bg-dark'
                      }`}
                    >
                      {equipped ? 'ÉQUIPÉ' : 'ÉQUIPER'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!!(stats && stats.coins < item.price)}
                      className="w-full text-xs font-bold py-1.5 rounded-lg tracking-wider pixel-btn bg-success text-white disabled:opacity-40"
                    >
                      ACHETER
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <ProfileStatsSection userId={user?.id} itemCount={inventory.length} />
    </div>
  )
}
