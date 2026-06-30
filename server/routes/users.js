const express = require('express')
const router = express.Router()
const userControllers = require('../controllers/userControllers')
console.log('===== USER CONTROLLERS =====')
Object.keys(userControllers).forEach(key => {
  console.log(key, typeof userControllers[key])
})

// Use your existing middleware
const verifyToken = require('../middlewares/isLoggedinMiddleware')

// Create optional auth middleware
const optionallyVerifyToken = (req, res, next) => {
  const token =
    req.headers.authorization?.split(' ')[1] || req.headers['x-access-token']

  if (token) {
    try {
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      req.userId = decoded.userId
    } catch (error) {
      console.log('Optional auth - invalid token, continuing without user')
    }
  }
  next()
}

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', userControllers.register)

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', userControllers.login)

// @route   GET /api/users/random
// @desc    Get random users for suggestions
// @access  Public (with enhanced features for logged-in users)
router.get('/random', optionallyVerifyToken, userControllers.getRandomUsers)

// @route   GET /api/users/search
// @desc    Search users by query
// @access  Public
router.get('/search', userControllers.searchUsers)

// @route   GET /api/users/popular
// @desc    Get popular users
// @access  Public
router.get('/popular', userControllers.getPopularUsers)

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', optionallyVerifyToken, userControllers.getUser)

// @route   GET /api/users/:id/posts
// @desc    Get posts by user
// @access  Public
router.get('/:id/posts', optionallyVerifyToken, userControllers.getUserPosts)

// @route   GET /api/users/:id/comments
// @desc    Get comments by user
// @access  Public
router.get('/:id/comments', userControllers.getUserComments)

// @route   PATCH /api/users/profile
// @desc    Update user profile
// @access  Private
router.patch('/profile', verifyToken, userControllers.updateUser)

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', verifyToken, userControllers.follow)

// @route   DELETE /api/users/:id/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:id/follow', verifyToken, userControllers.unfollow)

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get('/:id/followers', userControllers.getFollowers)

// @route   GET /api/users/:id/following
// @desc    Get users followed by user
// @access  Public
router.get('/:id/following', userControllers.getFollowing)

// @route   GET /api/users/:id/mutual
// @desc    Get mutual follows with user
// @access  Private
router.get('/:id/mutual', verifyToken, userControllers.getMutualFollows)

// @route   GET /api/users/suggestions
// @desc    Get follow suggestions for current user
// @access  Private
router.get('/suggestions', verifyToken, userControllers.getSuggestions)

module.exports = router
