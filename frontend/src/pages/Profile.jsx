import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { Box, Card, CardContent, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material'

export default function Profile() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', mobile_number: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', mobile_number: user.mobile_number || '', password: '' })
    }
  }, [user])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const refresh = async () => {
    setLoading(true)
    try {
      const me = await api.get('/users/me')
      setForm({ name: me.data.name || '', email: me.data.email || '', mobile_number: me.data.mobile_number || '', password: '' })
    } finally {
      setLoading(false)
    }
  }

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/users/update', form)
      setSnack({ open: true, msg: 'Profile updated', severity: 'success' })
      refresh()
    } catch (e) {
      setSnack({ open: true, msg: 'Update failed', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const onConfirmDelete = async () => {
    try {
      await api.delete('/users/me')
      setSnack({ open: true, msg: 'Account deleted', severity: 'success' })
      setConfirmOpen(false)
      logout()
    } catch (e) {
      setSnack({ open: true, msg: 'Delete failed', severity: 'error' })
    }
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>My Profile</Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box component="form" onSubmit={onSave} sx={{ display: 'grid', gap: 2 }}>
              <TextField name="name" label="Name" value={form.name} onChange={onChange} fullWidth />
              <TextField name="email" type="email" label="Email" value={form.email} onChange={onChange} fullWidth />
              <TextField name="mobile_number" label="Mobile Number" value={form.mobile_number} onChange={onChange} fullWidth />
              <TextField name="password" type="password" label="New Password (optional)" value={form.password} onChange={onChange} fullWidth />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button color="error" variant="outlined" onClick={() => setConfirmOpen(true)}>Delete My Account</Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography>This will delete your account and all expenses. Continue?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={onConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({...s, open:false}))}>
        <Alert onClose={() => setSnack(s => ({...s, open:false}))} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
