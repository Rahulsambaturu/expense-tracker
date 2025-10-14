import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Logout() {
  const navigate = useNavigate()
  useEffect(() => {
    try { localStorage.removeItem('token') } catch {}
    try { sessionStorage.removeItem('token') } catch {}
    navigate('/login', { replace: true })
  }, [navigate])
  return null
}
