// src/utils/SocketContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { user, token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && token && !socket) {
      const API_URL =
        import.meta.env.MODE === 'development'
          ? 'http://localhost:5000'
          : 'https://innovit-backend.onrender.com'

      const newSocket = io(API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [isAuthenticated, token, socket])

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
  }

  return (
    <SocketContext.Provider value={{ socket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  )
}
