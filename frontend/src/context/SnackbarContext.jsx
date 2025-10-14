import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

const SnackbarCtx = createContext({ show: (msg, severity = 'info') => {} })

export function SnackbarProvider({ children }) {
  const [state, setState] = useState({ open: false, msg: '', severity: 'info' })

  const show = useCallback((msg, severity = 'info') => {
    setState({ open: true, msg, severity })
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <SnackbarCtx.Provider value={value}>
      {children}
      <Snackbar open={state.open} autoHideDuration={2500} onClose={() => setState(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setState(s => ({ ...s, open: false }))} severity={state.severity} variant="filled" sx={{ width: '100%' }}>
          {state.msg}
        </Alert>
      </Snackbar>
    </SnackbarCtx.Provider>
  )
}

export function useSnackbar() {
  return useContext(SnackbarCtx)
}
