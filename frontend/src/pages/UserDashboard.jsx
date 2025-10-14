import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import CategoryPieChart from '../components/CategoryPieChart'
import MonthlyLineChart from '../components/MonthlyLineChart'
import { downloadBlob, toCSV } from '../utils/download'
import { Box, Card, CardContent, Typography, Button, TextField, Select, MenuItem, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, InputAdornment } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import dayjs from 'dayjs'
import { toLocalISO } from '../utils/date'
import { DataGrid } from '@mui/x-data-grid'
import { exportExpensesPDF } from '../utils/pdf'

function ExpenseForm({ categories, onCreated, onCategoryCreated }) {
  const [form, setForm] = useState({ amount: '', expenseDescription: '', paymentMethod: 'CARD', categoryId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newCatOpen, setNewCatOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    if (name === 'categoryId' && value === '__new__') {
      setNewCatOpen(true)
      return
    }
    setForm({ ...form, [name]: value })
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
          <InputLabel id="pm">Payment Method</InputLabel>
          <Select labelId="pm" label="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={onChange}>
            <MenuItem value="CARD">CARD</MenuItem>
            <MenuItem value="CASH">CASH</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
          </Select>
        </FormControl>
        <FormControl required>
          <InputLabel id="cat">Category</InputLabel>
          <Select labelId="cat" label="Category" name="categoryId" value={form.categoryId} onChange={onChange}>
            {categories.length === 0 && <MenuItem value="" disabled>No categories</MenuItem>}
            {categories.map(c => (
              <MenuItem key={c.id || c.Id} value={c.id || c.Id}>{c.name}</MenuItem>
            ))}
            <MenuItem value="__new__">+ Create new…</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
        <Button type="button" onClick={() => setForm({ amount: '', expenseDescription: '', paymentMethod: 'CARD', categoryId: '' })}>Clear</Button>
      </Box>
      {error && <Typography color="error">{String(error)}</Typography>}

      <Dialog open={newCatOpen} onClose={() => setNewCatOpen(false)}>
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField autoFocus fullWidth label="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="Description" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCatOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            const name = newCatName.trim()
            const description = newCatDesc.trim()
            if (!name || !description) return
            try {
              const res = await api.post('/category', { name, description })
              setNewCatOpen(false)
              setNewCatName('')
              setNewCatDesc('')
              const newId = res?.data?.id ?? res?.data?.Id
              if (newId) setForm(f => ({ ...f, categoryId: newId }))
              onCategoryCreated?.()
            } catch (e) {
              // optional: show snackbar in the future
            }
          }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function ExpenseList({ items, onDelete, onEdit, categories }) {
  const rows = (items || []).map((e, idx) => ({
    ...e,
    id: e?.id ?? e?.Id ?? idx
  }))
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
    { field: 'actions', headerName: 'Actions', width: 200, sortable: false, renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(params.row)}>Edit</Button>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(params.row.id)}>Delete</Button>
      </Box>
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

export default function UserDashboard() {
  const [categories, setCategories] = useState([])
  const [expenses, setExpenses] = useState([])
  const [dailyTotal, setDailyTotal] = useState(0)
  const [dailyList, setDailyList] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [topCategoryData, setTopCategoryData] = useState([]) // [{label, value}]
  const [monthlyValues, setMonthlyValues] = useState(new Array(12).fill(0))
  const [year] = useState(new Date().getFullYear())
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1)
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())
  const [categoryFilter, setCategoryFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState(null) // expense obj
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem('dash.expanded') || 'my' } catch { return 'my' }
  }) // which accordion is open

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [cats, exps, daily] = await Promise.all([
        api.get('/category'),
        api.get('/expenses/user'),
        api.get('/expenses/user/DailyexpensesSum')
      ])
      const catsArr = Array.isArray(cats.data) ? cats.data : (cats.data?.content || [])
      const expsArr = Array.isArray(exps.data) ? exps.data : (exps.data?.content || [])
      setCategories(catsArr)
      setExpenses(expsArr)
      setDailyTotal(daily.data || 0)
      // Daily list and recent
      const [dlist, last5] = await Promise.all([
        api.get('/expenses/user/DailyexpensesList').catch(() => ({ data: [] })),
        api.get('/expenses/user/lastFiveExpenses').catch(() => ({ data: [] }))
      ])
      setDailyList(Array.isArray(dlist.data) ? dlist.data : (dlist.data?.content || []))
      setRecent(Array.isArray(last5.data) ? last5.data : (last5.data?.content || []))
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // restore filters
    try {
      const saved = JSON.parse(localStorage.getItem('dash.filters') || '{}')
      if (saved.keyword !== undefined) setKeyword(saved.keyword)
      if (saved.categoryFilter !== undefined) setCategoryFilter(saved.categoryFilter)
      if (saved.monthFilter !== undefined) setMonthFilter(saved.monthFilter)
      if (saved.yearFilter !== undefined) setYearFilter(saved.yearFilter)
    } catch {}
    load()
  }, [])

  useEffect(() => {
    // persist filters
    try {
      localStorage.setItem('dash.filters', JSON.stringify({ keyword, categoryFilter, monthFilter, yearFilter }))
    } catch {}
  }, [keyword, categoryFilter, monthFilter, yearFilter])

  useEffect(() => {
    try { localStorage.setItem('dash.expanded', expanded || '') } catch {}
  }, [expanded])

  useEffect(() => {
    // Load analytics (top categories uses labels if available; monthly trend is independent)
    const loadAnalytics = async () => {
      try {
        // Top categories (limit 5)
        const resTop = await api.get('/expenses/user/limit/5')
        const catMap = new Map((categories || []).map(c => [Number(c.id ?? c.Id), c.name]))
        const top = (resTop.data || []).map(row => {
          const categoryId = Array.isArray(row) ? Number(row[0]) : Number(row.categoryId)
          const total = Array.isArray(row) ? Number(row[1]) : Number(row.total)
          return { label: catMap.get(categoryId) || `Category ${categoryId}`, value: total || 0 }
        })
        setTopCategoryData(top)

        // Monthly totals for Jan..Dec of current year
        const months = Array.from({ length: 12 }, (_, i) => i + 1)
        const promises = months.map(m => api.get(`/expenses/user/month/${m}/year/${year}`)
          .then(r => Number(r.data || 0))
          .catch(() => 0))
        const values = await Promise.all(promises)
        setMonthlyValues(values)
      } catch (e) {
        // ignore analytics errors, keep main dashboard functional
      }
    }

    loadAnalytics()
  }, [categories, year])

  const onDelete = async (id) => {
    if (!confirm('Delete expense #' + id + '?')) return
    try {
      await api.delete(`/expenses/${id}`)
      load()
    } catch (e) {
      alert('Delete failed')
    }
  }

  const onSearch = async (e) => {
    e?.preventDefault?.()
    if (!keyword) return load()
    try {
      const res = await api.get(`/expenses/user/description/${encodeURIComponent(keyword)}`)
      setExpenses(res.data || [])
    } catch {}
  }

  const onFilterCategory = async (val) => {
    setCategoryFilter(val)
    if (!val) return load()
    try {
      const res = await api.get(`/expenses/user/category/${val}`)
      setExpenses(res.data || [])
    } catch {}
  }

  const onFilterMonthYear = async () => {
    try {
      const start = toLocalISO(dayjs(`${yearFilter}-${String(monthFilter).padStart(2,'0')}-01T00:00:00`))
      const end = toLocalISO(dayjs(`${yearFilter}-${String(monthFilter).padStart(2,'0')}-01T00:00:00`).endOf('month'))
      const res = await api.get(`/expenses/user/Monthly/${start}/${end}`)
      setExpenses(res.data || [])
    } catch {}
  }

  const startEdit = (exp) => setEditing({ ...exp })
  const saveEdit = async () => {
    try {
      const { id, amount, expenseDescription, paymentMethod, categoryId } = editing
      await api.put(`/expenses/${id}`, { amount, expenseDescription, paymentMethod, categoryId })
      setEditing(null)
      load()
    } catch (e) {
      alert('Update failed')
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h5">Dashboard</Typography>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Accordion expanded={expanded === 'add'} onChange={(_, e) => setExpanded(e ? 'add' : null)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Add Expense</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card><CardContent>
            <ExpenseForm categories={categories} onCreated={load} onCategoryCreated={load} />
          </CardContent></Card>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'today'} onChange={(_, e) => setExpanded(e ? 'today' : null)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Today's Total</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography>Today's total: <b>{dailyTotal}</b></Typography>
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={async () => {
              // Download all user expenses as CSV using pageable endpoint
              const size = 100
              let page = 0
              const rows = []
              try {
                while (true) {
                  const res = await api.get('/expenses/user/print', { params: { page, size } })
                  const content = res?.data?.content || []
                  for (const e of content) {
                    rows.push({
                      id: e.id,
                      amount: e.amount,
                      expenseDescription: e.expenseDescription,
                      paymentMethod: e.paymentMethod,
                      expenseCreate: e.expenseCreate,
                      expenseUpdate: e.expenseUpdate,
                      categoryId: e.categoryId,
                      userId: e.userId,
                    })
                  }
                  const last = res?.data?.last
                  if (last || content.length < size) break
                  page += 1
                }
                const csv = toCSV(rows)
                const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0,19)
                downloadBlob(csv, `my-expenses-${ts}.csv`, 'text/csv')
              } catch (e) {
                alert('Download failed')
              }
              }}>Download CSV</Button>
              <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportExpensesPDF(expenses, 'My Expenses')}>Download PDF</Button>
            </Box>
          </CardContent></Card>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'my'} onChange={(_, e) => setExpanded(e ? 'my' : null)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">My Expenses</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card><CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box component="form" onSubmit={onSearch} sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" label="Search description" value={keyword} onChange={e => setKeyword(e.target.value)} />
                <Button variant="contained" type="submit">Search</Button>
              </Box>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="cat-filter">Category</InputLabel>
                <Select labelId="cat-filter" label="Category" value={categoryFilter} onChange={e => onFilterCategory(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {categories.map(c => <MenuItem key={c.id||c.Id} value={c.id||c.Id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField type="number" size="small" label="Month" value={monthFilter} onChange={e => setMonthFilter(Number(e.target.value))} sx={{ width: 110 }} />
              <TextField type="number" size="small" label="Year" value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))} sx={{ width: 120 }} />
              <Button variant="outlined" onClick={onFilterMonthYear}>Apply</Button>
            </Box>
            <ExpenseList items={expenses} onDelete={onDelete} onEdit={startEdit} categories={categories} />
          </CardContent></Card>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'top'} onChange={(_, e) => setExpanded(e ? 'top' : null)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Top Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card><CardContent>
            {topCategoryData.length ? <CategoryPieChart data={topCategoryData} /> : <Typography color="text.secondary">No category data</Typography>}
          </CardContent></Card>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'trend'} onChange={(_, e) => setExpanded(e ? 'trend' : null)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Monthly Trend</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card><CardContent>
            <MonthlyLineChart values={monthlyValues} year={year} />
          </CardContent></Card>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'todayList'} onChange={(_, e) => setExpanded(e ? 'todayList' : null)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Today's Expenses</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Today's Expenses</Typography>
              <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportExpensesPDF(dailyList, "Today's Expenses")}>Download PDF</Button>
            </Box>
            <ExpenseList items={dailyList} onDelete={onDelete} onEdit={startEdit} categories={categories} />
          </CardContent></Card>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'recent'} onChange={(_, e) => setExpanded(e ? 'recent' : null)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Recent Expenses</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Recent Expenses</Typography>
              <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportExpensesPDF(recent, 'Recent Expenses')}>Download PDF</Button>
            </Box>
            <ExpenseList items={recent} onDelete={onDelete} onEdit={startEdit} categories={categories} />
          </CardContent></Card>
        </AccordionDetails>
      </Accordion>

      

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card><CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Today's Expenses</Typography>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportExpensesPDF(dailyList, "Today's Expenses")}>Download PDF</Button>
          </Box>
          <ExpenseList items={dailyList} onDelete={onDelete} onEdit={startEdit} categories={categories} />
        </CardContent></Card>
        <Card><CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Recent Expenses</Typography>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportExpensesPDF(recent, 'Recent Expenses')}>Download PDF</Button>
          </Box>
          <ExpenseList items={recent} onDelete={onDelete} onEdit={startEdit} categories={categories} />
        </CardContent></Card>
      </Box>

      <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth>
        <DialogTitle>Edit Expense #{editing?.id}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField label="Amount" type="number" value={editing?.amount || ''} onChange={e => setEditing({ ...editing, amount: Number(e.target.value) })} />
          <TextField label="Description" value={editing?.expenseDescription || ''} onChange={e => setEditing({ ...editing, expenseDescription: e.target.value })} />
          <FormControl>
            <InputLabel id="pm">Payment</InputLabel>
            <Select labelId="pm" label="Payment" value={editing?.paymentMethod || 'CARD'} onChange={e => setEditing({ ...editing, paymentMethod: e.target.value })}>
              <MenuItem value="CARD">CARD</MenuItem>
              <MenuItem value="CASH">CASH</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="ecat">Category</InputLabel>
            <Select labelId="ecat" label="Category" value={editing?.categoryId || ''} onChange={e => setEditing({ ...editing, categoryId: Number(e.target.value) })}>
              {categories.map(c => <MenuItem key={c.id||c.Id} value={c.id||c.Id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
