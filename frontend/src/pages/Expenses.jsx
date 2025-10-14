import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { toLocalISO } from '../utils/date'
import { exportExpensesPDF } from '../utils/pdf'
import CategoryPieChart from '../components/CategoryPieChart'
import MonthlyLineChart from '../components/MonthlyLineChart'
import { downloadBlob, toCSV } from '../utils/download'

function ExpenseForm({ categories, onCreated, onCategoryCreated }) {
  const [form, setForm] = useState({ amount: '', expenseDescription: '', paymentMethod: 'CARD', categoryId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newCatOpen, setNewCatOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onCategoryChange = (e) => {
    const value = e.target.value
    if (value === '__new__') {
      // Open dialog and do not change current selection
      setNewCatOpen(true)
      return
    }
    setForm({ ...form, categoryId: value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, amount: Number(form.amount), categoryId: Number(form.categoryId) }
      await api.post('/expenses', payload)
      setForm({ amount: '', expenseDescription: '', paymentMethod: 'CARD', categoryId: '' })
      onCreated?.()
    } catch (err) {
      setError(err?.response?.data || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h6">Add Expense</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' }, gap: 2 }}>
        <TextField
          name="amount"
          type="number"
          inputProps={{ step: '0.01', min: '0' }}
          label="Amount"
          value={form.amount}
          onChange={onChange}
          required
          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
        />
        <TextField
          name="expenseDescription"
          label="Description"
          value={form.expenseDescription}
          onChange={onChange}
          required
          placeholder="What did you spend on?"
        />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <FormControl>
          <InputLabel id="pay-label">Payment Method</InputLabel>
          <Select labelId="pay-label" name="paymentMethod" label="Payment Method" value={form.paymentMethod} onChange={onChange}>
            <MenuItem value="CARD">CARD</MenuItem>
            <MenuItem value="CASH">CASH</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
          </Select>
        </FormControl>
        <FormControl required>
          <InputLabel id="cat-label">Category</InputLabel>
          <Select labelId="cat-label" name="categoryId" label="Category" value={form.categoryId} onChange={onCategoryChange}>
            {categories.length === 0 && <MenuItem value="" disabled>No categories</MenuItem>}
            {categories.map(c => (
              <MenuItem value={c.id || c.Id} key={c.id || c.Id}>{c.name}</MenuItem>
            ))}
            <MenuItem value="__new__">+ Create new…</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
      </Box>
      {error && <Typography color="error">{String(error)}</Typography>}
      <Dialog open={newCatOpen} onClose={() => setNewCatOpen(false)}>
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField autoFocus fullWidth label="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Description" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCatOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            const name = newCatName.trim()
            const description = newCatDesc.trim()
            if (!name || !description) return
            try {
              await api.post('/category', { name, description })
              setNewCatOpen(false)
              setNewCatName('')
              setNewCatDesc('')
              onCategoryCreated?.()
              // Also try to pre-select the newly created category locally
              try {
                const cats = await api.get('/category').then(r => r.data || [])
                const created = (cats || []).find(c => (c.name || '').toLowerCase() === name.toLowerCase())
                if (created) {
                  setForm(f => ({ ...f, categoryId: created.id || created.Id }))
                }
              } catch {}
            } catch {}
          }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function ExpenseList({ items, onDelete, categories }) {
  const rows = (items || []).map(e => ({ ...e, id: e.id }))
  const catMap = new Map((categories || []).map(c => [Number(c.id ?? c.Id), c.name]))
  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'expenseDescription', headerName: 'Description', flex: 1 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    { field: 'paymentMethod', headerName: 'Payment', width: 120 },
    { field: 'categoryId', headerName: 'Category', width: 160, valueGetter: (p) => {
      const cid = Number(p.value)
      return catMap.get(cid) || p.value
    } },
    { field: 'expenseCreate', headerName: 'Created', flex: 1, valueGetter: (p) => (p.value||'').toString().replace('T',' ').slice(0,19) },
    { field: 'actions', headerName: 'Actions', width: 160, sortable: false, renderCell: (params) => (
      <Button size="small" color="error" onClick={() => onDelete(params.row.id)}>Delete</Button>
    )}
  ]
  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        pageSizeOptions={[5,10,20]}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
      />
    </div>
  )
}

export default function Expenses() {
  const [categories, setCategories] = useState([])
  const [expenses, setExpenses] = useState([])
  const [sum, setSum] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [start, setStart] = useState(dayjs().startOf('month'))
  const [end, setEnd] = useState(dayjs().endOf('month'))
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const [year] = useState(new Date().getFullYear())
  const [topCategoryData, setTopCategoryData] = useState([])
  const [monthlyValues, setMonthlyValues] = useState(new Array(12).fill(0))

  const loadBase = async () => {
    setLoading(true)
    setError('')
    try {
      const [cats, exps] = await Promise.all([
        api.get('/category'),
        api.get('/expenses/user')
      ])
      setCategories(cats.data)
      setExpenses(exps.data || [])
      // charts
      try {
        const top = await api.get('/expenses/user/limit/5').then(r => r.data || [])
        const catMap = new Map((cats.data || []).map(c => [Number(c.id ?? c.Id), c.name]))
        setTopCategoryData(top.map(row => {
          const cid = Array.isArray(row) ? Number(row[0]) : Number(row.categoryId)
          const total = Array.isArray(row) ? Number(row[1]) : Number(row.total)
          return { label: catMap.get(cid) || `Category ${cid}`, value: total || 0 }
        }))
        const months = Array.from({ length: 12 }, (_, i) => i + 1)
        const overall = await Promise.all(months.map(m => api.get(`/expenses/user/month/${m}/year/${year}`).then(r => Number(r.data || 0)).catch(() => 0)))
        setMonthlyValues(overall)
      } catch {}
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadRange = async () => {
    try {
      const s = toLocalISO(start)
      const e = toLocalISO(end)
      const [list, total] = await Promise.all([
        api.get(`/expenses/user/Monthly/${s}/${e}`),
        api.get(`/expenses/user/MonthlySum/${s}/${e}`)
      ])
      setExpenses(list.data || [])
      setSum(Number(total.data || 0))
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => { loadBase() }, [])

  const onDelete = async (id) => {
    if (!confirm('Delete expense #' + id + '?')) return
    try {
      await api.delete(`/expenses/${id}`)
      setSnack({ open: true, msg: 'Expense deleted', severity: 'success' })
      loadBase()
    } catch (e) {
      setSnack({ open: true, msg: 'Delete failed', severity: 'error' })
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5">Expenses</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <ExpenseForm categories={categories} onCreated={loadBase} onCategoryCreated={loadBase} />
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card><CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <DateTimePicker label="Start" value={start} onChange={v => setStart(v)} slotProps={{ textField: { size: 'small' } }} />
                <DateTimePicker label="End" value={end} onChange={v => setEnd(v)} slotProps={{ textField: { size: 'small' } }} />
                <Button variant="contained" onClick={loadRange}>Apply</Button>
                <Typography sx={{ ml: 'auto' }}>Range total: <b>{sum}</b></Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, justifyContent: 'flex-end' }}>
                <Button size="small" variant="outlined" onClick={() => exportExpensesPDF(expenses, 'My Expenses (Range)')}>Download PDF</Button>
                <Button size="small" variant="outlined" onClick={async () => {
                  try {
                    let page = 0; const size = 100; let rows = []; let last = false
                    while (!last && page < 100) {
                      const res = await api.get(`/expenses/user/print?page=${page}&size=${size}`)
                      const content = res?.data?.content || []
                      rows = rows.concat(content)
                      last = res?.data?.last
                      if (last || content.length < size) break
                      page += 1
                    }
                    const csv = toCSV(rows)
                    const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0,19)
                    downloadBlob(csv, `my-expenses-${ts}.csv`, 'text/csv')
                  } catch (e) {
                    setSnack({ open: true, msg: 'CSV download failed', severity: 'error' })
                  }
                }}>Download CSV</Button>
              </Box>
              <ExpenseList items={expenses} onDelete={onDelete} categories={categories} />
            </CardContent></Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Top Categories</Typography>
              {topCategoryData.length ? <CategoryPieChart data={topCategoryData} /> : <Typography color="text.secondary">No category data</Typography>}
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Monthly Trend ({year})</Typography>
              <MonthlyLineChart values={monthlyValues} year={year} />
            </CardContent></Card>
          </Grid>
        </Grid>
      </Box>
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({...s, open:false}))}>
        <Alert onClose={() => setSnack(s => ({...s, open:false}))} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  )
}
