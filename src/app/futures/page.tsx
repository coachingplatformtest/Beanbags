'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip, NameEntry } from '@/components'
import { formatOdds } from '@/lib/betting-math'
import type { Future, Prop } from '@/types'

type Tab = 'natty' | 'heisman' | 'win_totals'

export default function FuturesPage() {
  const { user, addToSlip, isInSlip, betSlip } = useStore()
  const [tab, setTab] = useState<Tab>('natty')
  const [futures, setFutures] = useState<Future[]>([])
  const [winTotals, setWinTotals] = useState<Prop[]>([])
  const [loading, setLoading] = useState(true)
  const canAdd = betSlip.length < 5

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: futuresData } = await supabase
        .from('futures')
        .select('*, team:teams(*)')
        .eq('is_active', true)
        .order('odds_numeric', { ascending: true })
      
      if (futuresData) setFutures(futuresData as Future[])
      
      const { data: propsData } = await supabase
        .from('props')
        .select('*')
        .eq('category', 'season_win_total')
        .eq('is_active', true)
      
      if (propsData) setWinTotals(propsData as Prop[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addFuture = (future: Future) => {
    const id = `future-${future.id}`
    if (!canAdd && !isInSlip(id)) return
    addToSlip({
      id,
      type: 'future',
      selection: `${future.selection_name} ${future.category === 'national_championship' ? 'Natty' : 'Heisman'}`,
      odds: future.odds_numeric,
      futureId: future.id,
      future,
    })
  }

  const addWinTotal = (prop: Prop, side: 'selection' | 'counter') => {
    const id = `prop-${prop.id}-${side}`
    if (!canAdd && !isInSlip(id)) return
    const odds = side === 'selection' ? prop.odds : prop.counter_odds!
    const sel = side === 'selection' ? prop.selection_name : prop.counter_selection!
    addToSlip({
      id,
      type: 'prop',
      selection: `${prop.description}: ${sel}`,
      odds,
      propId: prop.id,
      prop,
      side,
    })
  }

  const nattyFutures = futures.filter(f => f.category === 'national_championship')
  const heismanFutures = futures.filter(f => f.category === 'heisman')

  return (
    <div className="min-h-screen bg-bg-primary">
      <UserBar />
      <BetSlip />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="font-heading text-3xl font-bold mb-6">FUTURES</h1>

        {!user && (
          <div className="max-w-xl mb-6">
            <NameEntry />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'natty', label: 'National Championship' },
            { key: 'heisman', label: 'Heisman' },
            { key: 'win_totals', label: 'Win Totals' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                ${tab === t.key 
                  ? 'bg-accent-green text-bg-primary' 
                  : 'bg-bg-card border border-border-subtle hover:border-accent-green'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading...</div>
        ) : (
          <>
            {/* Natty */}
            {tab === 'natty' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nattyFutures.map(f => {
                  const id = `future-${f.id}`
                  const selected = isInSlip(id)
                  return (
                    <button
                      key={f.id}
                      onClick={() => addFuture(f)}
                      disabled={!canAdd && !selected}
                      className={`card p-4 text-left transition ${
                        selected ? 'border-accent-green bg-accent-green/10' : 'hover:border-accent-green'
                      } ${!canAdd && !selected ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{f.team?.logo_emoji || '🏈'}</span>
                        <div className="flex-1">
                          <p className="font-heading font-bold">{f.selection_name}</p>
                          {f.team?.tier && (
                            <p className="text-xs text-text-secondary">{f.team.tier}</p>
                          )}
                        </div>
                        <span className={`font-heading text-xl font-bold ${selected ? 'text-accent-green' : 'text-accent-gold'}`}>
                          {f.odds}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Heisman */}
            {tab === 'heisman' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {heismanFutures.map(f => {
                  const id = `future-${f.id}`
                  const selected = isInSlip(id)
                  return (
                    <button
                      key={f.id}
                      onClick={() => addFuture(f)}
                      disabled={!canAdd && !selected}
                      className={`card p-4 text-left transition ${
                        selected ? 'border-accent-green bg-accent-green/10' : 'hover:border-accent-green'
                      } ${!canAdd && !selected ? 'opacity-50' : ''}`}
                    >
                      <p className="font-heading font-bold">{f.selection_name}</p>
                      {f.description && (
                        <p className="text-xs text-text-secondary mt-1">{f.description}</p>
                      )}
                      <p className={`font-heading text-xl font-bold mt-2 ${selected ? 'text-accent-green' : 'text-accent-gold'}`}>
                        {f.odds}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Win Totals */}
            {tab === 'win_totals' && (
              <div className="grid gap-4 sm:grid-cols-2">
                {winTotals.map(p => {
                  const overSelected = isInSlip(`prop-${p.id}-selection`)
                  const underSelected = isInSlip(`prop-${p.id}-counter`)
                  return (
                    <div key={p.id} className="card p-4">
                      <p className="font-heading font-bold mb-3">{p.description}</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => addWinTotal(p, 'selection')}
                          disabled={!canAdd && !overSelected}
                          className={`flex-1 py-3 rounded-lg border transition ${
                            overSelected 
                              ? 'bg-accent-green text-bg-primary border-accent-green' 
                              : 'bg-bg-surface border-border-subtle hover:border-accent-green'
                          } ${!canAdd && !overSelected ? 'opacity-50' : ''}`}
                        >
                          <p className="text-sm">{p.selection_name}</p>
                          <p className="font-heading font-bold">{formatOdds(p.odds)}</p>
                        </button>
                        <button
                          onClick={() => addWinTotal(p, 'counter')}
                          disabled={!canAdd && !underSelected}
                          className={`flex-1 py-3 rounded-lg border transition ${
                            underSelected 
                              ? 'bg-accent-green text-bg-primary border-accent-green' 
                              : 'bg-bg-surface border-border-subtle hover:border-accent-green'
                          } ${!canAdd && !underSelected ? 'opacity-50' : ''}`}
                        >
                          <p className="text-sm">{p.counter_selection}</p>
                          <p className="font-heading font-bold">{formatOdds(p.counter_odds!)}</p>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
