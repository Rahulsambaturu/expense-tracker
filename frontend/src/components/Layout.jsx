import React from 'react'
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const { user } = useAuth()
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Expense Tracker</Typography>
          {isAuthenticated && (
            <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
          )}
          {isAuthenticated && (
            <Button color="inherit" component={RouterLink} to="/expenses">Expenses</Button>
          )}
          {isAuthenticated && (
            <Button color="inherit" component={RouterLink} to="/profile">Profile</Button>
          )}
          {isAuthenticated && isAdmin && (
            <Button color="inherit" component={RouterLink} to="/admin">Admin</Button>
          )}
          {!isAuthenticated && (
            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
          )}
          {!isAuthenticated && (
            <Button color="inherit" component={RouterLink} to="/signup">Signup</Button>
          )}
          {isAuthenticated && (
            <Typography variant="body2" sx={{ mx: 2, opacity: 0.85 }}>{user?.email}</Typography>
          )}
          {isAuthenticated && (
            <Button color="inherit" onClick={logout}>Logout</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
