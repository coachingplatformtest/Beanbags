import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, BetSlipItem } from '@/types'
import { calculateParlayOdds, calculateParlayPayout, calculatePayout } from './betting-math'

interface AppStore {
  // User
  user: User | null
  setUser: (user: User | null) => void
  updateUserUnits: (units: number) => void
  
  // Bet Slip
  betSlip: BetSlipItem[]
  parlayMode: boolean
  stake: number
  addToSlip: (item: BetSlipItem) => void
  removeFromSlip: (id: string) => void
  clearSlip: () => void
  isInSlip: (id: string) => boolean
  setStake: (stake: number) => void
  setParlayMode: (mode: boolean) => void
  
  // Computed
  getTotalOdds: () => number
  getPotentialPayout: () => { profit: number; total: number }
  
  // UI
  slipOpen: boolean
  setSlipOpen: (open: boolean) => void
  
  // Slate
  slateStatus: 'open' | 'locked' | 'settled'
  setSlateStatus: (status: 'open' | 'locked' | 'settled') => void
  
  // Admin
  isAdmin: boolean
  setIsAdmin: (admin: boolean) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      updateUserUnits: (units) => {
        const user = get().user
        if (user) set({ user: { ...user, units_remaining: units } })
      },
      
      // Bet Slip
      betSlip: [],
      parlayMode: false,
      stake: 1,
      
      addToSlip: (item) => {
        const slip = get().betSlip
        if (slip.length >= 5) return // Max 5 for parlays
        if (slip.some(s => s.id === item.id)) return
        set({ betSlip: [...slip, item] })
      },
      
      removeFromSlip: (id) => {
        set({ betSlip: get().betSlip.filter(s => s.id !== id) })
      },
      
      clearSlip: () => set({ betSlip: [], stake: 1, parlayMode: false }),
      
      isInSlip: (id) => get().betSlip.some(s => s.id === id),
      
      setStake: (stake) => set({ stake: Math.max(0.5, stake) }),
      
      setParlayMode: (mode) => set({ parlayMode: mode }),
      
      getTotalOdds: () => {
        const { betSlip, parlayMode } = get()
        if (betSlip.length === 0) return 0
        if (!parlayMode || betSlip.length === 1) {
          return betSlip[0]?.odds || 0
        }
        return calculateParlayOdds(betSlip.map(s => s.odds))
      },
      
      getPotentialPayout: () => {
        const { betSlip, parlayMode, stake } = get()
        if (betSlip.length === 0) return { profit: 0, total: 0 }
        
        if (parlayMode && betSlip.length > 1) {
          return calculateParlayPayout(betSlip.map(s => s.odds), stake)
        }
        
        // Straight bets - calculate for first item only (each bet separate)
        if (betSlip.length === 1) {
          return calculatePayout(betSlip[0].odds, stake)
        }
        
        // Multiple straight bets - sum payouts
        let totalProfit = 0
        for (const item of betSlip) {
          const { profit } = calculatePayout(item.odds, stake)
          totalProfit += profit
        }
        return { profit: totalProfit, total: stake * betSlip.length + totalProfit }
      },
      
      // UI
      slipOpen: false,
      setSlipOpen: (open) => set({ slipOpen: open }),
      
      // Slate
      slateStatus: 'open',
      setSlateStatus: (status) => set({ slateStatus: status }),
      
      // Admin
      isAdmin: false,
      setIsAdmin: (admin) => set({ isAdmin: admin }),
    }),
    {
      name: 'beanbags-book',
      partialize: (state) => ({
        user: state.user,
        isAdmin: state.isAdmin,
      }),
    }
  )
)
