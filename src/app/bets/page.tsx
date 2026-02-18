'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip, NameEntry } from '@/components'
import { formatOdds, formatUnits } from '@/lib/betting-math'
import type { Bet, ParlayBet, ParlayLeg } from '@/types'

type Filter = 'all' | 'pending' | 'settled'

export default function BetsPage() {
  const { user } = useStore()
  const [bets, setBets] = useState<Bet[]>([])
  const [parlays, setParlays] = useState<(ParlayBet & { legs: ParlayLeg[] })[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadBets()
  }, [user])

  const loadBets = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: betsData } = await supabase
        .from('bets')
        .select('*, game:games(week), prop:props(week)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (betsData) setBets(betsData as any)
      
      const { data: parlaysData } = await supabase
        .from('parlay_bets')
        .select('*, legs:parlay_legs(*, game:games(week), prop:props(week))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (parlaysData) setParlays(parlaysData as any)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getBetLabel = (bet: any) => {
    if ((bet as any).game?.week) return `2030 Week ${(bet as any).game.week}`
    if ((bet as any).prop?.week) return `2030 Week ${(bet as any).prop.week}`
    if (bet.future_id) return '2030 Season'
    return ''
  }

  const getParlayLabel = (parlay: any) => {
    const leg = (parlay.legs || []).find((l: any) => l.game?.week || l.prop?.week)
    const week = leg?.game?.week || leg?.prop?.week
    return week ? `2030 Week ${week}` : ''
  }

  const filteredBets = bets.filter(b => {
    if (filter === 'all') return true
    if (filter === 'pending') return b.status === 'pending'
    return b.status !== 'pending'
  })

  const filteredParlays = parlays.filter(p => {
    if (filter === 'all') return true
    if (filter === 'pending') return p.status === 'pending'
    return p.status !== 'pending'
  })

  const stats = {
    pending: bets.filter(b => b.status === 'pending').length + parlays.filter(p => p.status === 'pending').length,
    won: bets.filter(b => b.status === 'won').length + parlays.filter(p => p.status === 'won').length,
    lost: bets.filter(b => b.status === 'lost').length + parlays.filter(p => p.status === 'lost').length,
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <UserBar />
      <BetSlip />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="font-heading text-3xl font-bold mb-6">MY BETS</h1>

        {!user ? (
          <div className="max-w-xl">
            <NameEntry />
            <p className="text-text-secondary text-sm mt-2">Enter your name to view your bets</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="card p-4 text-center">
                <p className="text-text-secondary text-sm">Pending</p>
                <p className="font-heading text-2xl text-accent-yellow">{stats.pending}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-text-secondary text-sm">Won</p>
                <p className="font-heading text-2xl text-accent-green">{stats.won}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-text-secondary text-sm">Lost</p>
                <p className="font-heading text-2xl text-accent-red">{stats.lost}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
              {(['all', 'pending', 'settled'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition
                    ${filter === f 
                      ? 'bg-accent-green text-bg-primary' 
                      : 'bg-bg-card border border-border-subtle'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-text-secondary">Loading...</div>
            ) : filteredBets.length === 0 && filteredParlays.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">No bets yet</p>
                <p className="text-sm text-text-secondary mt-1">Time to put some units on the board!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Parlays */}
                {filteredParlays.map(parlay => (
                  <div key={parlay.id} className="card overflow-hidden">
                    <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`badge badge-${parlay.status}`}>{parlay.status}</span>
                        <span className="text-accent-gold text-sm font-bold">
                          {parlay.legs?.length}-LEG PARLAY
                        </span>
                      </div>
                      {getParlayLabel(parlay) && (
                        <span className="text-xs text-text-secondary">{getParlayLabel(parlay)}</span>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      {parlay.legs?.map(leg => (
                        <div key={leg.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              leg.status === 'won' ? 'bg-accent-green' :
                              leg.status === 'lost' ? 'bg-accent-red' :
                              'bg-accent-yellow'
                            }`} />
                            <span>{leg.selection}</span>
                          </div>
                          <span className="font-heading">{formatOdds(leg.odds)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 bg-bg-surface flex justify-between text-sm">
                      <span>Wager: {formatUnits(parlay.units_wagered)}u</span>
                      <span>
                        {parlay.status === 'won' 
                          ? <span className="text-accent-green">Won +{formatUnits(parlay.potential_payout - parlay.units_wagered)}u</span>
                          : parlay.status === 'lost'
                          ? <span className="text-accent-red">Lost -{formatUnits(parlay.units_wagered)}u</span>
                          : <span>To win: +{formatUnits(parlay.potential_payout - parlay.units_wagered)}u</span>
                        }
                      </span>
                    </div>
                  </div>
                ))}

                {/* Straight bets */}
                {filteredBets.map(bet => (
                  <div key={bet.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`badge badge-${bet.status}`}>{bet.status}</span>
                      {getBetLabel(bet) && (
                        <span className="text-xs text-text-secondary">{getBetLabel(bet)}</span>
                      )}
                    </div>
                    <p className="font-medium mb-1">{bet.selection}</p>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>{formatUnits(bet.units_wagered)}u @ {formatOdds(bet.odds)}</span>
                      <span>
                        {bet.status === 'won' 
                          ? <span className="text-accent-green">+{formatUnits(bet.potential_payout - bet.units_wagered)}u</span>
                          : bet.status === 'lost'
                          ? <span className="text-accent-red">-{formatUnits(bet.units_wagered)}u</span>
                          : <span>To win: +{formatUnits(bet.potential_payout - bet.units_wagered)}u</span>
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
