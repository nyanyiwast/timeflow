"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { postData } from "../api/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"

const Login = () => {
  const [ecNumber, setEcNumber] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await postData("/employees/login", {
        ecNumber,
        password,
      })

      await login(data.token, data.employee)
      toast.success("Login successful!")
      // Redirect based on role after login completes
  if (isAdmin) {
    navigate("/app/admin")
  } else {
    navigate("/app")
  }
    } catch (err) {
      console.error("Login error:", err)
      toast.error("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Animated scanning lines */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-slate-900/90 border-cyan-500/30 backdrop-blur-sm shadow-2xl shadow-cyan-500/20">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-sm -z-10" />

          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/50">
              <Lock className="w-8 h-8 text-slate-900" />
            </div>
            <CardTitle className="text-3xl font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              TIMEFLOW
            </CardTitle>
            <CardDescription className="text-slate-300 font-mono text-sm">
              ENTER CREDENTIALS TO AUTHENTICATE
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ecNumber" className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                  Employee Code
                </Label>
                <div className="relative">
                  <Input
                    id="ecNumber"
                    type="text"
                    placeholder="EC-XXXX"
                    value={ecNumber}
                    onChange={(e) => setEcNumber(e.target.value)}
                    required
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-slate-500 font-mono focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-md pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                  Access Key
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-slate-500 font-mono focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-md pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-900 font-mono font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>AUTHENTICATE</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-mono text-sm uppercase tracking-wider"
            >
              ← RETURN TO TERMINAL
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/register")}
              className="text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-mono text-sm"
            >
              NEW USER REGISTRATION →
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login
