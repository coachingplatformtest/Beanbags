// Maps each user (lowercase) to their team's short_name in the DB
export const USER_TEAM_MAP: Record<string, string> = {
  cole: 'Penn State',
  hunt: 'Clemson',
  ray: 'Florida State',
  scotty: 'Buffalo',
  major: 'Ohio State',
  gavin: 'Virginia Tech',
  nate: 'LSU',
  adkins: 'Notre Dame',
  // Cory has no team — can bet on anything
}

/** Returns the team short_name for a given user, or null if unrestricted. */
export function getUserTeam(userName: string): string | null {
  return USER_TEAM_MAP[userName.toLowerCase()] ?? null
}

/**
 * Returns true if the user is allowed to bet on a prop for a given game.
 * Blocked if the user's team is either the home OR away team in that game.
 * Props with no game attached are unrestricted.
 */
export function canBetProp(
  userName: string,
  gameHomeTeamShortName: string | null | undefined,
  gameAwayTeamShortName: string | null | undefined,
): boolean {
  const userTeam = getUserTeam(userName)
  if (!userTeam) return true // Cory and any unmapped user — unrestricted
  if (!gameHomeTeamShortName && !gameAwayTeamShortName) return true // no game = unrestricted

  const ut = userTeam.toLowerCase()
  const home = (gameHomeTeamShortName ?? '').toLowerCase()
  const away = (gameAwayTeamShortName ?? '').toLowerCase()
  return ut !== home && ut !== away
}
