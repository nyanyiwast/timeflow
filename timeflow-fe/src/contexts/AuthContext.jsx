"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../api/api"

const AuthContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(sessionStorage.getItem("token"))
  const [isAdmin, setIsAdmin] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      // Try to load user from sessionStorage first
      const storedUser = sessionStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        const adminStatus = parsedUser.role === "admin" || parsedUser.ecNumber === "admin"
        console.log("[v0] Setting isAdmin from storage:", adminStatus, "user role:", parsedUser.role)
        setIsAdmin(adminStatus)
        setLoading(false)
        return
      }

      // Fetch if not in storage
      const decodedPayload = JSON.parse(atob(token.split(".")[1]))
      api
        .get(`/employees/${decodedPayload.ecNumber}`)
        .then((userData) => {
          setUser(userData)
          sessionStorage.setItem("user", JSON.stringify(userData))
          const adminStatus = userData.role === "admin" || userData.ecNumber === "admin"
          console.log("[v0] Setting isAdmin from API:", adminStatus, "user role:", userData.role)
          setIsAdmin(adminStatus)
          setLoading(false)
        })
        .catch(() => {
          logout()
        })
    } else {
      // Clear storage on no token
      sessionStorage.removeItem("user")
      setLoading(false)
    }
  }, [token])

  const login = async (token, initialUserData) => {
    console.log("[v0] AuthContext login called with:", initialUserData)
    sessionStorage.setItem("token", token)
    setToken(token)

    setUser(initialUserData)
    sessionStorage.setItem("user", JSON.stringify(initialUserData))
    const adminStatus = initialUserData.role === "admin" || initialUserData.ecNumber === "admin"
    console.log("[v0] Setting isAdmin immediately:", adminStatus, "user role:", initialUserData.role)
    setIsAdmin(adminStatus)

    // Return the role for immediate use in navigation
    return initialUserData.role
  }

  const logout = () => {
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    setToken(null)
    setUser(null)
    setIsAdmin(false)
  }

  const value = {
    user,
    token,
    isAdmin,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
