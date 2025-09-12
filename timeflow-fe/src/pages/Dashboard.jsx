"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Clock, User, Settings, X } from "lucide-react"
import { postData } from "../api/api"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraAction, setCameraAction] = useState(null) // 'checkin' or 'checkout'
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

      // Wait for video element to be ready
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

      // Close camera first
      closeCamera()

      // Process the captured image
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            {user ? (
              <>
                <CardTitle className="text-3xl text-center font-bold">Welcome back, {user.name}</CardTitle>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    EC: {user.ecNumber}
                  </Badge>
                  {user.departmentName && (
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                      {user.departmentName}
                    </Badge>
                  )}
                  {user.departmentId && (
                    <Badge variant="default" className="bg-white/20 text-white">
                      ID: {user.departmentId}
                    </Badge>
                  )}
                </div>

                <div className="mt-6 text-center">
                  {user.profilePicture ? (
                    <img
                      src={`data:image/jpeg;base64,${user.profilePicture}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center">
                <CardDescription className="text-white/80">No user data found. Please log in.</CardDescription>
                <Button onClick={() => navigate("/login")} className="mt-4 bg-white text-blue-600 hover:bg-white/90">
                  Go to Login
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {showCamera && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {cameraAction === "checkin" ? "Check In" : "Check Out"} Camera
                    </h3>
                    <Button variant="ghost" size="sm" onClick={closeCamera} disabled={loading} className="rounded-full">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="relative mb-6">
                    <video
                      ref={videoRef}
                      className="w-full h-64 bg-gray-100 rounded-xl object-cover shadow-inner"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute inset-4 border-2 border-white border-dashed rounded-xl pointer-events-none">
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm">
                        Position your face in the frame
                      </div>
                      {/* Corner guides for better positioning */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white"></div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={captureImage}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200"
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      {loading ? "Processing..." : "Capture"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeCamera}
                      disabled={loading}
                      className="flex-1 border-2 hover:bg-gray-50 py-3 rounded-xl transition-all duration-200 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />

            {user && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      User Information
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Name:</span> {user.name}
                      </p>
                      <p>
                        <span className="font-medium">EC Number:</span> {user.ecNumber}
                      </p>
                      <p>
                        <span className="font-medium">Department:</span> {user.departmentName || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Department ID:</span> {user.departmentId || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {user.faceEncoding && (
                  <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Camera className="h-4 w-4 mr-2 text-green-600" />
                        Face Recognition
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Status:</span> Active
                        </p>
                        <p>
                          <span className="font-medium">Data Size:</span> {atob(user.faceEncoding).length} bytes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Camera className="h-5 w-5" />
                    Check In
                  </CardTitle>
                  <CardDescription>Start your work day</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCheckIn}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={loading || showCamera}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {loading && cameraAction === "checkin" ? "Starting Camera..." : "Check In Now"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Clock className="h-5 w-5" />
                    Check Out
                  </CardTitle>
                  <CardDescription>End your work day</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCheckOut}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={loading || showCamera}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {loading && cameraAction === "checkout" ? "Starting Camera..." : "Check Out Now"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/app/admin")}
                className="flex-1 border-2 hover:bg-gray-50 py-3 rounded-xl transition-all duration-200"
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  logout()
                  navigate("/login")
                }}
                className="flex-1 border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 py-3 rounded-xl transition-all duration-200"
              >
                <User className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 p-4 text-center text-sm text-gray-500">
        <div className="max-w-4xl mx-auto border-t border-gray-200 pt-4">
          Developed by <span className="font-medium text-gray-700">Celine</span>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
