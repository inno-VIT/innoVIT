import React, { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const isTokenValid = token => {
  if (!token) {
    return null
  }
  try {
    const decoded = jwtDecode(token)
    return decoded.exp * 1000 > Date.now() ? decoded : null
  } catch (e) {
    console.log('Token validation error:', e)
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // const API_URL =
  //   import.meta.env.MODE === 'development'
  //     ? 'http://localhost:5000'
  //     : 'https://innovit-backend.onrender.com'

  const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://innovit-backend.onrender.com')

  // const login = (token, userData) => {
  //   setToken(token)
  //   setUser(userData)
  //   setIsAuthenticated(true)
  //   localStorage.setItem('token', token)
  //   localStorage.setItem('user', JSON.stringify(userData))
  // }

  const login = (token, userData) => {
  console.log('LOGIN USER DATA:', userData)

  setToken(token)
  setUser(userData)
  setIsAuthenticated(true)

  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(userData))
}

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUser = updatedUserData => {
    const updatedUser = { ...user, ...updatedUserData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const getUserEmail = () => {
    return user?.email || null
  }

  const getUsername = () => {
    return user?.username || null
  }

  // Validate token with server
  const validateTokenWithServer = async token => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/validate-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 second timeout
      })
      return response.data
    } catch (error) {
      console.error('Server token validation failed:', error)
      const decoded = isTokenValid(token)
      if (decoded) {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          return {
            success: true,
            valid: true,
            user: JSON.parse(savedUser),
          }
        }
      }
      return { success: false, valid: false }
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (!savedToken || !savedUser) {
          setLoading(false)
          return
        }

        // First check if token is valid locally
        const decoded = isTokenValid(savedToken)
        if (!decoded) {
          logout()
          setLoading(false)
          return
        }

        // Then validate with server (with fallback to local validation)
        const validationResult = await validateTokenWithServer(savedToken)

        if (validationResult.valid && validationResult.user) {
          setToken(savedToken)
          setUser(validationResult.user)
          console.log('AUTH USER:', validationResult.user)
          setIsAuthenticated(true)

          // Set up token expiration timeout
          if (decoded.exp) {
            const timeout = decoded.exp * 1000 - Date.now()
            if (timeout > 0) {
              setTimeout(() => {
                console.log('Token expired, auto-logging out...')
                logout()
              }, timeout)
            } else {
              logout()
            }
          }
        } else {
          logout()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
        getUserEmail,
        getUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
