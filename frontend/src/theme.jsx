import React from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#2ecc71' },
    error: { main: '#e74c3c' },
    background: { default: '#f7f8fa' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          transition: 'all .15s ease',
        },
        containedPrimary: {
          boxShadow: '0 3px 8px rgba(25,118,210,.25)',
          ':hover': { boxShadow: '0 4px 12px rgba(25,118,210,.35)' }
        },
        containedSecondary: {
          boxShadow: '0 3px 8px rgba(46,204,113,.25)'
        }
      }
    },
    MuiPaper: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: {
          borderRadius: 12,
        }
      }
    },
  }
})

export default function AppTheme({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
