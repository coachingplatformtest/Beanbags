'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar, BetSlip, NameEntry } from '@/components'
import type { Bet, WeeklySlate } from '@/types'

export default function HomePage() {
  const { user } = useStore()
  const [slate, setSlate] = useState<WeeklySlate | null>(null)
  const [recentBets, setRecentBets] = useState<(Bet & { user: { name: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Get current slate
      const { data: slateData } = await supabase
        .from('weekly_slate')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      
      if (slateData) setSlate(slateData)
      
      // Get recent bets
      const { data: betsData } = await supabase
        .from('bets')
        .select('*, user:users(name)')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (betsData) setRecentBets(betsData as any)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <UserBar />
      <BetSlip />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-6xl mb-4 block">🎰</span>
          <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight mb-4">
            BEANBAGS<span className="text-accent-green">BOOK</span>
          </h1>
          <p className="text-text-secondary text-lg mb-2">
            The Official Sportsbook of the 2030 Dynasty 🏆
          </p>
          {slate && (
            <p className="text-accent-gold font-heading">
              Week {slate.current_week} — {slate.slate_status.toUpperCase()}
            </p>
          )}
        </div>

        {/* Name entry */}
        {!user && (
          <div className="max-w-xl mx-auto mb-12">
            <NameEntry />
            <p className="text-center text-text-secondary text-sm mt-2">
              New users start with 100 units
            </p>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link href="/lines" className="card p-6 text-center hover:border-accent-green transition group">
            <span className="text-3xl mb-2 block">📊</span>
            <span className="font-heading font-bold group-hover:text-accent-green transition">
              This Week's Lines
            </span>
          </Link>
          <Link href="/futures" className="card p-6 text-center hover:border-accent-green transition group">
            <span className="text-3xl mb-2 block">🏆</span>
            <span className="font-heading font-bold group-hover:text-accent-green transition">
              Futures
            </span>
          </Link>
          <Link href="/leaderboard" className="card p-6 text-center hover:border-accent-green transition group">
            <span className="text-3xl mb-2 block">🥇</span>
            <span className="font-heading font-bold group-hover:text-accent-green transition">
              Leaderboard
            </span>
          </Link>
          <Link href="/bets" className="card p-6 text-center hover:border-accent-green transition group">
            <span className="text-3xl mb-2 block">🎫</span>
            <span className="font-heading font-bold group-hover:text-accent-green transition">
              My Bets
            </span>
          </Link>
        </div>

        {/* Recent activity ticker */}
        {recentBets.length > 0 && (
          <div className="card p-4 mb-8">
            <h3 className="font-heading font-bold text-sm text-text-secondary mb-3">RECENT ACTION</h3>
            <div className="ticker-wrapper">
              <div className="ticker-content">
                {[...recentBets, ...recentBets].map((bet, i) => (
                  <span key={i} className="inline-flex items-center gap-2 mx-4">
                    <span className="text-accent-green">●</span>
                    <span className="text-text-primary">{bet.user?.name}</span>
                    <span className="text-text-secondary">bet {bet.units_wagered}u on</span>
                    <span className="text-accent-gold">{bet.selection}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats preview */}
        {user && (
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-text-secondary text-sm">Balance</p>
                <p className="font-heading text-2xl text-accent-green">{user.units_remaining.toFixed(2)}u</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Wagered</p>
                <p className="font-heading text-2xl">{user.units_wagered.toFixed(2)}u</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Won</p>
                <p className="font-heading text-2xl text-accent-green">+{user.units_won.toFixed(2)}u</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Lost</p>
                <p className="font-heading text-2xl text-accent-red">-{user.units_lost.toFixed(2)}u</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
