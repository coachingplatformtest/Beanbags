'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip } from '@/components'
import { formatOdds, formatUnits } from '@/lib/betting-math'
import type { LeaderboardEntry } from '@/types'

export default function LeaderboardPage() {
  const { user } = useStore()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
  const [userBets, setUserBets] = useState<any[]>([])
  const [userParlays, setUserParlays] = useState<any[]>([])
  const [loadingBets, setLoadingBets] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .order('net_profit', { ascending: false })
      if (data) setLeaderboard(data as LeaderboardEntry[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openUserBets = async (entry: LeaderboardEntry) => {
    setSelectedEntry(entry)
    setUserBets([])
    setUserParlays([])
    setLoadingBets(true)
    try {
      const [betsRes, parlaysRes] = await Promise.all([
        supabase.from('bets').select('*').eq('user_id', entry.user_id).order('created_at', { ascending: false }),
        supabase.from('parlay_bets').select('*, legs:parlay_legs(*)').eq('user_id', entry.user_id).order('created_at', { ascending: false }),
      ])
      if (betsRes.data) setUserBets(betsRes.data)
      if (parlaysRes.data) setUserParlays(parlaysRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingBets(false)
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

  const statusColor = (s: string) => {
    if (s === 'won') return 'text-accent-green'
    if (s === 'lost') return 'text-accent-red'
    if (s === 'push') return 'text-accent-gold'
    return 'text-text-secondary'
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
                        onClick={() => openUserBets(entry)}
                        className={`border-t border-border-subtle cursor-pointer transition hover:bg-bg-surface/70
                          ${isCurrentUser ? 'bg-accent-green/5' : ''}`}
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
                    onClick={() => openUserBets(entry)}
                    className={`card p-4 cursor-pointer transition hover:border-accent-green/40
                      ${isCurrentUser ? 'border-accent-green' : ''}`}
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
                          {formatUnits(entry.net_profit, true)}u
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-text-secondary">
                      <span>Wagered: {formatUnits(entry.units_wagered)}u</span>
                      <span>ROI: {entry.roi > 0 ? '+' : ''}{entry.roi}%</span>
                      <span className="ml-auto text-accent-green/60">View bets →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      {/* User Bets Panel */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedEntry(null)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-lg max-h-[85vh] bg-bg-card border border-border-subtle rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
              <div>
                <h2 className="font-heading text-xl font-bold">{selectedEntry.name}</h2>
                <div className="flex gap-3 text-sm mt-0.5">
                  <span className="text-text-secondary">{formatUnits(selectedEntry.units_remaining)}u balance</span>
                  <span className={selectedEntry.net_profit >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                    {formatUnits(selectedEntry.net_profit, true)}u net
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-surface hover:bg-bg-surface/80 text-text-secondary"
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {loadingBets ? (
                <div className="text-center py-8 text-text-secondary">Loading...</div>
              ) : userBets.length === 0 && userParlays.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">No bets placed yet</div>
              ) : (
                <>
                  {/* Parlays */}
                  {userParlays.map((parlay: any) => (
                    <div key={parlay.id} className="card overflow-hidden">
                      <div className="p-3 border-b border-border-subtle flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-${parlay.status}`}>{parlay.status}</span>
                          <span className="text-accent-gold text-xs font-bold">
                            {parlay.legs?.length}-LEG PARLAY
                          </span>
                        </div>
                        <span className="text-xs text-text-secondary">
                          {formatUnits(parlay.units_wagered)}u → <span className="text-accent-green">+{formatUnits(parlay.potential_payout - parlay.units_wagered)}u</span>
                        </span>
                      </div>
                      <div className="p-3 space-y-1.5">
                        {(parlay.legs || []).map((leg: any) => (
                          <div key={leg.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                leg.status === 'won' ? 'bg-accent-green' :
                                leg.status === 'lost' ? 'bg-accent-red' : 'bg-accent-gold'
                              }`} />
                              <span className="text-text-secondary">{leg.selection}</span>
                            </div>
                            <span className="font-heading shrink-0 ml-2">{formatOdds(leg.odds)}</span>
                          </div>
                        ))}
                      </div>
                      {parlay.status !== 'pending' && (
                        <div className="px-3 py-2 bg-bg-surface text-xs text-right">
                          {parlay.status === 'won'
                            ? <span className="text-accent-green font-bold">Won +{formatUnits(parlay.potential_payout - parlay.units_wagered)}u</span>
                            : <span className="text-accent-red font-bold">Lost -{formatUnits(parlay.units_wagered)}u</span>
                          }
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Straight bets */}
                  {userBets.map((bet: any) => (
                    <div key={bet.id} className="card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`badge badge-${bet.status}`}>{bet.status}</span>
                        <span className="text-xs text-text-secondary">
                          {formatUnits(bet.units_wagered)}u @ {formatOdds(bet.odds)}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{bet.selection}</p>
                      <p className={`text-xs ${statusColor(bet.status)}`}>
                        {bet.status === 'won'
                          ? `+${formatUnits(bet.potential_payout - bet.units_wagered)}u`
                          : bet.status === 'lost'
                          ? `-${formatUnits(bet.units_wagered)}u`
                          : `To win: +${formatUnits(bet.potential_payout - bet.units_wagered)}u`
                        }
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
