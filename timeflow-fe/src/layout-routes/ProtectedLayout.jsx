"use client"
import { Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Settings, LogOut, Zap, Shield } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const ProtectedLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 animate-grid-move"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>

        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Scanning lines */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-horizontal opacity-30"></div>
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-scan-vertical opacity-30"></div>
        </div>
      </div>

      <header className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Zap className="h-8 w-8 text-cyan-400 animate-pulse" />
                  <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-30 animate-pulse"></div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono tracking-wider">
                  TimeFlow
                </h1>
              </div>

              {user ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                  <Badge className="ml-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-300 font-mono text-xs px-3 py-1 shadow-lg shadow-cyan-500/20">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.name}
                  </Badge>
                </motion.div>
              ) : (
                <Badge className="ml-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 text-red-300 font-mono text-xs px-3 py-1">
                  ACCESS DENIED
                </Badge>
              )}
            </motion.div>

            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <nav className="hidden md:flex space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/app")}
                  className="relative group bg-slate-800/50 border border-cyan-500/20 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300 font-mono text-sm px-4 py-2 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <Home className="h-4 w-4 mr-2" />
                  DASHBOARD
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => navigate("/app/admin")}
                  className="relative group bg-slate-800/50 border border-purple-500/20 text-purple-300 hover:text-purple-100 hover:bg-purple-500/10 hover:border-purple-400/40 transition-all duration-300 font-mono text-sm px-4 py-2 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  ADMIN
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </nav>

              <Button
                variant="ghost"
                onClick={() => {
                  logout()
                  navigate("/login")
                }}
                className="relative group bg-slate-800/50 border border-red-500/20 text-red-300 hover:text-red-100 hover:bg-red-500/10 hover:border-red-400/40 transition-all duration-300 font-mono text-sm px-4 py-2 hover:shadow-lg hover:shadow-red-500/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                LOGOUT
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="relative z-10 mt-8 p-4 text-center border-t border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
        <motion.p
          className="text-sm text-cyan-400/70 font-mono tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-cyan-300">DEVELOPED BY</span> <span className="text-purple-400 font-bold">CELINE</span>
          <span className="animate-pulse ml-2">█</span>
        </motion.p>
      </footer>
    </div>
  )
}

export default ProtectedLayout
