"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { postData } from "../api/api"
import { toast } from "sonner"

const Register = () => {
  const [formData, setFormData] = useState({
    ecNumber: "",
    name: "",
    password: "",
    departmentId: 1, // Default department; can be selected from dropdown
  })
  const [imageBase64, setImageBase64] = useState("")
  const [preview, setPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const value = e.target.name === "departmentId" ? Number.parseInt(e.target.value, 10) : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await postData("/employees/register", {
        ecNumber: formData.ecNumber,
        name: formData.name,
        password: formData.password,
        departmentId: formData.departmentId,
        imageBase64,
      })

      toast.success("Registration successful! Please login.")
      navigate("/login")
    } catch (err) {
      console.error("Registration error:", err)
      toast.error("Registration failed")
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
              <UserPlus className="w-8 h-8 text-slate-900" />
            </div>
            <CardTitle className="text-3xl font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              USER REGISTRATION
            </CardTitle>
            <CardDescription className="text-slate-300 font-mono text-sm">CREATE NEW SYSTEM ACCOUNT</CardDescription>
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
                    name="ecNumber"
                    type="text"
                    placeholder="EC-XXXX"
                    value={formData.ecNumber}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-slate-500 font-mono focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-md pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
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
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-slate-500 font-mono focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-md pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                  Department ID
                </Label>
                <div className="relative">
                  <Input
                    id="departmentId"
                    name="departmentId"
                    type="number"
                    placeholder="DEPT-001"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 placeholder-slate-500 font-mono focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-md pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-cyan-400 font-mono text-sm uppercase tracking-wider">Biometric Scan</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setImageBase64(reader.result)
                          setPreview(reader.result)
                        }
                        reader.readAsDataURL(file)
                      } else {
                        setImageBase64("")
                        setPreview("")
                      }
                    }}
                    className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 file:bg-cyan-600 file:text-slate-900 file:border-0 file:rounded-md file:px-4 file:py-2 file:font-mono file:text-sm file:font-medium hover:file:bg-cyan-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
                {preview && (
                  <div className="relative">
                    <div className="relative w-full h-32 bg-slate-800/50 border border-cyan-500/30 rounded-lg overflow-hidden">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Biometric Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Scanning overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-transparent to-cyan-400/20 animate-pulse" />
                      <div className="absolute top-2 left-2 text-cyan-400 font-mono text-xs">SCAN COMPLETE</div>
                      <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-900 font-mono font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    <span>PROCESSING...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>REGISTER USER</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-mono text-sm"
            >
              ← EXISTING USER LOGIN
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Register
