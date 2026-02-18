'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { UserBar } from '@/components'
import { formatOdds, settleSpread, settleMoneyline, settleTotal, calculateSettlement } from '@/lib/betting-math'
import type { Team, Game, Future, Prop, User, Bet, ParlayBet, ParlayLeg, WeeklySlate } from '@/types'

type Tab = 'slate' | 'games' | 'futures' | 'props' | 'users' | 'settle' | 'bets'

export default function AdminPage() {
  const { isAdmin, setIsAdmin } = useStore()
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<Tab>('slate')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Data
  const [slate, setSlate] = useState<WeeklySlate | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [futures, setFutures] = useState<Future[]>([])
  const [props, setProps] = useState<Prop[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [allBets, setAllBets] = useState<any[]>([])
  const [allParlays, setAllParlays] = useState<any[]>([])

  useEffect(() => {
    if (isAdmin) loadAll()
  }, [isAdmin])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [slateRes, teamsRes, gamesRes, futuresRes, propsRes, usersRes, betsRes, parlaysRes] = await Promise.all([
        supabase.from('weekly_slate').select('*').order('updated_at', { ascending: false }).limit(1).single(),
        supabase.from('teams').select('*').order('short_name'),
        supabase.from('games').select('*, home_team:teams!games_home_team_id_fkey(*), away_team:teams!games_away_team_id_fkey(*)').order('week'),
        supabase.from('futures').select('*').order('odds_numeric'),
        supabase.from('props').select('*, team:teams(*), game:games(*, home_team:teams!games_home_team_id_fkey(*), away_team:teams!games_away_team_id_fkey(*))').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('units_remaining', { ascending: false }),
        supabase.from('bets').select('*, user:users(name)').order('created_at', { ascending: false }),
        supabase.from('parlay_bets').select('*, user:users(name), legs:parlay_legs(*)').order('created_at', { ascending: false }),
      ])
      if (slateRes.data) setSlate(slateRes.data)
      if (teamsRes.data) setTeams(teamsRes.data)
      if (gamesRes.data) setGames(gamesRes.data as Game[])
      if (futuresRes.data) setFutures(futuresRes.data as Future[])
      if (propsRes.data) setProps(propsRes.data as Prop[])
      if (usersRes.data) setUsers(usersRes.data)
      if (betsRes.data) setAllBets(betsRes.data)
      if (parlaysRes.data) setAllParlays(parlaysRes.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const login = () => {
    if (password === 'beanbags2030' || password === process.env.ADMIN_PASSWORD) {
      setIsAdmin(true)
    } else {
      setMsg('Invalid password')
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <UserBar />
        <main className="max-w-md mx-auto px-4 py-12">
          <div className="card p-6">
            <h1 className="font-heading text-xl font-bold mb-4">Admin Login</h1>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-lg mb-4"
              onKeyDown={(e) => e.key === 'Enter' && login()}
            />
            <button onClick={login} className="w-full py-3 bg-accent-green text-bg-primary font-bold rounded-lg">
              Login
            </button>
            {msg && <p className="text-accent-red text-sm mt-2">{msg}</p>}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <UserBar />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl font-bold">ADMIN</h1>
          <button onClick={() => setIsAdmin(false)} className="text-sm text-text-secondary hover:text-accent-red">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {(['slate', 'games', 'futures', 'props', 'users', 'bets', 'settle'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition
                ${tab === t ? 'bg-accent-green text-bg-primary' : 'bg-bg-card border border-border-subtle'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg ${msg.startsWith('✓') ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
            {msg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading...</div>
        ) : (
          <>
            {tab === 'slate' && <SlateTab slate={slate} onRefresh={loadAll} setMsg={setMsg} />}
            {tab === 'games' && <GamesTab games={games} teams={teams} onRefresh={loadAll} setMsg={setMsg} />}
            {tab === 'futures' && <FuturesTab futures={futures} onRefresh={loadAll} setMsg={setMsg} />}
            {tab === 'props' && <PropsTab props={props} teams={teams} games={games} onRefresh={loadAll} setMsg={setMsg} />}
            {tab === 'users' && <UsersTab users={users} onRefresh={loadAll} setMsg={setMsg} />}
            {tab === 'bets' && <BetsTab bets={allBets} parlays={allParlays} />}
            {tab === 'settle' && <SettleTab games={games} futures={futures} props={props} onRefresh={loadAll} setMsg={setMsg} />}
          </>
        )}
      </main>
    </div>
  )
}

// Slate Tab
function SlateTab({ slate, onRefresh, setMsg }: { slate: WeeklySlate | null; onRefresh: () => void; setMsg: (m: string) => void }) {
  const [week, setWeek] = useState(slate?.current_week || 1)
  const [status, setStatus] = useState(slate?.slate_status || 'open')

  const save = async () => {
    if (!slate) return
    const { error } = await supabase
      .from('weekly_slate')
      .update({ current_week: week, slate_status: status, updated_at: new Date().toISOString() })
      .eq('id', slate.id)
    if (error) setMsg(error.message)
    else { setMsg('✓ Slate updated'); onRefresh() }
  }

  return (
    <div className="card p-6 max-w-md">
      <h2 className="font-heading font-bold text-lg mb-4">Manage Slate</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-text-secondary">Current Week</label>
          <input
            type="number"
            value={week}
            onChange={(e) => setWeek(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-bg-primary border border-border-subtle rounded-lg mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-4 py-2 bg-bg-primary border border-border-subtle rounded-lg mt-1"
          >
            <option value="open">Open</option>
            <option value="locked">Locked</option>
            <option value="settled">Settled</option>
          </select>
        </div>
        <button onClick={save} className="w-full py-3 bg-accent-green text-bg-primary font-bold rounded-lg">
          Save
        </button>
      </div>
    </div>
  )
}

// Games Tab
function GamesTab({ games, teams, onRefresh, setMsg }: { games: Game[]; teams: Team[]; onRefresh: () => void; setMsg: (m: string) => void }) {
  const [editing, setEditing] = useState<Game | null>(null)
  const [scores, setScores] = useState({ home: '', away: '' })

  const enterScores = async (game: Game) => {
    const h = parseInt(scores.home), a = parseInt(scores.away)
    if (isNaN(h) || isNaN(a)) { setMsg('Invalid scores'); return }
    const { error } = await supabase
      .from('games')
      .update({ home_score: h, away_score: a, game_status: 'final' })
      .eq('id', game.id)
    if (error) setMsg(error.message)
    else { setMsg('✓ Scores saved'); setEditing(null); setScores({ home: '', away: '' }); onRefresh() }
  }

  return (
    <div className="space-y-4">
      {games.map(g => (
        <div key={g.id} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Week {g.week}</span>
              {g.is_user_game && <span className="badge badge-user-game">User</span>}
              {g.game_status === 'final' && <span className="badge badge-won">Final</span>}
            </div>
          </div>
          <p className="font-heading font-bold mb-2">
            {g.away_team?.short_name} @ {g.home_team?.short_name}
          </p>
          <div className="text-sm text-text-secondary mb-3">
            Spread: {g.spread_line} | Total: {g.total_line} | ML: {formatOdds(g.moneyline_home!)}/{formatOdds(g.moneyline_away!)}
          </div>
          
          {editing?.id === g.id ? (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Away"
                value={scores.away}
                onChange={(e) => setScores(s => ({ ...s, away: e.target.value }))}
                className="w-20 px-2 py-1 bg-bg-primary border border-border-subtle rounded"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Home"
                value={scores.home}
                onChange={(e) => setScores(s => ({ ...s, home: e.target.value }))}
                className="w-20 px-2 py-1 bg-bg-primary border border-border-subtle rounded"
              />
              <button onClick={() => enterScores(g)} className="px-3 py-1 bg-accent-green text-bg-primary rounded text-sm">
                Save
              </button>
              <button onClick={() => setEditing(null)} className="px-3 py-1 bg-bg-surface rounded text-sm">
                Cancel
              </button>
            </div>
          ) : g.game_status === 'final' ? (
            <p className="font-heading">{g.away_score} - {g.home_score}</p>
          ) : (
            <button
              onClick={() => { setEditing(g); setScores({ home: '', away: '' }) }}
              className="px-3 py-1 bg-bg-surface rounded text-sm hover:bg-accent-green hover:text-bg-primary"
            >
              Enter Score
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// Futures Tab
function FuturesTab({ futures, onRefresh, setMsg }: { futures: Future[]; onRefresh: () => void; setMsg: (m: string) => void }) {
  const settle = async (f: Future, result: 'won' | 'lost') => {
    const { error } = await supabase
      .from('futures')
      .update({ result, is_active: false })
      .eq('id', f.id)
    if (error) setMsg(error.message)
    else { setMsg(`✓ ${f.selection_name} marked ${result}`); onRefresh() }
  }

  const grouped = {
    natty: futures.filter(f => f.category === 'national_championship'),
    heisman: futures.filter(f => f.category === 'heisman'),
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <h2 className="font-heading font-bold text-lg mb-4 capitalize">{cat.replace('_', ' ')}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(f => (
              <div key={f.id} className={`card p-3 ${f.result ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{f.selection_name}</p>
                    <p className="text-accent-gold font-heading">{f.odds}</p>
                  </div>
                  {f.result ? (
                    <span className={`badge badge-${f.result}`}>{f.result}</span>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => settle(f, 'won')} className="px-2 py-1 bg-accent-green/20 text-accent-green rounded text-xs">
                        Won
                      </button>
                      <button onClick={() => settle(f, 'lost')} className="px-2 py-1 bg-accent-red/20 text-accent-red rounded text-xs">
                        Lost
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Props Tab
function PropsTab({ props, teams, games, onRefresh, setMsg }: { props: Prop[]; teams: Team[]; games: Game[]; onRefresh: () => void; setMsg: (m: string) => void }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ description: '', position: '', game_id: '', team_id: '' })

  const startEdit = (p: Prop) => {
    setEditForm({
      description: p.description || '',
      position: p.position || '',
      game_id: p.game_id || '',
      team_id: p.team_id || '',
    })
    setEditing(p.id)
  }

  const saveEdit = async (p: Prop) => {
    const { error } = await supabase
      .from('props')
      .update({
        description: editForm.description || p.description,
        position: editForm.position || null,
        game_id: editForm.game_id || null,
        team_id: editForm.team_id || null,
      })
      .eq('id', p.id)
    if (error) setMsg(error.message)
    else { setMsg('✓ Prop updated'); setEditing(null); onRefresh() }
  }

  const settle = async (p: Prop, result: 'selection_won' | 'counter_won') => {
    const { error } = await supabase
      .from('props')
      .update({ result, is_active: false })
      .eq('id', p.id)
    if (error) setMsg(error.message)
    else { setMsg('✓ Prop settled'); onRefresh() }
  }

  const userGames = games.filter(g => g.is_user_game)

  return (
    <div className="space-y-4">
      {props.map(p => (
        <div key={p.id} className={`card p-4 ${p.result ? 'opacity-60' : ''}`}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="font-heading font-bold truncate">{p.description}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {p.team && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg-surface border border-border-subtle">
                    {p.team.logo_emoji} {p.team.short_name}
                  </span>
                )}
                {p.position && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg-surface text-accent-gold border border-accent-gold/40 font-bold">
                    {p.position}
                  </span>
                )}
                {p.game && (
                  <span className="text-xs text-text-secondary">
                    {p.game.away_team?.abbreviation} @ {p.game.home_team?.abbreviation} • Wk {p.week}
                  </span>
                )}
              </div>
            </div>
            {!p.result && (
              <button
                onClick={() => editing === p.id ? setEditing(null) : startEdit(p)}
                className="text-xs px-2 py-1 bg-bg-surface border border-border-subtle rounded shrink-0 hover:border-accent-green"
              >
                {editing === p.id ? '✕ Cancel' : '✏️ Edit'}
              </button>
            )}
          </div>

          {/* Edit form */}
          {editing === p.id && (
            <div className="mb-3 p-3 bg-bg-surface rounded-lg space-y-2">
              <div>
                <label className="text-xs text-text-secondary">Full Name / Description</label>
                <input
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-bg-primary border border-border-subtle rounded text-sm mt-1"
                  placeholder="e.g. Peter Mauldin Passing Yards"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-text-secondary">Position</label>
                  <input
                    value={editForm.position}
                    onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-bg-primary border border-border-subtle rounded text-sm mt-1"
                    placeholder="QB / RB / WR"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-text-secondary">Team</label>
                  <select
                    value={editForm.team_id}
                    onChange={e => setEditForm(f => ({ ...f, team_id: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-bg-primary border border-border-subtle rounded text-sm mt-1"
                  >
                    <option value="">No team</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.logo_emoji} {t.short_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary">Game</label>
                <select
                  value={editForm.game_id}
                  onChange={e => setEditForm(f => ({ ...f, game_id: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-bg-primary border border-border-subtle rounded text-sm mt-1"
                >
                  <option value="">No game</option>
                  {userGames.map(g => (
                    <option key={g.id} value={g.id}>
                      Wk {g.week}: {g.away_team?.abbreviation} @ {g.home_team?.abbreviation}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => saveEdit(p)}
                className="w-full py-1.5 bg-accent-green text-bg-primary font-bold rounded text-sm"
              >
                Save
              </button>
            </div>
          )}

          {/* Odds display */}
          <div className="flex gap-2 text-sm">
            <div className="flex-1">
              <span className="text-text-secondary">{p.selection_name}</span>
              <span className="ml-2 font-heading">{formatOdds(p.odds)}</span>
            </div>
            {p.counter_selection && (
              <div className="flex-1">
                <span className="text-text-secondary">{p.counter_selection}</span>
                <span className="ml-2 font-heading">{formatOdds(p.counter_odds!)}</span>
              </div>
            )}
          </div>

          {/* Settle */}
          {p.result ? (
            <span className={`badge mt-2 ${p.result === 'selection_won' ? 'badge-won' : 'badge-lost'}`}>
              {p.result === 'selection_won' ? p.selection_name : p.counter_selection} won
            </span>
          ) : (
            <div className="flex gap-2 mt-3">
              <button onClick={() => settle(p, 'selection_won')} className="px-3 py-1 bg-accent-green/20 text-accent-green rounded text-sm">
                {p.selection_name} Won
              </button>
              {p.counter_selection && (
                <button onClick={() => settle(p, 'counter_won')} className="px-3 py-1 bg-accent-green/20 text-accent-green rounded text-sm">
                  {p.counter_selection} Won
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Users Tab
function UsersTab({ users, onRefresh, setMsg }: { users: User[]; onRefresh: () => void; setMsg: (m: string) => void }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [units, setUnits] = useState('')

  const save = async (u: User) => {
    const val = parseFloat(units)
    if (isNaN(val)) { setMsg('Invalid units'); return }
    const { error } = await supabase.from('users').update({ units_remaining: val }).eq('id', u.id)
    if (error) setMsg(error.message)
    else { setMsg('✓ Units updated'); setEditing(null); onRefresh() }
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="bg-bg-surface">
          <tr>
            <th className="px-4 py-3 text-left text-sm">Name</th>
            <th className="px-4 py-3 text-right text-sm">Balance</th>
            <th className="px-4 py-3 text-right text-sm">Wagered</th>
            <th className="px-4 py-3 text-right text-sm">Won</th>
            <th className="px-4 py-3 text-right text-sm">Lost</th>
            <th className="px-4 py-3 text-right text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t border-border-subtle">
              <td className="px-4 py-3">{u.name}</td>
              <td className="px-4 py-3 text-right">
                {editing === u.id ? (
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-24 px-2 py-1 bg-bg-primary border border-border-subtle rounded text-right"
                  />
                ) : (
                  <span className="font-heading">{u.units_remaining.toFixed(2)}</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-text-secondary">{u.units_wagered.toFixed(2)}</td>
              <td className="px-4 py-3 text-right text-accent-green">{u.units_won.toFixed(2)}</td>
              <td className="px-4 py-3 text-right text-accent-red">{u.units_lost.toFixed(2)}</td>
              <td className="px-4 py-3 text-right">
                {editing === u.id ? (
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => save(u)} className="px-2 py-1 bg-accent-green text-bg-primary rounded text-sm">Save</button>
                    <button onClick={() => setEditing(null)} className="px-2 py-1 bg-bg-surface rounded text-sm">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(u.id); setUnits(u.units_remaining.toString()) }} className="px-2 py-1 bg-bg-surface rounded text-sm">
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Bets Tab
function BetsTab({ bets, parlays }: { bets: any[]; parlays: any[] }) {
  const [filterUser, setFilterUser] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [view, setView] = useState<'straight' | 'parlays'>('straight')

  const users = Array.from(new Set(
    (view === 'straight' ? bets : parlays).map((b: any) => b.user?.name).filter(Boolean)
  ))

  const filteredBets = bets.filter(b => {
    if (filterUser !== 'all' && b.user?.name !== filterUser) return false
    if (filterStatus !== 'all' && b.status !== filterStatus) return false
    return true
  })

  const filteredParlays = parlays.filter(p => {
    if (filterUser !== 'all' && p.user?.name !== filterUser) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  })

  const statusColor = (s: string) => {
    if (s === 'won') return 'text-accent-green'
    if (s === 'lost') return 'text-accent-red'
    if (s === 'push') return 'text-accent-gold'
    return 'text-text-secondary'
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setView('straight')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${view === 'straight' ? 'bg-accent-green text-bg-primary' : 'bg-bg-card border border-border-subtle'}`}
          >
            Straight ({bets.length})
          </button>
          <button
            onClick={() => setView('parlays')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${view === 'parlays' ? 'bg-accent-green text-bg-primary' : 'bg-bg-card border border-border-subtle'}`}
          >
            Parlays ({parlays.length})
          </button>
        </div>
        <select
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          className="px-3 py-2 bg-bg-card border border-border-subtle rounded-lg text-sm"
        >
          <option value="all">All Users</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-bg-card border border-border-subtle rounded-lg text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="push">Push</option>
        </select>
      </div>

      {view === 'straight' ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Selection</th>
                <th className="px-4 py-3 text-right">Odds</th>
                <th className="px-4 py-3 text-right">Wager</th>
                <th className="px-4 py-3 text-right">To Win</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBets.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-text-secondary">No bets found</td></tr>
              ) : filteredBets.map(b => (
                <tr key={b.id} className="border-t border-border-subtle hover:bg-bg-surface/50">
                  <td className="px-4 py-3 font-medium">{b.user?.name || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{b.selection}</td>
                  <td className="px-4 py-3 text-right font-heading">{formatOdds(b.odds)}</td>
                  <td className="px-4 py-3 text-right">{b.units_wagered.toFixed(1)}u</td>
                  <td className="px-4 py-3 text-right text-accent-green">+{(b.potential_payout - b.units_wagered).toFixed(1)}u</td>
                  <td className={`px-4 py-3 text-right font-semibold capitalize ${statusColor(b.status)}`}>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredParlays.length === 0 ? (
            <div className="card p-8 text-center text-text-secondary">No parlays found</div>
          ) : filteredParlays.map(p => (
            <div key={p.id} className="card p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-heading font-bold">{p.user?.name || '—'}</span>
                  <span className="text-text-secondary text-sm">{p.legs?.length}-leg parlay</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{p.units_wagered.toFixed(1)}u → <span className="text-accent-green">+{(p.potential_payout - p.units_wagered).toFixed(1)}u</span></span>
                  <span className={`font-semibold capitalize text-sm ${statusColor(p.status)}`}>{p.status}</span>
                </div>
              </div>
              <div className="space-y-1">
                {(p.legs || []).map((leg: any) => (
                  <div key={leg.id} className="flex justify-between text-sm text-text-secondary pl-2 border-l border-border-subtle">
                    <span>{leg.selection}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-heading">{formatOdds(leg.odds)}</span>
                      {leg.status !== 'pending' && (
                        <span className={`text-xs font-semibold capitalize ${statusColor(leg.status)}`}>{leg.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Settle Tab
function SettleTab({ games, futures, props, onRefresh, setMsg }: { games: Game[]; futures: Future[]; props: Prop[]; onRefresh: () => void; setMsg: (m: string) => void }) {
  const [settling, setSettling] = useState(false)

  const settleAll = async () => {
    setSettling(true)
    try {
      // Fetch everything fresh so we always have latest scores + prop results
      const { data: freshGames } = await supabase.from('games').select('*')
      const { data: freshTeams } = await supabase.from('teams').select('*')
      const { data: freshProps } = await supabase.from('props').select('*')
      const gamesList = (freshGames || []) as Game[]
      const propsList = (freshProps || []) as Prop[]
      // Build team lookup so we can resolve home/away team names without joins
      const teamById: Record<string, Team> = {}
      for (const t of (freshTeams || [])) teamById[t.id] = t as Team

      // Get pending bets
      const { data: bets } = await supabase.from('bets').select('*').eq('status', 'pending')
      const { data: parlays } = await supabase.from('parlay_bets').select('*, legs:parlay_legs(*)').eq('status', 'pending')

      let settled = 0

      // Settle straight bets
      for (const bet of (bets || [])) {
        let result: 'won' | 'lost' | 'push' | null = null
        
        if (bet.game_id) {
          const game = gamesList.find(g => g.id === bet.game_id)
          if (!game || game.game_status !== 'final') continue
          const homeShort = teamById[game.home_team_id]?.short_name || ''
          
          if (bet.bet_type === 'spread') {
            const side = bet.selection.includes(homeShort) ? 'home' : 'away'
            result = settleSpread(game.home_score!, game.away_score!, game.spread_line!, side)
          } else if (bet.bet_type === 'moneyline') {
            const side = bet.selection.includes(homeShort) ? 'home' : 'away'
            result = settleMoneyline(game.home_score!, game.away_score!, side)
          } else if (bet.bet_type === 'total') {
            const side = bet.selection.includes('O') ? 'over' : 'under'
            result = settleTotal(game.home_score!, game.away_score!, game.total_line!, side)
          }
        } else if (bet.future_id) {
          const future = futures.find(f => f.id === bet.future_id)
          if (!future || !future.result) continue
          result = future.result === 'won' ? 'won' : 'lost'
        } else if (bet.prop_id) {
          const prop = propsList.find(p => p.id === bet.prop_id)
          if (!prop || !prop.result) continue
          const pickedSelection = bet.selection.includes(prop.selection_name)
          result = (pickedSelection && prop.result === 'selection_won') || (!pickedSelection && prop.result === 'counter_won') ? 'won' : 'lost'
        }

        if (result) {
          const { unitsChange } = calculateSettlement(bet.units_wagered, bet.odds, result)
          await supabase.from('bets').update({ status: result, settled_at: new Date().toISOString() }).eq('id', bet.id)
          
          // Update user
          const { data: user } = await supabase.from('users').select('*').eq('id', bet.user_id).single()
          if (user) {
            const updates: any = {}
            if (result === 'won') {
              updates.units_remaining = user.units_remaining + bet.potential_payout
              updates.units_won = user.units_won + (bet.potential_payout - bet.units_wagered)
            } else if (result === 'lost') {
              updates.units_lost = user.units_lost + bet.units_wagered
            } else if (result === 'push') {
              updates.units_remaining = user.units_remaining + bet.units_wagered
            }
            await supabase.from('users').update(updates).eq('id', user.id)
          }
          settled++
        }
      }

      // Settle parlays
      for (const parlay of (parlays || [])) {
        let allSettled = true
        let anyLost = false
        
        for (const leg of parlay.legs || []) {
          if (leg.status !== 'pending') {
            if (leg.status === 'lost') anyLost = true
            continue
          }

          let result: 'won' | 'lost' | 'push' | null = null
          
          if (leg.game_id) {
            const game = gamesList.find(g => g.id === leg.game_id)
            if (!game || game.game_status !== 'final') { allSettled = false; continue }
            const homeShort = teamById[game.home_team_id]?.short_name || ''
            
            if (leg.bet_type === 'spread') {
              const side = leg.selection.includes(homeShort) ? 'home' : 'away'
              result = settleSpread(game.home_score!, game.away_score!, game.spread_line!, side)
            } else if (leg.bet_type === 'moneyline') {
              const side = leg.selection.includes(homeShort) ? 'home' : 'away'
              result = settleMoneyline(game.home_score!, game.away_score!, side)
            } else if (leg.bet_type === 'total') {
              const side = leg.selection.includes('O') ? 'over' : 'under'
              result = settleTotal(game.home_score!, game.away_score!, game.total_line!, side)
            }
          } else if (leg.future_id) {
            const future = futures.find(f => f.id === leg.future_id)
            if (!future || !future.result) { allSettled = false; continue }
            result = future.result === 'won' ? 'won' : 'lost'
          } else if (leg.prop_id) {
            const prop = propsList.find(p => p.id === leg.prop_id)
            if (!prop || !prop.result) { allSettled = false; continue }
            const pickedSelection = leg.selection.includes(prop.selection_name)
            result = (pickedSelection && prop.result === 'selection_won') || (!pickedSelection && prop.result === 'counter_won') ? 'won' : 'lost'
          }

          if (result) {
            await supabase.from('parlay_legs').update({ status: result }).eq('id', leg.id)
            if (result === 'lost') anyLost = true
          } else {
            allSettled = false
          }
        }

        if (allSettled || anyLost) {
          const parlayResult = anyLost ? 'lost' : 'won'
          await supabase.from('parlay_bets').update({ status: parlayResult, settled_at: new Date().toISOString() }).eq('id', parlay.id)
          
          const { data: user } = await supabase.from('users').select('*').eq('id', parlay.user_id).single()
          if (user) {
            if (parlayResult === 'won') {
              await supabase.from('users').update({
                units_remaining: user.units_remaining + parlay.potential_payout,
                units_won: user.units_won + (parlay.potential_payout - parlay.units_wagered)
              }).eq('id', user.id)
            } else {
              await supabase.from('users').update({
                units_lost: user.units_lost + parlay.units_wagered
              }).eq('id', user.id)
            }
          }
          settled++
        }
      }

      setMsg(`✓ Settled ${settled} bets`)
      onRefresh()
    } catch (e: any) {
      setMsg(e.message || 'Error settling')
    }
    setSettling(false)
  }

  const [diagLines, setDiagLines] = useState<string[]>([])
  const [diagRunning, setDiagRunning] = useState(false)

  const runDiagnose = async () => {
    setDiagRunning(true)
    const lines: string[] = []
    try {
      const { data: freshGames } = await supabase.from('games').select('*')
      const { data: freshTeams } = await supabase.from('teams').select('*')
      const { data: freshProps } = await supabase.from('props').select('*')
      const { data: bets } = await supabase.from('bets').select('*').eq('status', 'pending')
      const { data: parlays } = await supabase.from('parlay_bets').select('*, legs:parlay_legs(*)').eq('status', 'pending')

      const teamById: Record<string, any> = {}
      for (const t of (freshTeams || [])) teamById[t.id] = t

      lines.push(`Games loaded: ${freshGames?.length ?? 0}`)
      lines.push(`Teams loaded: ${freshTeams?.length ?? 0}`)
      lines.push(`Props loaded: ${freshProps?.length ?? 0}`)
      lines.push(`Pending straight bets: ${bets?.length ?? 0}`)
      lines.push(`Pending parlays: ${parlays?.length ?? 0}`)
      lines.push('---')

      const finalGames = (freshGames || []).filter((g: any) => g.game_status === 'final')
      lines.push(`Final games: ${finalGames.length}`)
      for (const g of finalGames) {
        const home = teamById[g.home_team_id]?.short_name ?? g.home_team_id
        const away = teamById[g.away_team_id]?.short_name ?? g.away_team_id
        lines.push(`  ✓ ${away} @ ${home} — ${g.away_score}-${g.home_score}`)
      }

      const settledProps = (freshProps || []).filter((p: any) => p.result)
      lines.push(`Props with results: ${settledProps.length}`)
      for (const p of settledProps) {
        lines.push(`  ✓ ${p.description}: ${p.result}`)
      }
      lines.push('---')

      for (const parlay of (parlays || [])) {
        lines.push(`Parlay (user ${parlay.user_id.slice(0,8)}...) ${(parlay.legs || []).length} legs:`)
        for (const leg of (parlay.legs || [])) {
          if (leg.game_id) {
            const game = (freshGames || []).find((g: any) => g.id === leg.game_id)
            if (!game) { lines.push(`  ✗ leg "${leg.selection}" — game NOT FOUND`); continue }
            if (game.game_status !== 'final') { lines.push(`  ✗ leg "${leg.selection}" — game status: ${game.game_status}`); continue }
            lines.push(`  ✓ leg "${leg.selection}" — game final`)
          } else if (leg.prop_id) {
            const prop = (freshProps || []).find((p: any) => p.id === leg.prop_id)
            if (!prop) { lines.push(`  ✗ leg "${leg.selection}" — prop NOT FOUND`); continue }
            if (!prop.result) { lines.push(`  ✗ leg "${leg.selection}" — prop has no result yet`); continue }
            lines.push(`  ✓ leg "${leg.selection}" — prop result: ${prop.result}`)
          }
        }
      }
    } catch (e: any) {
      lines.push(`ERROR: ${e.message}`)
    }
    setDiagLines(lines)
    setDiagRunning(false)
  }

  const readyGames = games.filter(g => g.game_status === 'final')
  const settledFutures = futures.filter(f => f.result)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-text-secondary text-sm">Final Games</p>
          <p className="font-heading text-2xl">{readyGames.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-text-secondary text-sm">Settled Futures</p>
          <p className="font-heading text-2xl">{settledFutures.length}</p>
        </div>
      </div>

      <div className="card p-6 text-center">
        <h2 className="font-heading font-bold text-lg mb-2">Settle All Pending Bets</h2>
        <p className="text-text-secondary mb-4">
          Evaluates all pending bets against final game scores and settled futures/props.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={runDiagnose}
            disabled={diagRunning}
            className="px-6 py-3 bg-bg-surface border border-border-subtle font-bold rounded-lg hover:border-accent-gold disabled:opacity-50"
          >
            {diagRunning ? 'Checking...' : '🔍 Diagnose'}
          </button>
          <button
            onClick={settleAll}
            disabled={settling}
            className="px-6 py-3 bg-accent-green text-bg-primary font-bold rounded-lg disabled:opacity-50"
          >
            {settling ? 'Settling...' : 'Settle Bets'}
          </button>
        </div>
      </div>

      {diagLines.length > 0 && (
        <div className="card p-4 font-mono text-xs space-y-1">
          {diagLines.map((l, i) => (
            <div key={i} className={l.startsWith('  ✓') ? 'text-accent-green' : l.startsWith('  ✗') ? 'text-accent-red' : l === '---' ? 'border-t border-border-subtle pt-1 mt-1' : 'text-text-secondary'}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
