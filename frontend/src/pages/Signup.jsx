import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, Card, CardContent, Typography, TextField, Button } from '@mui/material'

export default function Signup() {
  const { signup, login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', mobile_number: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      await login(form.email, form.password)
      nav('/dashboard')
    } catch (err) {
      setError(err?.response?.data || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Sign Up</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField name="name" label="Name" value={form.name} onChange={onChange} required fullWidth />
            <TextField name="email" type="email" label="Email" value={form.email} onChange={onChange} required fullWidth />
            <TextField name="mobile_number" label="Mobile Number" value={form.mobile_number} onChange={onChange} required fullWidth />
            <TextField name="password" type="password" label="Password" value={form.password} onChange={onChange} required fullWidth />
            <Button disabled={loading} type="submit" variant="contained" size="large">{loading ? 'Signing up…' : 'Sign Up'}</Button>
            {error && <Typography color="error">{String(error)}</Typography>}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Have an account? <Link to="/login">Login</Link></Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
