"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import Landing from "./layout-routes/landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Admin from "./pages/Admin"
import ProtectedLayout from "./layout-routes/ProtectedLayout"

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

const AdminProtectedRoute = ({ children }) => {
  const { token, isAdmin, user, loading } = useAuth()
  console.log(
    "[v0] AdminProtectedRoute - token:",
    !!token,
    "isAdmin:",
    isAdmin,
    "user role:",
    user?.role,
    "loading:",
    loading,
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 font-mono">AUTHENTICATING...</div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" />
  }

  const hasAdminAccess = isAdmin || user?.role === "admin"
  console.log("[v0] Admin access check:", hasAdminAccess)

  return hasAdminAccess ? children : <Navigate to="/app" />
}

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<ProtectedLayout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminProtectedRoute>
                <Admin />
              </AdminProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
