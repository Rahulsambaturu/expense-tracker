import React, { useState } from 'react'
import { TextField, Button, Box, Typography, Card, CardContent } from '@mui/material'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    // UI-only placeholder. Backend flow not implemented as requested.
    setSubmitted(true)
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Forgot Password</Typography>
          {submitted ? (
            <Typography color="success.main">
              If this email exists, you'll receive instructions to reset your password.
            </Typography>
          ) : (
            <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" variant="contained">Send Reset Link</Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
