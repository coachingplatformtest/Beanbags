// BEANBAGS BOOK - Odds Movement Logic

interface ActionSummary {
  totalUnits: number
  sideAUnits: number
  sideBUnits: number
  sideAPercent: number
  sideBPercent: number
}

/**
 * Calculate action distribution for a betting market
 */
export function calculateAction(
  bets: { selection: string; units_wagered: number }[],
  sideASelections: string[],
  sideBSelections: string[]
): ActionSummary {
  let sideAUnits = 0
  let sideBUnits = 0
  
  for (const bet of bets) {
    if (sideASelections.some(s => bet.selection.includes(s))) {
      sideAUnits += bet.units_wagered
    } else if (sideBSelections.some(s => bet.selection.includes(s))) {
      sideBUnits += bet.units_wagered
    }
  }
  
  const totalUnits = sideAUnits + sideBUnits
  return {
    totalUnits,
    sideAUnits,
    sideBUnits,
    sideAPercent: totalUnits > 0 ? (sideAUnits / totalUnits) * 100 : 50,
    sideBPercent: totalUnits > 0 ? (sideBUnits / totalUnits) * 100 : 50,
  }
}

/**
 * Suggest spread adjustment based on action
 * 70%+ on one side → 0.5 point move
 * 85%+ on one side → 1.0 point move
 * Max 2 points from opening
 */
export function suggestSpreadMove(
  currentSpread: number,
  openingSpread: number,
  action: ActionSummary,
  favoredSide: 'home' | 'away'
): { suggestedSpread: number; reason: string } | null {
  const heavySide = action.sideAPercent > action.sideBPercent ? 'A' : 'B'
  const heavyPercent = Math.max(action.sideAPercent, action.sideBPercent)
  
  if (heavyPercent < 70) return null
  
  let move = 0
  if (heavyPercent >= 85) {
    move = 1.0
  } else if (heavyPercent >= 70) {
    move = 0.5
  }
  
  // Check max movement
  const maxMove = 2.0
  const currentMove = Math.abs(currentSpread - openingSpread)
  if (currentMove + move > maxMove) {
    move = Math.max(0, maxMove - currentMove)
  }
  
  if (move === 0) return null
  
  // Move spread toward heavy side
  const suggestedSpread = currentSpread + (heavySide === 'A' ? -move : move)
  
  return {
    suggestedSpread,
    reason: `${heavyPercent.toFixed(0)}% of action on one side`
  }
}

/**
 * Suggest moneyline adjustment
 * 70%+ → 15 points
 * 85%+ → 30 points
 * Max 50 points from opening
 */
export function suggestMLMove(
  currentML: number,
  openingML: number,
  heavyPercent: number
): { suggestedML: number; reason: string } | null {
  if (heavyPercent < 70) return null
  
  let move = 0
  if (heavyPercent >= 85) {
    move = 30
  } else if (heavyPercent >= 70) {
    move = 15
  }
  
  const maxMove = 50
  const currentMove = Math.abs(currentML - openingML)
  if (currentMove + move > maxMove) {
    move = Math.max(0, maxMove - currentMove)
  }
  
  if (move === 0) return null
  
  // Move towards favorite (more negative)
  const suggestedML = currentML > 0 
    ? currentML - move
    : currentML - move
  
  return {
    suggestedML,
    reason: `${heavyPercent.toFixed(0)}% of action`
  }
}

/**
 * Suggest futures odds shortening
 * 3+ bets → shorten 10-15%
 * 5+ bets → shorten 20-25%
 */
export function suggestFuturesMove(
  currentOdds: number,
  betCount: number
): { suggestedOdds: number; reason: string } | null {
  if (betCount < 3) return null
  
  let shortenPercent = 0
  if (betCount >= 5) {
    shortenPercent = 0.22 // 22%
  } else if (betCount >= 3) {
    shortenPercent = 0.12 // 12%
  }
  
  const suggestedOdds = Math.round(currentOdds * (1 - shortenPercent))
  
  return {
    suggestedOdds,
    reason: `${betCount} bets placed`
  }
}
