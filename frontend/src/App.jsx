import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import Expenses from './pages/Expenses'
import ForgotPassword from './pages/ForgotPassword'
import Logout from './pages/Logout'
import NotAuthorized from './pages/NotAuthorized'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import { SnackbarProvider } from './context/SnackbarContext'

export default function App() {
  // Optional: force logout on start (useful for demos or when you want to always start at login)
  if (import.meta?.env?.VITE_FORCE_LOGOUT_ON_START === 'true') {
    try { localStorage.removeItem('token') } catch {}
    try { sessionStorage.removeItem('token') } catch {}
  }
  return (
    <SnackbarProvider>
      <Layout>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
        <Route path="/forgot" element={<ForgotPassword />} />
        </Routes>
      </Layout>
    </SnackbarProvider>
  )
}
