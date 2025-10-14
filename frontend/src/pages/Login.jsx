import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, Card, CardContent, Typography, TextField, Button } from '@mui/material'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      nav('/dashboard')
    } catch (err) {
      setError(err?.response?.data || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Login</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField name="email" type="email" label="Email" value={form.email} onChange={onChange} required fullWidth />
            <TextField name="password" type="password" label="Password" value={form.password} onChange={onChange} required fullWidth />
            <Button disabled={loading} type="submit" variant="contained" size="large">{loading ? 'Logging in…' : 'Login'}</Button>
            {error && <Typography color="error">{String(error)}</Typography>}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">No account? <Link to="/signup">Sign up</Link></Typography>
            <Typography variant="body2" sx={{ mt: 1 }}><Link to="/forgot">Forgot password?</Link></Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
