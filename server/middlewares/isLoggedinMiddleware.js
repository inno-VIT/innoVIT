const jwt = require('jsonwebtoken')

const isLoggedIn = (req, res, next) => {
  // Get token from Authorization header or x-access-token
  const token =
    req.headers.authorization?.split(' ')[1] ||
    req.headers['x-access-token']

  if (!token) {
    console.log('No token provided')
    return res.status(401).json({
      success: false,
      message: 'Please log in first...',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Make user data available throughout the request
    req.user = decoded
    req.userId = decoded.userId || decoded.id

    console.log('Token is present, user verified:', req.userId)

    next()
  } catch (error) {
    console.log('Invalid token:', error.message)

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

module.exports = isLoggedIn





// const jwt = require('jsonwebtoken');

// const isLoggedIn = (req, res, next) => {
//   // Get token from header
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     console.log('no token..?')
//     return res.status(401).json({ message: 'Please log in first...' })
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.userId;
//     console.log('Token is present, user verified')
//     next()
//   } catch (error) {
//     console.log('Invalid token')
//     return res.status(401).json({ message: 'Invalid or expired token' })
//   }
// }

// module.exports = isLoggedIn



// const isLoggedIn = (req, res, next) => {
//   if (!req.cookies.token) {
//     console.log('no token..?')
//     return res.status(500).json({ message: 'Please log in first...' })
//   } else {
//     console.log('Token is present, user verified')
//     next()
//   }
// }

// module.exports = isLoggedIn
