import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { Box, Tabs, Tab, Card, CardContent, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { DataGrid } from '@mui/x-data-grid'
import { exportUsersPDF, exportExpensesPDF } from '../utils/pdf'

function StatCard({ title, value }) {
  return (
    <Card><CardContent>
      <Typography variant="overline">{title}</Typography>
      <Typography variant="h5">{value}</Typography>
    </CardContent></Card>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState(0)
  const [users, setUsers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null) // { id, email }
  const [pagination, setPagination] = useState({ users: 0, expenses: 0, pageSize: 5 })

  const [viewUser, setViewUser] = useState(null)
  const [viewExpense, setViewExpense] = useState(null)
  const [catForm, setCatForm] = useState({ id: '', name: '', description: '' })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [uRes, eRes, cRes] = await Promise.all([
        api.get('/users/admin'),
        api.get('/expenses/admin'),
        api.get('/category')
      ])
      const usersArr = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.content || [])
      const expensesArr = Array.isArray(eRes.data) ? eRes.data : (eRes.data?.content || [])
      const categoriesArr = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.content || [])
      setUsers(usersArr)
      setExpenses(expensesArr)
      setCategories(categoriesArr)
    } catch (err) {
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Stats (computed client-side from lists)
  const totalUsers = users.length
  const totalExpenses = expenses.length
  const totalAmount = useMemo(() => expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0), [expenses])

  // Users actions
  const onDeleteUser = (row) => {
    // Prefer a dedicated numeric uid if present
    let id = Number(row?.uid)
    if (!Number.isFinite(id)) id = Number(row?.id)
    if (!Number.isFinite(id)) id = Number(row?.raw?.id ?? row?.raw?.Id)
    if (!Number.isFinite(id)) {
      const input = prompt('Backend did not return user id. Enter numeric user id to delete:')
      if (!input) return
      const parsed = Number(input)
      if (!Number.isFinite(parsed)) return alert('Invalid id')
      id = parsed
    }
    setConfirmDeleteUser({ id, email: row?.email })
  }

  const confirmDeleteUserNow = async () => {
    if (!confirmDeleteUser) return
    try {
      await api.delete(`/users/admin/${confirmDeleteUser.id}`)
      setSnack({ open: true, msg: 'User deleted', severity: 'success' })
      setConfirmDeleteUser(null)
      load()
    } catch {
      setSnack({ open: true, msg: 'Delete failed', severity: 'error' })
    }
  }

  const onViewUser = async (row) => {
    let id = Number(row?.id)
    if (!Number.isFinite(id)) id = Number(row?.raw?.id ?? row?.raw?.Id)
    if (!Number.isFinite(id)) {
      const input = prompt('Backend did not return user id. Enter numeric user id to view:')
      const parsed = Number(input)
      if (!Number.isFinite(parsed)) { alert('Valid numeric id required'); return }
      id = parsed
    }
    try {
      const res = await api.get(`/users/admin/${id}`)
      setViewUser(res.data)
    } catch { setViewUser(null) }
  }

  // Expenses actions
  const onViewExpense = async (row) => {
    try {
      const res = await api.get(`/expenses/admin/${row.id}`)
      setViewExpense(res.data)
    } catch { setViewExpense(null) }
  }
  const onDeleteExpense = async (row) => {
    if (!confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${row.id}`)
      setSnack({ open: true, msg: 'Expense deleted', severity: 'success' })
      load()
    } catch {
      setSnack({ open: true, msg: 'Delete failed', severity: 'error' })
    }
  }

  // Categories CRUD
  const saveCategory = async () => {
    try {
      if (catForm.id) {
        await api.put(`/category/${catForm.id}`, { name: catForm.name, description: catForm.description })
        setSnack({ open: true, msg: 'Category updated', severity: 'success' })
        await load()
        // Keep selection after update
        setCatForm(cf => ({ id: cf.id, name: cf.name, description: cf.description }))
      } else {
        const res = await api.post('/category', { name: catForm.name, description: catForm.description })
        const newId = res?.data?.id ?? res?.data?.Id
        const newName = res?.data?.name ?? catForm.name
        const newDesc = res?.data?.description ?? catForm.description
        setSnack({ open: true, msg: 'Category created', severity: 'success' })
        await load()
        if (newId != null) {
          setCatForm({ id: newId, name: newName, description: newDesc })
        } else {
          setCatForm({ id: '', name: '', description: '' })
        }
      }
    } catch {
      setSnack({ open: true, msg: 'Save failed', severity: 'error' })
    }
  }

  const paged = (arr, page, size) => arr.slice(page * size, page * size + size)

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h5">Admin Dashboard</Typography>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Stats" />
        <Tab label="Users" />
        <Tab label="Expenses" />
        <Tab label="Categories" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><StatCard title="Total Users" value={totalUsers} /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Total Expenses" value={totalExpenses} /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Total Amount" value={totalAmount.toFixed(2)} /></Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card><CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Users</Typography>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportUsersPDF(users, 'Admin Users')}>Download PDF</Button>
          </Box>
          <div style={{ width: '100%' }}>
            <DataGrid
              autoHeight
              rows={(users || []).map((u, idx) => ({
                id: u.id ?? u.Id ?? u.email ?? idx,
                uid: (Number(u.id) || Number(u.Id)) || null,
                name: u.name,
                email: u.email,
                mobile_number: u.mobile_number,
                accountCreateDate: u.accountCreateDate,
                raw: u
              }))}
              columns={[
                { field: 'name', headerName: 'Name', flex: 1 },
                { field: 'email', headerName: 'Email', flex: 1 },
                { field: 'mobile_number', headerName: 'Mobile', width: 140 },
                { field: 'accountCreateDate', headerName: 'Created', flex: 1, valueGetter: (p) => (p.value||'').replace('T',' ').slice(0,19) },
                { field: 'actions', headerName: 'Actions', width: 180, sortable: false, renderCell: (params) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={() => onViewUser(params.row)}>View</Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDeleteUser(params.row)}>Delete</Button>
                  </Box>
                ) }
              ]}
              pageSizeOptions={[5,10,20]}
              initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
            />
          </div>
        </CardContent></Card>
      )}

      {tab === 2 && (
        <Card><CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Expenses</Typography>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportExpensesPDF(expenses, 'All Expenses')}>Download PDF</Button>
          </Box>
          <div style={{ width: '100%' }}>
            <DataGrid
              autoHeight
              rows={(expenses || []).map((e) => ({ ...e, id: e.id }))}
              columns={[
                { field: 'id', headerName: 'ID', width: 80 },
                { field: 'expenseDescription', headerName: 'Description', flex: 1 },
                { field: 'amount', headerName: 'Amount', width: 120 },
                { field: 'paymentMethod', headerName: 'Payment', width: 120 },
                { field: 'categoryId', headerName: 'Category', width: 160, valueGetter: (p) => {
                  const cid = Number(p.value)
                  const map = new Map((categories || []).map(c => [Number(c.id ?? c.Id), c.name]))
                  return map.get(cid) || p.value
                } },
                { field: 'expenseCreate', headerName: 'Created', flex: 1, valueGetter: (p) => (p.value||'').replace('T',' ').slice(0,19) },
                { field: 'actions', headerName: 'Actions', width: 200, sortable: false, renderCell: (params) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={() => onViewExpense(params.row)}>View</Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDeleteExpense(params.row)}>Delete</Button>
                  </Box>
                ) }
              ]}
              pageSizeOptions={[5,10,20]}
              initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
            />
          </div>
        </CardContent></Card>
      )}

      {tab === 3 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card><CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{catForm.id ? 'Edit Category' : 'Create Category'}</Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <FormControl>
                  <InputLabel id="cat-select">Select existing</InputLabel>
                  <Select labelId="cat-select" label="Select existing" value={catForm.id} onChange={e => setCatForm(cf => {
                    const selected = categories.find(c => Number(c.id||c.Id)===Number(e.target.value)) || {}
                    return { ...cf, id: Number(e.target.value), name: selected.name || '', description: selected.description || '' }
                  })}>
                    <MenuItem value="">None</MenuItem>
                    {categories.map(c => <MenuItem key={c.id||c.Id} value={c.id||c.Id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Name" value={catForm.name} onChange={e => setCatForm(cf => ({ ...cf, name: e.target.value }))} />
                <TextField label="Description" value={catForm.description} onChange={e => setCatForm(cf => ({ ...cf, description: e.target.value }))} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={saveCategory}>{catForm.id ? 'Update' : 'Create'}</Button>
                  <Button onClick={() => setCatForm({ id: '', name: '', description: '' })}>Reset</Button>
                </Box>
              </Box>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card><CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Categories</Typography>
                <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => {
                  const rows = categories.map(c => ({ id: c.id||c.Id, amount: '', expenseDescription: c.name, paymentMethod: '', categoryId: c.id||c.Id, expenseCreate: '' }))
                  exportExpensesPDF(rows, 'Categories')
                }}>Download PDF</Button>
              </Box>
              <div style={{ width: '100%' }}>
                <DataGrid
                  autoHeight
                  rows={(categories||[]).map(c => ({ id: c.id||c.Id, name: c.name }))}
                  columns={[
                    { field: 'id', headerName: 'ID', width: 100 },
                    { field: 'name', headerName: 'Name', flex: 1 },
                    { field: 'actions', headerName: 'Actions', width: 140, sortable: false, renderCell: (params) => (
                      <Button size="small" onClick={() => setCatForm({ id: params.row.id, name: params.row.name, description: (categories.find(c => (c.id||c.Id)===params.row.id)?.description) || '' })}>Edit</Button>
                    )}
                  ]}
                  pageSizeOptions={[5,10,20]}
                  initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
                />
              </div>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 1.5, pt: 1 }}>
          {viewUser ? (
            <>
              <Typography>Name: {viewUser.name}</Typography>
              <Typography>Email: {viewUser.email}</Typography>
              <Typography>Mobile: {viewUser.mobile_number}</Typography>
              <Typography>Created: {viewUser.accountCreateDate?.replace('T',' ').slice(0,19)}</Typography>
            </>
          ) : <Typography>Unable to load user</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDeleteUser} onClose={() => setConfirmDeleteUser(null)}>
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete user #{confirmDeleteUser?.id}{confirmDeleteUser?.email ? ` (${confirmDeleteUser.email})` : ''}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteUser(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteUserNow}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewExpense} onClose={() => setViewExpense(null)} fullWidth>
        <DialogTitle>Expense Details</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 1.5, pt: 1 }}>
          {viewExpense ? (
            <>
              <Typography>ID: {viewExpense.id}</Typography>
              <Typography>Amount: {viewExpense.amount}</Typography>
              <Typography>Description: {viewExpense.expenseDescription}</Typography>
              <Typography>Payment: {viewExpense.paymentMethod}</Typography>
              <Typography>UserId: {viewExpense.userId}</Typography>
              <Typography>CategoryId: {viewExpense.categoryId}</Typography>
              <Typography>Created: {viewExpense.expenseCreate?.replace('T',' ').slice(0,19)}</Typography>
            </>
          ) : <Typography>Unable to load expense</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewExpense(null)}>Close</Button>
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
