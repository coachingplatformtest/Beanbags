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

/** Returns true if the user is allowed to bet on a prop belonging to propTeamShortName. */
export function canBetProp(userName: string, propTeamShortName: string | null | undefined): boolean {
  if (!propTeamShortName) return true // no team tag = unrestricted
  const userTeam = getUserTeam(userName)
  if (!userTeam) return true // unrestricted user
  return userTeam.toLowerCase() !== propTeamShortName.toLowerCase()
}
