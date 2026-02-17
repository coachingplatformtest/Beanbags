// BEANBAGS BOOK - Betting Math

/**
 * Convert American odds to decimal odds
 * +200 → 3.0
 * -150 → 1.667
 */
export function americanToDecimal(odds: number): number {
  if (odds > 0) {
    return (odds / 100) + 1
  } else {
    return (100 / Math.abs(odds)) + 1
  }
}

/**
 * Calculate payout for American odds
 * +200, 10 units → 20 profit, 30 return
 * -150, 10 units → 6.67 profit, 16.67 return
 */
export function calculatePayout(odds: number, wager: number): { profit: number; total: number } {
  let profit: number
  if (odds > 0) {
    profit = wager * (odds / 100)
  } else {
    profit = wager * (100 / Math.abs(odds))
  }
  return {
    profit: Math.round(profit * 100) / 100,
    total: Math.round((wager + profit) * 100) / 100
  }
}

/**
 * Calculate parlay odds from array of American odds
 * Multiplies decimal odds and converts back to American
 */
export function calculateParlayOdds(oddsArray: number[]): number {
  if (oddsArray.length === 0) return 0
  
  const combinedDecimal = oddsArray.reduce((acc, odds) => {
    return acc * americanToDecimal(odds)
  }, 1)
  
  // Convert back to American
  if (combinedDecimal >= 2) {
    return Math.round((combinedDecimal - 1) * 100)
  } else {
    return Math.round(-100 / (combinedDecimal - 1))
  }
}

/**
 * Calculate parlay payout
 */
export function calculateParlayPayout(oddsArray: number[], wager: number): { profit: number; total: number } {
  const combinedDecimal = oddsArray.reduce((acc, odds) => {
    return acc * americanToDecimal(odds)
  }, 1)
  
  const total = wager * combinedDecimal
  return {
    profit: Math.round((total - wager) * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}

/**
 * Format American odds for display
 */
export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`
}

/**
 * Format units with + sign for positive
 */
export function formatUnits(units: number, showSign = false): string {
  const formatted = units.toFixed(2)
  if (showSign && units > 0) return `+${formatted}`
  return formatted
}

// Settling Logic

export type SettleResult = 'won' | 'lost' | 'push'

/**
 * Settle spread bet
 * spread_line is from home team perspective (negative = home favored)
 */
export function settleSpread(
  homeScore: number,
  awayScore: number,
  spreadLine: number,
  pickedSide: 'home' | 'away'
): SettleResult {
  // Calculate cover
  // Home covers if: homeScore + spreadLine > awayScore (when home is underdog/getting points)
  // Or: homeScore > awayScore - spreadLine (when home is favorite)
  const homeWithSpread = homeScore + spreadLine
  
  if (pickedSide === 'home') {
    if (homeWithSpread > awayScore) return 'won'
    if (homeWithSpread < awayScore) return 'lost'
    return 'push'
  } else {
    // Away covers if homeWithSpread < awayScore
    if (homeWithSpread < awayScore) return 'won'
    if (homeWithSpread > awayScore) return 'lost'
    return 'push'
  }
}

/**
 * Settle moneyline bet
 */
export function settleMoneyline(
  homeScore: number,
  awayScore: number,
  pickedSide: 'home' | 'away'
): SettleResult {
  if (homeScore === awayScore) return 'push'
  
  const homeWon = homeScore > awayScore
  if (pickedSide === 'home') {
    return homeWon ? 'won' : 'lost'
  } else {
    return homeWon ? 'lost' : 'won'
  }
}

/**
 * Settle total (over/under) bet
 */
export function settleTotal(
  homeScore: number,
  awayScore: number,
  totalLine: number,
  pickedSide: 'over' | 'under'
): SettleResult {
  const actualTotal = homeScore + awayScore
  
  if (actualTotal === totalLine) return 'push'
  
  const wentOver = actualTotal > totalLine
  if (pickedSide === 'over') {
    return wentOver ? 'won' : 'lost'
  } else {
    return wentOver ? 'lost' : 'won'
  }
}

/**
 * Calculate units change based on bet result
 */
export function calculateSettlement(
  wager: number,
  odds: number,
  result: SettleResult
): { unitsChange: number; payout: number } {
  switch (result) {
    case 'won':
      const { profit } = calculatePayout(odds, wager)
      return { unitsChange: profit, payout: wager + profit }
    case 'lost':
      return { unitsChange: -wager, payout: 0 }
    case 'push':
      return { unitsChange: 0, payout: wager }
  }
}
