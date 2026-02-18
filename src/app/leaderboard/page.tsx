'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip } from '@/components'
import { formatUnits } from '@/lib/betting-math'
import type { LeaderboardEntry } from '@/types'

export default function LeaderboardPage() {
  const { user } = useStore()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .order('units_remaining', { ascending: false })
      
      if (data) setLeaderboard(data as LeaderboardEntry[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-accent-gold'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-amber-600'
    return ''
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <UserBar />
      <BetSlip />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="font-heading text-3xl font-bold mb-6">LEADERBOARD</h1>

        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">No players yet</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block card overflow-hidden">
              <table className="w-full">
                <thead className="bg-bg-surface">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Name</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Balance</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Net</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Wagered</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, i) => {
                    const rank = i + 1
                    const isCurrentUser = user?.id === entry.user_id
                    return (
                      <tr 
                        key={entry.user_id} 
                        className={`border-t border-border-subtle ${isCurrentUser ? 'bg-accent-green/5' : ''}`}
                      >
                        <td className={`px-4 py-3 font-heading font-bold ${getRankStyle(rank)}`}>
                          {getRankEmoji(rank)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{entry.name}</span>
                          {isCurrentUser && <span className="ml-2 text-xs text-accent-green">(you)</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-heading">
                          {formatUnits(entry.units_remaining)}u
                        </td>
                        <td className={`px-4 py-3 text-right font-heading font-bold ${
                          entry.net_profit > 0 ? 'text-accent-green' : 
                          entry.net_profit < 0 ? 'text-accent-red' : ''
                        }`}>
                          {formatUnits(entry.net_profit, true)}u
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary">
                          {formatUnits(entry.units_wagered)}u
                        </td>
                        <td className={`px-4 py-3 text-right ${
                          entry.roi > 0 ? 'text-accent-green' : 
                          entry.roi < 0 ? 'text-accent-red' : 'text-text-secondary'
                        }`}>
                          {entry.roi > 0 ? '+' : ''}{entry.roi}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {leaderboard.map((entry, i) => {
                const rank = i + 1
                const isCurrentUser = user?.id === entry.user_id
                return (
                  <div 
                    key={entry.user_id} 
                    className={`card p-4 ${isCurrentUser ? 'border-accent-green' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`font-heading text-xl font-bold ${getRankStyle(rank)}`}>
                          {getRankEmoji(rank)}
                        </span>
                        <span className="font-medium">
                          {entry.name}
                          {isCurrentUser && <span className="ml-1 text-xs text-accent-green">(you)</span>}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold">{formatUnits(entry.units_remaining)}u</p>
                        <p className={`text-sm ${
                          entry.net_profit > 0 ? 'text-accent-green' : 
                          entry.net_profit < 0 ? 'text-accent-red' : ''
                        }`}>
                          {formatUnits(entry.net_profit, true)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-text-secondary">
                      <span>Wagered: {formatUnits(entry.units_wagered)}u</span>
                      <span>ROI: {entry.roi > 0 ? '+' : ''}{entry.roi}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
