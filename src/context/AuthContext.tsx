// import { createContext, useContext, useEffect, useState } from 'react'
// import type { ReactNode } from 'react'
// import type { User } from '@supabase/supabase-js'
// import { supabase } from '../lib/supabase'
// import type { UserRole } from '../types'

// interface AuthContextType {
//   user: User | null
//   role: UserRole
//   loading: boolean
//   signIn: (email: string, password: string) => Promise<void>
//   signOut: () => Promise<void>
// }

// const AuthContext = createContext<AuthContextType | null>(null)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [role, setRole] = useState<UserRole>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null)
//       setRole(session?.user?.user_metadata?.role ?? null)
//       setLoading(false)
//     })

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null)
//       setRole(session?.user?.user_metadata?.role ?? null)
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   async function signIn(email: string, password: string) {
//     const { error } = await supabase.auth.signInWithPassword({ email, password })
//     if (error) throw error
//   }

//   async function signOut() {
//     await supabase.auth.signOut()
//   }

//   return (
//     <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider')
//   return ctx
// }

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { UserRole } from '../types'

// Hardcoded admin credentials — no database needed
const ADMINS: Record<string, string> = {
  'jenyshrestha31@gmail.com': 'Jen123a',
  'martinrice841@gmail.com': 'dallidalli',
}

interface AuthUser {
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  role: UserRole
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = 'footy_admin_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) {
      try {
        const { email } = JSON.parse(saved)
        if (email && ADMINS[email.toLowerCase()] !== undefined) {
          setUser({ email })
          setRole('admin')
        }
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setLoading(false)
  }, [])

  async function signIn(email: string, password: string) {
    const normalised = email.toLowerCase().trim()
    const expected = ADMINS[normalised]
    if (expected === undefined || expected !== password) {
      throw new Error('Invalid email or password')
    }
    const authUser = { email: normalised }
    setUser(authUser)
    setRole('admin')
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser))
  }

  async function signOut() {
    setUser(null)
    setRole(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}