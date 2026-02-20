'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { formatUnits } from '@/lib/betting-math'

export function UserBar() {
  const { user, setUser, betSlip, slipOpen, setSlipOpen, slateStatus, setSlateStatus } = useStore()

  useEffect(() => {
    // Fetch slate status
    supabase
      .from('weekly_slate')
      .select('slate_status')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.slate_status) setSlateStatus(data.slate_status as any)
      })
    
    // Refresh user balance from DB on mount (prevents stale data)
    if (user) {
      supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setUser(data as any)
        })
    }
  }, [user?.id])

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎰</span>
          <span className="font-heading text-xl font-bold tracking-wide">
            BEANBAGS<span className="text-accent-green">BOOK</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/lines" className="text-sm font-medium text-text-secondary hover:text-accent-green transition">
            Lines
          </Link>
          <Link href="/futures" className="text-sm font-medium text-text-secondary hover:text-accent-green transition">
            Futures
          </Link>
          <Link href="/props" className="text-sm font-medium text-text-secondary hover:text-accent-green transition">
            Props
          </Link>
          <Link href="/bets" className="text-sm font-medium text-text-secondary hover:text-accent-green transition">
            My Bets
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium text-text-secondary hover:text-accent-green transition">
            Leaderboard
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {slateStatus !== 'open' && (
            <span className="hidden sm:flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-accent-red/10 text-accent-red border border-accent-red/30">
              🔒 {slateStatus === 'settled' ? 'SETTLED' : 'LOCKED'}
            </span>
          )}
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-bg-card px-3 py-1.5 rounded-full border border-border-subtle">
              <span className="text-sm text-text-secondary">{user.name}</span>
              <span className="font-heading font-bold text-accent-green">
                {formatUnits(user.units_remaining)}u
              </span>
            </div>
          )}
          
          {/* Bet slip toggle */}
          <button
            onClick={() => setSlipOpen(!slipOpen)}
            className="relative p-2 rounded-lg bg-bg-card border border-border-subtle hover:border-accent-green transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {betSlip.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-green text-bg-primary text-xs font-bold rounded-full flex items-center justify-center">
                {betSlip.length}
              </span>
            )}
          </button>

          <Link href="/admin" className="p-2 rounded-lg bg-bg-card border border-border-subtle hover:border-accent-green transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden flex items-center justify-around px-4 py-2 border-t border-border-subtle">
        <Link href="/lines" className="text-xs font-medium text-text-secondary hover:text-accent-green">Lines</Link>
        <Link href="/futures" className="text-xs font-medium text-text-secondary hover:text-accent-green">Futures</Link>
        <Link href="/props" className="text-xs font-medium text-text-secondary hover:text-accent-green">Props</Link>
        <Link href="/bets" className="text-xs font-medium text-text-secondary hover:text-accent-green">My Bets</Link>
        <Link href="/leaderboard" className="text-xs font-medium text-text-secondary hover:text-accent-green">Board</Link>
      </nav>
    </header>
  )
}
