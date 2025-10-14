import React, { useEffect, useMemo, useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Divider,
  Button,
  Tabs,
  Tab
} from '@mui/material'
import api from '../api/client'
import MonthlyLineChart from '../components/MonthlyLineChart'
import CategoryPieChart from '../components/CategoryPieChart'
import dayjs from 'dayjs'
import { toLocalISO } from '../utils/date'

export default function Analytics() {
  const [tab, setTab] = useState(0)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [monthlyValues, setMonthlyValues] = useState(new Array(12).fill(0))
  const [categoryMonthly, setCategoryMonthly] = useState(new Array(12).fill(0))
  const [kpi, setKpi] = useState({ dailyAvg: 0, monthlyAvg: 0, yearly: 0 })
  const [lastFive, setLastFive] = useState([])
  const [loading, setLoading] = useState(false)
  const [topAllTime, setTopAllTime] = useState([]) // [{label,value}]
  const [topThisMonth, setTopThisMonth] = useState([])
  const [categoryYearTotal, setCategoryYearTotal] = useState(null)

  const loadBase = async () => {
    setLoading(true)
    try {
      const [cats, dailyAvg, monthlyAvg, yearly, last5] = await Promise.all([
        api.get('/category'),
        api.get('/expenses/user/dailyAvg'),
        api.get('/expenses/user/monthlyAvg'),
        api.get(`/expenses/user/year/${year}`),
        api.get('/expenses/user/lastFiveExpenses')
      ])
      setCategories(cats.data || [])
      setKpi({ dailyAvg: Number(dailyAvg.data || 0), monthlyAvg: Number(monthlyAvg.data || 0), yearly: Number(yearly.data || 0) })
      setLastFive(last5.data || [])

      // Overall monthly totals for the year
      const months = Array.from({ length: 12 }, (_, i) => i + 1)
      const overall = await Promise.all(months.map(m => api.get(`/expenses/user/month/${m}/year/${year}`).then(r => Number(r.data || 0)).catch(() => 0)))
      setMonthlyValues(overall)

      // All-Time Top 5 categories
      const top5 = await api.get('/expenses/user/limit/5').then(r => r.data || []).catch(() => [])
      const catMap = new Map((cats.data || []).map(c => [Number(c.id ?? c.Id), c.name]))
      setTopAllTime(top5.map(row => {
        const categoryId = Array.isArray(row) ? Number(row[0]) : Number(row.categoryId)
        const total = Array.isArray(row) ? Number(row[1]) : Number(row.total)
        return { label: catMap.get(categoryId) || `Category ${categoryId}`, value: total || 0 }
      }))

      // Top 3 This Month (client aggregation from list within current month)
      const start = toLocalISO(dayjs(`${year}-${String(new Date().getMonth()+1).padStart(2,'0')}-01T00:00:00`))
      const end = toLocalISO(dayjs(`${year}-${String(new Date().getMonth()+1).padStart(2,'0')}-01T00:00:00`).endOf('month'))
      const monthList = await api.get(`/expenses/user/Monthly/${start}/${end}`).then(r => r.data || []).catch(() => [])
      const agg = new Map()
      for (const e of monthList) {
        const key = Number(e.categoryId)
        agg.set(key, (agg.get(key) || 0) + Number(e.amount || 0))
      }
      const sorted = Array.from(agg.entries()).sort((a,b) => b[1]-a[1]).slice(0,3)
      setTopThisMonth(sorted.map(([cid, total]) => ({ label: catMap.get(cid) || `Category ${cid}` , value: total })))
    } finally {
      setLoading(false)
    }
  }

  const loadCategoryMonthly = async (catId) => {
    if (!catId) { setCategoryMonthly(new Array(12).fill(0)); return }
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    try {
      const vals = await Promise.all(months.map(async (m) => {
        try {
          const res = await api.get(`/expenses/user/category/${catId}/month/${m}/year/${year}`)
          const data = res.data
          if (Array.isArray(data)) {
            return data.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)
          }
          return Number(data || 0)
        } catch {
          return 0
        }
      }))
      setCategoryMonthly(vals)
    } catch {
      setCategoryMonthly(new Array(12).fill(0))
    }
  }

  useEffect(() => {
    loadBase()
  }, [year])

  useEffect(() => {
    loadCategoryMonthly(selectedCategory)
    // Also load category yearly total for Insights card
    const fetchYearTotal = async () => {
      if (!selectedCategory) { setCategoryYearTotal(null); return }
      try {
        const res = await api.get(`/expenses/user/category/${selectedCategory}/year/${year}`)
        // Endpoint returns a list; sum client-side if needed
        const data = res.data
        const total = Array.isArray(data) ? data.reduce((a, e) => a + (Number(e.amount)||0), 0) : Number(data || 0)
        setCategoryYearTotal(total)
      } catch {
        setCategoryYearTotal(null)
      }
    }
    fetchYearTotal()
  }, [selectedCategory, year])

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Analytics</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Insights" />
      </Tabs>

      {tab === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="overline">Daily Average</Typography>
                  <Typography variant="h5">{kpi.dailyAvg.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="overline">Monthly Average</Typography>
                  <Typography variant="h5">{kpi.monthlyAvg.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="overline">Year Total ({year})</Typography>
                  <Typography variant="h5">{kpi.yearly.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Overall Monthly Trend</Typography>
                    <TextField
                      label="Year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                  <MonthlyLineChart values={monthlyValues} year={year} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Category Monthly Trend</Typography>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel id="cat-label">Category</InputLabel>
                      <Select
                        labelId="cat-label"
                        label="Category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <MenuItem value="">None</MenuItem>
                        {categories.map(c => (
                          <MenuItem key={c.id || c.Id} value={c.id || c.Id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <MonthlyLineChart values={categoryMonthly} year={year} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Last Five Expenses</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                {lastFive.map(e => (
                  <Grid item xs={12} md={6} key={e.id}>
                    <Box sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography variant="subtitle2">#{e.id} • {e.expenseCreate?.replace('T', ' ').slice(0, 19)}</Typography>
                      <Typography variant="body2">{e.expenseDescription}</Typography>
                      <Typography variant="body2">Amount: <b>{e.amount}</b> — Payment: {e.paymentMethod}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Top 3 This Month</Typography>
              {topThisMonth.length ? <CategoryPieChart data={topThisMonth} /> : <Typography color="text.secondary">No data</Typography>}
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>All-Time Top 5</Typography>
              {topAllTime.length ? <CategoryPieChart data={topAllTime} /> : <Typography color="text.secondary">No data</Typography>}
            </CardContent></Card>
          </Grid>
          <Grid item xs={12}>
            <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>Category Year Total</Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="insights-cat">Category</InputLabel>
                  <Select
                    labelId="insights-cat"
                    label="Category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    {categories.map(c => (
                      <MenuItem key={c.id || c.Id} value={c.id || c.Id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  size="small"
                  sx={{ width: 120 }}
                />
              </Box>
              {selectedCategory ? (
                <Typography>Year Total: <b>{(categoryYearTotal ?? 0).toFixed(2)}</b></Typography>
              ) : (
                <Typography color="text.secondary">Select a category to see the yearly total.</Typography>
              )}
            </CardContent></Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
