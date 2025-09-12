"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Clock, User, Settings, X, Zap, Shield, Activity } from "lucide-react"
import { postData } from "../api/api"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraAction, setCameraAction] = useState(null)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()

  const storedUserData = sessionStorage.getItem("user")
  const user = storedUserData ? JSON.parse(storedUserData).data : null

  const initializeCamera = async (action) => {
    try {
      setLoading(true)
      setCameraAction(action)

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      })

      setStream(mediaStream)
      setShowCamera(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play()
        }
      }, 100)
    } catch (err) {
      console.error("Camera initialization error:", err)
      toast.error("Failed to access camera: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
    setCameraAction(null)
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready")
      return
    }

    try {
      setLoading(true)

      const canvas = canvasRef.current
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0)
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.8)

      closeCamera()

      if (cameraAction === "checkin") {
        await postData("/check-in", {
          ecNumber: user.ecNumber,
          imageBase64,
        })
        toast.success("Check-in successful!")
      } else if (cameraAction === "checkout") {
        const response = await postData("/check-out", {
          ecNumber: user.ecNumber,
          imageBase64,
        })
        toast.success(response.message)
      }
    } catch (err) {
      console.error(`${cameraAction} error:`, err)
      toast.error(`${cameraAction} failed: ` + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = () => {
    initializeCamera("checkin")
  }

  const handleCheckOut = () => {
    initializeCamera("checkout")
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Scanning lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-scan-vertical"></div>
        <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-secondary to-transparent opacity-40 animate-scan-horizontal"></div>
      </div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M0,10 L5,10 L5,5 L15,5 L15,15 L10,15 L10,20"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
                className="text-primary/30"
              />
              <circle cx="5" cy="10" r="1" fill="currentColor" className="text-primary/50" />
              <circle cx="15" cy="5" r="1" fill="currentColor" className="text-secondary/50" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Glowing orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-20 h-20 bg-accent/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl pulse-glow mb-8">
            <CardHeader className="space-y-6 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-t-xl border-b border-primary/20">
              {user ? (
                <>
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 rounded-full border border-primary/30">
                      <Activity className="h-5 w-5 text-primary animate-pulse" />
                      <span className="text-sm font-mono text-primary">SYSTEM ACTIVE</span>
                    </div>

                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      NEURAL INTERFACE
                    </CardTitle>
                    <p className="text-xl text-muted-foreground font-mono">
                      Welcome back, <span className="text-primary font-semibold">{user.name}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 font-mono">
                      <Zap className="h-3 w-3 mr-1" />
                      EC: {user.ecNumber}
                    </Badge>
                    {user.departmentName && (
                      <Badge className="bg-secondary/20 text-secondary border-secondary/30 font-mono">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.departmentName}
                      </Badge>
                    )}
                    {user.departmentId && (
                      <Badge className="bg-accent/20 text-accent border-accent/30 font-mono">
                        ID: {user.departmentId}
                      </Badge>
                    )}
                  </div>

                  <div className="text-center">
                    {user.profilePicture ? (
                      <div className="relative inline-block">
                        <img
                          src={`data:image/jpeg;base64,${user.profilePicture}`}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary/50 shadow-2xl"
                        />
                        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"></div>
                      </div>
                    ) : (
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-primary/50 shadow-2xl">
                          <User className="h-16 w-16 text-primary" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"></div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <CardDescription className="text-destructive font-mono">AUTHENTICATION REQUIRED</CardDescription>
                  <Button
                    onClick={() => navigate("/login")}
                    className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono"
                  >
                    INITIALIZE LOGIN SEQUENCE
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {showCamera && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                  <div className="bg-card border border-primary/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl pulse-glow">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-primary font-mono">
                        {cameraAction === "checkin" ? "BIOMETRIC SCAN - ENTRY" : "BIOMETRIC SCAN - EXIT"}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeCamera}
                        disabled={loading}
                        className="rounded-full border border-primary/30 hover:bg-primary/10"
                      >
                        <X className="h-5 w-5 text-primary" />
                      </Button>
                    </div>

                    <div className="relative mb-8">
                      <video
                        ref={videoRef}
                        className="w-full h-80 bg-muted rounded-2xl object-cover border-2 border-primary/30"
                        autoPlay
                        playsInline
                        muted
                      />

                      <div className="absolute inset-4 border-2 border-primary border-dashed rounded-2xl pointer-events-none">
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-primary text-sm bg-background/90 px-4 py-2 rounded-full backdrop-blur-sm border border-primary/30 font-mono">
                          ALIGN FACIAL FEATURES
                        </div>

                        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary animate-pulse"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary animate-pulse"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary animate-pulse"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary animate-pulse"></div>

                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={captureImage}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-primary-foreground font-mono py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        {loading ? "PROCESSING..." : "CAPTURE BIOMETRIC"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={closeCamera}
                        disabled={loading}
                        className="flex-1 border-2 border-primary/30 hover:bg-primary/10 text-primary py-4 rounded-xl transition-all duration-300 font-mono bg-transparent"
                      >
                        ABORT SCAN
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {user && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-primary mb-4 flex items-center font-mono">
                        <User className="h-5 w-5 mr-2" />
                        USER PROFILE
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-mono">NAME:</span>
                          <span className="text-card-foreground font-semibold">{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-mono">EC:</span>
                          <span className="text-primary font-mono">{user.ecNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-mono">DEPT:</span>
                          <span className="text-card-foreground">{user.departmentName || "UNASSIGNED"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-mono">ID:</span>
                          <span className="text-secondary font-mono">{user.departmentId || "N/A"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {user.faceEncoding && (
                    <Card className="border border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-secondary mb-4 flex items-center font-mono">
                          <Shield className="h-5 w-5 mr-2" />
                          BIOMETRIC STATUS
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-mono">STATUS:</span>
                            <span className="text-green-400 font-mono flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                              ACTIVE
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-mono">DATA:</span>
                            <span className="text-card-foreground font-mono">
                              {atob(user.faceEncoding).length} BYTES
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-mono">SECURITY:</span>
                            <span className="text-primary font-mono">ENCRYPTED</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-green-400 font-mono text-xl">
                      <Camera className="h-6 w-6" />
                      ENTRY PROTOCOL
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-mono">
                      Initialize work session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleCheckIn}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-mono py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 pulse-glow"
                      disabled={loading || showCamera}
                    >
                      <Zap className="mr-2 h-5 w-5" />
                      {loading && cameraAction === "checkin" ? "INITIALIZING..." : "EXECUTE CHECK-IN"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-red-400 font-mono text-xl">
                      <Clock className="h-6 w-6" />
                      EXIT PROTOCOL
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-mono">
                      Terminate work session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleCheckOut}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-mono py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 pulse-glow"
                      disabled={loading || showCamera}
                    >
                      <Activity className="mr-2 h-5 w-5" />
                      {loading && cameraAction === "checkout" ? "INITIALIZING..." : "EXECUTE CHECK-OUT"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button
                  variant="outline"
                  onClick={() => navigate("/app/admin")}
                  className="flex-1 border-2 border-primary/30 hover:bg-primary/10 text-primary py-4 rounded-xl transition-all duration-300 font-mono"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  ADMIN INTERFACE
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout()
                    navigate("/login")
                  }}
                  className="flex-1 border-2 border-destructive/30 hover:bg-destructive/10 text-destructive py-4 rounded-xl transition-all duration-300 font-mono"
                >
                  <User className="mr-2 h-5 w-5" />
                  TERMINATE SESSION
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 p-6 text-center">
          <div className="max-w-6xl mx-auto border-t border-primary/20 pt-6">
            <p className="text-sm text-muted-foreground font-mono">
              NEURAL INTERFACE v2.0 | Developed by <span className="font-bold text-primary">CELINE SYSTEMS</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Dashboard
