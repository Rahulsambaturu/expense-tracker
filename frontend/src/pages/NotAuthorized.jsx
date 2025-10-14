import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotAuthorized() {
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h4" gutterBottom>Not Authorized</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        You do not have permission to access this page.
      </Typography>
      <Button variant="contained" component={RouterLink} to="/dashboard">Go to Dashboard</Button>
    </Box>
  )
}
