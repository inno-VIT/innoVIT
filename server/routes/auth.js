// const jwt = require('jsonwebtoken')
// const User = require('../models/Users')

// // Main authentication middleware for UniCollab social features
// const verifyToken = async (req, res, next) => {
//   try {
//     // Support both Authorization header and x-access-token header
//     let token = req.headers['x-access-token']

//     if (
//       !token &&
//       req.headers.authorization &&
//       req.headers.authorization.startsWith('Bearer ')
//     ) {
//       token = req.headers.authorization.split(' ')[1]
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access token required',
//       })
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET)

//     // Get full user data from database
//     const user = await User.findById(decoded.userId).select('-password')

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found',
//       })
//     }

//     // Attach user to request object (matching your existing pattern)
//     req.user = {
//       id: user._id,
//       userId: user._id, // For compatibility with social media code
//       username: user.username,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       isAdmin: user.isAdmin || false,
//     }

//     return next()
//   } catch (err) {
//     console.error('Auth middleware error:', err)

//     if (err.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token',
//       })
//     }

//     if (err.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token expired',
//       })
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Authentication failed',
//     })
//   }
// }

// // Optional authentication middleware for public routes that can have enhanced features for logged-in users
// const optionallyVerifyToken = async (req, res, next) => {
//   try {
//     // Support both Authorization header and x-access-token header
//     let token = req.headers['x-access-token']

//     if (
//       !token &&
//       req.headers.authorization &&
//       req.headers.authorization.startsWith('Bearer ')
//     ) {
//       token = req.headers.authorization.split(' ')[1]
//     }

//     if (!token) {
//       return next()
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET)

//     // Get user data from database
//     const user = await User.findById(decoded.userId).select('-password')

//     if (user) {
//       req.user = {
//         id: user._id,
//         userId: user._id,
//         username: user.username,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         isAdmin: user.isAdmin || false,
//       }
//     }

//     next()
//   } catch (err) {
//     // For optional auth, just continue without user data if token is invalid
//     console.log('Optional auth failed, continuing without user:', err.message)
//     next()
//   }
// }

// // Admin-only middleware for UniCollab admin features
// const requireAdmin = (req, res, next) => {
//   if (!req.user || !req.user.isAdmin) {
//     return res.status(403).json({
//       success: false,
//       message: 'Admin access required',
//     })
//   }
//   next()
// }

// // Middleware to check if user owns the resource or is admin
// const requireOwnershipOrAdmin = resourceUserId => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required',
//       })
//     }

//     const resourceId = resourceUserId
//     const currentUserId = req.user.id

//     if (currentUserId !== resourceId && !req.user.isAdmin) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to access this resource',
//       })
//     }

//     next()
//   }
// }

// module.exports = {
//   verifyToken,
//   optionallyVerifyToken,
//   requireAdmin,
//   requireOwnershipOrAdmin,
// }

// <-------- THis code works perfectly fine ---------- >
const express = require('express')
const router = express.Router()
const User = require('../models/Users')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Input validation middleware
const validateSignup = (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.',
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    })
  }

  next()
}

const validateSignin = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    })
  }

  next()
}

// Auth middleware to protect routes
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded.userId }).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}

// Signup Route
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          'Email or username already taken. Please use different credentials.',
      })
    }

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      message: 'Error registering user. Please try again.',
    })
  }
})

// Login Route
router.post('/signin', validateSignin, async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    })

    res.status(200).json({
      success: true,
      message: 'User logged in successfully.',
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to login. Please try again.',
    })
  }
})

// Validate Token Route
router.get('/validate-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Access token required',
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Access token required',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded.userId }).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      },
      message: 'Token verified successfully',
    })
  } catch (error) {
    console.error('Token validation error:', error)

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid token',
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Token expired',
      })
    }

    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Token validation failed',
    })
  }
})

// Logout Route
router.post('/logout', (req, res) => {
  // Note: For true logout functionality, you might want to implement a token blacklist
  // For now, we'll just return success as the token should be removed from client-side
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  })
})

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch user profile',
    })
  }
})

// Update user profile (username)
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body

    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      })
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      username: username.toLowerCase().trim(),
      _id: { $ne: req.user._id },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken. Please choose a different one.',
      })
    }

    // Update username
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.toLowerCase().trim() },
      { new: true },
    ).select('-password')

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    })
  }
})

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      })
    }

    // Get user with password
    const user = await User.findById(req.user._id)

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    })
  }
})

// Delete user account
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    })
  }
})

module.exports = router
// -----------------------------------------------
// const express = require("express");
// const router = express.Router();
// const User = require("../models/Users");
// const jwt = require("jsonwebtoken");

// // Make sure JWT_SECRET is available
// if (!process.env.JWT_SECRET) {
//   console.error("❌ JWT_SECRET is not set in environment variables");
// }

// router.post("/signup", async (req, res) => {
//   const { firstName, lastName, username, email, password } = req.body;

//   try {
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
//     if (existingUser) {
//       return res.status(400).json({
//         message: "Email or username already taken. Please use different email or username",
//       });
//     }

//     const newUser = new User({
//       firstName,
//       lastName,
//       username,
//       email,
//       password,
//     });
//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error registering user." });
//   }
// });

// router.get("/validate-token", async (req, res) => {
//   const token = req.cookies.token;
//   console.log("Validating token...");

//   if (!token) {
//     return res.status(200).json({ valid: false, message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;
//     const user = await User.findOne({ _id: userId });

//     if (!user) {
//       return res.status(200).json({ valid: false, message: "User not found" });
//     }

//     const username = user.username;
//     return res.status(200).json({ valid: true, username, message: "Verified..." });
//   } catch (error) {
//     console.error("Token validation error:", error);
//     return res.status(200).json({ valid: false, message: "Invalid or expired token" });
//   }
// });

// router.post("/signin", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("User not found: ", email);
//       return res.status(400).json({ message: "Invalid Credentials." });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       console.log("Password mismatch");
//       return res.status(400).json({ message: "Invalid credentials." });
//     }

//     // Create token with JWT_SECRET
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     console.log("Token generated successfully");
//     res
//       .cookie("token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         path: "/",
//         sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
//         maxAge: 3600000, // 1 hour
//       })
//       .status(200)
//       .json({
//         message: "User logged in successfully.",
//         username: user.username,
//       });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Unable to Login." });
//   }
// });

// router.post("/logout", (req, res) => {
//   res
//     .cookie("token", "", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       path: "/",
//       sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
//       expires: new Date(0),
//     })
//     .status(200)
//     .json({ message: "Logged out successfully." });
// });

// module.exports = router;
