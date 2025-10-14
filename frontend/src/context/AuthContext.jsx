import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(null) // { name, email, mobile_number, accountCreateDate }
  const [isAdmin, setIsAdmin] = useState(false)
  const isAuthenticated = !!token

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      api.setToken(token)
      // Load current user
      api.get('/users/me')
        .then(res => setUser(res.data))
        .catch(() => setUser(null))
      // Probe admin capability by attempting an admin-only endpoint
      api.get('/users/admin')
        .then(() => setIsAdmin(true))
        .catch(() => setIsAdmin(false))
    } else {
      localStorage.removeItem('token')
      api.setToken('')
      setUser(null)
      setIsAdmin(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/users/Login', { email, password })
    // Backend returns jwt string
    const jwt = typeof res.data === 'string' ? res.data : res.data?.token
    setToken(jwt)
    return jwt
  }

  const signup = async (payload) => {
    // { name, email, mobile_number, password }
    const res = await api.post('/users/Signup', payload)
    return res.data
  }

  const logout = () => {
    setToken('')
  }

  const value = useMemo(() => ({
    token,
    isAuthenticated,
    user,
    isAdmin,
    login,
    signup,
    logout
  }), [token, isAuthenticated, user, isAdmin])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
