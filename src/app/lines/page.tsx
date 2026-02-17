'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip, GameCard, NameEntry } from '@/components'
import type { Game, WeeklySlate } from '@/types'

export default function LinesPage() {
  const { user } = useStore()
  const [slate, setSlate] = useState<WeeklySlate | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Get slate
      const { data: slateData } = await supabase
        .from('weekly_slate')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      
      if (slateData) {
        setSlate(slateData)
        setSelectedWeek(slateData.current_week)
      }
      
      // Get user games only (betting is only available for user matchups)
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          *,
          home_team:teams!games_home_team_id_fkey(*),
          away_team:teams!games_away_team_id_fkey(*)
        `)
        .eq('is_user_game', true)
        .order('week', { ascending: true })
      
      if (gamesData) setGames(gamesData as Game[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const weeks = [...new Set(games.map(g => g.week))].sort((a, b) => a - b)

  const filteredGames = selectedWeek
    ? games.filter(g => g.week === selectedWeek)
    : games

  return (
    <div className="min-h-screen bg-bg-primary">
      <UserBar />
      <BetSlip />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl font-bold">
            LINES {selectedWeek && <span className="text-accent-green">WEEK {selectedWeek}</span>}
          </h1>
          <span className="badge badge-user-game">🎮 User Games Only</span>
        </div>

        {/* Name entry */}
        {!user && (
          <div className="max-w-xl mb-6">
            <NameEntry />
          </div>
        )}

        {/* Week selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {weeks.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition
                ${selectedWeek === w 
                  ? 'bg-accent-green text-bg-primary' 
                  : 'bg-bg-card border border-border-subtle hover:border-accent-green'
                }`}
            >
              Week {w}
              {slate?.current_week === w && <span className="ml-1">✦</span>}
            </button>
          ))}
        </div>

        {/* Games */}
        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading...</div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No games available</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                locked={game.week > (slate?.current_week ?? 0)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
