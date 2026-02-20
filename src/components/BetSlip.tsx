'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { formatOdds, formatUnits, calculatePayout } from '@/lib/betting-math'

export function BetSlip() {
  const {
    user, setUser,
    betSlip, removeFromSlip, clearSlip,
    stake, setStake,
    parlayMode, setParlayMode,
    getTotalOdds, getPotentialPayout,
    slipOpen, setSlipOpen,
    slateStatus,
  } = useStore()
  
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const payout = getPotentialPayout()
  const totalOdds = getTotalOdds()
  const totalWager = parlayMode ? stake : stake * betSlip.length
  const bettingOpen = slateStatus === 'open'
  const canPlace = bettingOpen && user && betSlip.length > 0 && stake >= 0.5 && totalWager <= user.units_remaining

  const placeBets = async () => {
    if (!canPlace || !user) return
    setPlacing(true)
    setError('')
    
    try {
      // Fetch fresh user balance from DB before placing bet (prevents stale data)
      const { data: freshUser, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userErr || !freshUser) throw new Error('Failed to fetch user balance')
      
      // Check if user still has enough units with fresh balance
      if (totalWager > freshUser.units_remaining) {
        throw new Error('Insufficient units (balance changed)')
      }
      
      if (parlayMode && betSlip.length > 1) {
        // Create parlay bet
        const { data: parlay, error: pErr } = await supabase
          .from('parlay_bets')
          .insert({
            user_id: user.id,
            units_wagered: stake,
            total_odds: totalOdds,
            potential_payout: payout.total,
          })
          .select()
          .single()
        
        if (pErr) throw pErr
        
        // Create legs
        const legs = betSlip.map(item => ({
          parlay_id: parlay.id,
          bet_type: item.type,
          game_id: item.gameId || null,
          future_id: item.futureId || null,
          prop_id: item.propId || null,
          selection: item.selection,
          odds: item.odds,
        }))
        
        const { error: lErr } = await supabase.from('parlay_legs').insert(legs)
        if (lErr) throw lErr
        
      } else {
        // Straight bets
        for (const item of betSlip) {
          const itemPayout = calculatePayout(item.odds, stake)
          const { error: bErr } = await supabase
            .from('bets')
            .insert({
              user_id: user.id,
              bet_type: item.type,
              game_id: item.gameId || null,
              future_id: item.futureId || null,
              prop_id: item.propId || null,
              selection: item.selection,
              odds: item.odds,
              units_wagered: stake,
              potential_payout: itemPayout.total,
            })
          if (bErr) throw bErr
        }
      }
      
      // Update user units (using fresh balance from DB)
      const newUnits = freshUser.units_remaining - totalWager
      const newWagered = freshUser.units_wagered + totalWager
      
      await supabase
        .from('users')
        .update({ units_remaining: newUnits, units_wagered: newWagered })
        .eq('id', user.id)
      
      // Update store with fresh data
      setUser({ ...freshUser, units_remaining: newUnits, units_wagered: newWagered })
      clearSlip()
      setShowConfirm(false)
      setSuccess(`Bet placed! ${formatUnits(totalWager)}u wagered`)
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to place bet')
    } finally {
      setPlacing(false)
    }
  }

  if (!slipOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSlipOpen(false)} />
      
      <div className="fixed bottom-0 right-0 md:right-4 md:bottom-4 w-full md:w-[28rem] bg-bg-card border-t md:border border-border-subtle md:rounded-xl z-50 max-h-[55vh] md:max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            BET SLIP
            {betSlip.length > 0 && (
              <span className="bg-accent-green text-bg-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {betSlip.length}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {betSlip.length > 0 && (
              <button onClick={clearSlip} className="text-sm text-text-secondary hover:text-accent-red">
                Clear
              </button>
            )}
            <button onClick={() => setSlipOpen(false)} className="p-1 hover:bg-bg-surface rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[40vh] md:max-h-[60vh]">
          {betSlip.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p>No selections yet</p>
              <p className="text-sm mt-1">Click odds to add to slip</p>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              {betSlip.length > 1 && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setParlayMode(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                      !parlayMode ? 'bg-accent-green text-bg-primary' : 'bg-bg-surface text-text-secondary'
                    }`}
                  >
                    Straight ({betSlip.length})
                  </button>
                  <button
                    onClick={() => setParlayMode(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                      parlayMode ? 'bg-accent-green text-bg-primary' : 'bg-bg-surface text-text-secondary'
                    }`}
                  >
                    Parlay
                  </button>
                </div>
              )}

              {/* Selections */}
              <div className="space-y-2 mb-4">
                {betSlip.map(item => (
                  <div key={item.id} className="bg-bg-surface rounded-lg p-3 relative group">
                    <button
                      onClick={() => removeFromSlip(item.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-bg-card rounded transition"
                    >
                      <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm font-medium pr-6">{item.selection}</p>
                    <p className="text-accent-green font-heading font-bold">{formatOdds(item.odds)}</p>
                  </div>
                ))}
              </div>

              {/* Stake */}
              <div className="mb-4">
                <label className="text-sm text-text-secondary mb-2 block">
                  Stake (units) {parlayMode ? '' : `× ${betSlip.length} = ${formatUnits(totalWager)}u`}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                    onWheel={(e) => e.currentTarget.blur()}
                    min="0.5"
                    step="0.5"
                    className="flex-1 px-4 py-3 bg-bg-primary border border-border-subtle rounded-lg font-heading text-lg"
                  />
                  {[1, 5, 10].map(v => (
                    <button
                      key={v}
                      onClick={() => setStake(v)}
                      className="px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-sm hover:border-accent-green"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-bg-primary rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Total Odds</span>
                  <span className="font-heading font-bold">{formatOdds(totalOdds)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">To Win</span>
                  <span className="font-heading font-bold text-accent-green">+{formatUnits(payout.profit)}u</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border-subtle pt-2">
                  <span className="text-text-secondary">Payout</span>
                  <span className="font-heading font-bold text-accent-green">{formatUnits(payout.total)}u</span>
                </div>
              </div>

              {/* Locked banner */}
              {!bettingOpen && (
                <div className="mb-3 p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-center">
                  <p className="text-accent-red font-heading font-bold text-sm">
                    🔒 BETTING {slateStatus === 'settled' ? 'CLOSED — WEEK SETTLED' : 'LOCKED — LINES ARE SET'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">No new bets until next week opens</p>
                </div>
              )}

              {/* Place button */}
              <button
                onClick={() => setShowConfirm(true)}
                disabled={!canPlace}
                className="w-full py-4 bg-accent-green text-bg-primary font-heading font-bold text-lg rounded-lg
                         hover:bg-accent-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? 'Placing...' : `Place Bet — ${formatUnits(totalWager)}u`}
              </button>

              {!bettingOpen && (
                <p className="text-xs text-text-secondary text-center mt-2">Selections saved for when betting reopens</p>
              )}
              {bettingOpen && !user && (
                <p className="text-sm text-accent-red text-center mt-2">Enter your name to bet</p>
              )}
              {bettingOpen && user && totalWager > user.units_remaining && (
                <p className="text-sm text-accent-red text-center mt-2">Insufficient units</p>
              )}
              {error && <p className="text-sm text-accent-red text-center mt-2">{error}</p>}
              {success && <p className="text-sm text-accent-green text-center mt-2">{success}</p>}
            </>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 max-w-md w-full animate-slide-up">
            <h3 className="font-heading font-bold text-xl mb-4">Confirm Bet</h3>
            <div className="space-y-2 mb-4">
              {betSlip.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.selection}</span>
                  <span className="font-heading">{formatOdds(item.odds)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border-subtle pt-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span>Total Wager</span>
                <span className="font-heading font-bold">{formatUnits(totalWager)}u</span>
              </div>
              <div className="flex justify-between">
                <span>To Win</span>
                <span className="font-heading font-bold text-accent-green">+{formatUnits(payout.profit)}u</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-bg-surface text-text-secondary rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={placeBets}
                disabled={placing || !bettingOpen}
                className="flex-1 py-3 bg-accent-green text-bg-primary rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? 'Placing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
