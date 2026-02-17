'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import type { User } from '@/types'

export function NameEntry() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setUser = useStore(s => s.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      // Check if exists
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('name', name.trim())
        .single()
      
      if (existing) {
        setUser(existing as User)
      } else {
        // Create new
        const { data: newUser, error: err } = await supabase
          .from('users')
          .insert({ name: name.trim() })
          .select()
          .single()
        
        if (err) throw err
        setUser(newUser as User)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name to start betting"
        className="flex-1 px-4 py-3 bg-bg-card border border-border-subtle rounded-lg
                   text-text-primary placeholder-text-secondary focus:border-accent-green"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={!name.trim() || loading}
        className="px-6 py-3 bg-accent-green text-bg-primary font-heading font-bold rounded-lg
                   hover:bg-accent-green/90 transition disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Enter'}
      </button>
      {error && <p className="text-accent-red text-sm">{error}</p>}
    </form>
  )
}
