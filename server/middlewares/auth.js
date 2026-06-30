const jwt = require('jsonwebtoken')
const User = require('../models/Users')

// Verify token middleware (same as your isLoggedIn but with different name)
const verifyToken = async (req, res, next) => {
  // Get token from header
  const token =
    req.headers.authorization?.split(' ')[1] || req.headers['x-access-token']

  if (!token) {
    console.log('No token provided')
    return res.status(401).json({ message: 'Please log in first...' })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key',
    )
    req.user = decoded // Store full user object
    req.userId = decoded.userId || decoded.id // Keep for backward compatibility

    console.log('Token is present, user verified:', req.userId)
    next()
  } catch (error) {
    console.log('Invalid token:', error.message)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Optional token verification (doesn't fail if no token provided)
const optionallyVerifyToken = async (req, res, next) => {
  const token =
    req.headers.authorization?.split(' ')[1] || req.headers['x-access-token']

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret-key',
      )
      req.user = decoded
      req.userId = decoded.userId || decoded.id
      console.log('Optional token - user verified:', req.userId)
    } catch (error) {
      console.log(
        'Optional token - invalid, continuing without user:',
        error.message,
      )
      // Continue without user info
    }
  } else {
    console.log('No token provided for optional auth')
  }

  next()
}

// Keep your original isLoggedIn for backward compatibility
const isLoggedIn = verifyToken

// Admin role verification (if needed)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' })
  }

  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'Access denied. Admin role required.' })
  }

  next()
}

module.exports = {
  verifyToken,
  optionallyVerifyToken,
  isLoggedIn, // Keep for backward compatibility
  requireAdmin,
}
