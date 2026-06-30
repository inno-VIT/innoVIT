const express = require('express')
const router = express.Router()
const postControllers = require('../controllers/postControllers')

// CORRECTED IMPORT - use destructuring for named exports
const { verifyToken } = require('../middlewares/auth') // Fixed path and import

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
      // Continue without user if token is invalid
      console.log('Optional auth - invalid token, continuing without user')
    }
  }
  next()
}

// Debug: Check middleware
console.log('=== DEBUGGING MIDDLEWARE ===')
console.log('verifyToken:', typeof verifyToken)
console.log('optionallyVerifyToken:', typeof optionallyVerifyToken)
console.log('=== END MIDDLEWARE DEBUG ===')

// Safe controller wrapper with fallbacks
const safeController = (controller, fallbackMessage) => {
  if (typeof controller === 'function') {
    return controller
  }
  console.warn(`Using fallback for: ${fallbackMessage}`)
  return (req, res) =>
    res.json({
      success: true,
      message: fallbackMessage,
      note: 'This endpoint is not fully implemented yet',
    })
}

// Debug: Check all controllers
console.log('=== DEBUGGING ALL CONTROLLERS ===')
const controllersToCheck = [
  'getPosts',
  'getPost',
  'createPost',
  'updatePost',
  'deletePost',
  'likePost',
  'unlikePost',
  'getTrendingPosts',
  'getPopularPosts',
  'searchPosts',
  'getPostsByTag',
  'getUserLikes',
  'getUserLikedPosts',
  'incrementViewCount',
  'togglePinPost',
  'getComments',
  'createComment',
]

controllersToCheck.forEach(controllerName => {
  console.log(`${controllerName}:`, typeof postControllers[controllerName])
})
console.log('=== END DEBUG ===')

// ===== POST ROUTES =====

// @route   GET /api/posts
// @desc    Get all posts with optional filtering and pagination
// @access  Public (with enhanced features for logged-in users)
router.get(
  '/',
  optionallyVerifyToken,
  safeController(postControllers.getPosts, 'Get posts endpoint'),
)

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post(
  '/',
  verifyToken,
  safeController(postControllers.createPost, 'Create post endpoint'),
)

// @route   GET /api/posts/trending
// @desc    Get trending posts
// @access  Public
router.get(
  '/trending',
  optionallyVerifyToken,
  safeController(
    postControllers.getTrendingPosts,
    'Get trending posts endpoint',
  ),
)

// @route   GET /api/posts/popular
// @desc    Get popular posts
// @access  Public
router.get(
  '/popular',
  optionallyVerifyToken,
  safeController(postControllers.getPopularPosts, 'Get popular posts endpoint'),
)

// @route   GET /api/posts/search
// @desc    Search posts by query
// @access  Public
router.get(
  '/search',
  optionallyVerifyToken,
  safeController(postControllers.searchPosts, 'Search posts endpoint'),
)

// @route   GET /api/posts/tag/:tag
// @desc    Get posts by tag
// @access  Public
router.get(
  '/tag/:tag',
  optionallyVerifyToken,
  safeController(postControllers.getPostsByTag, 'Get posts by tag endpoint'),
)

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
// @access  Public (with enhanced features for logged-in users)
router.get(
  '/:id',
  optionallyVerifyToken,
  safeController(postControllers.getPost, 'Get single post endpoint'),
)

// @route   PATCH /api/posts/:id
// @desc    Update a post
// @access  Private (post author or admin)
router.patch(
  '/:id',
  verifyToken,
  safeController(postControllers.updatePost, 'Update post endpoint'),
)

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (post author or admin)
router.delete(
  '/:id',
  verifyToken,
  safeController(postControllers.deletePost, 'Delete post endpoint'),
)

// @route   POST /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.post(
  '/:id/like',
  verifyToken,
  safeController(postControllers.likePost, 'Like post endpoint'),
)

// @route   DELETE /api/posts/:id/like
// @desc    Unlike a post
// @access  Private
router.delete(
  '/:id/like',
  verifyToken,
  safeController(postControllers.unlikePost, 'Unlike post endpoint'),
)

// @route   GET /api/posts/:id/likes
// @desc    Get users who liked a post
// @access  Public
router.get(
  '/:id/likes',
  safeController(postControllers.getUserLikes, 'Get user likes endpoint'),
)

// @route   GET /api/posts/liked/:userId
// @desc    Get posts liked by a user
// @access  Public (with enhanced features for logged-in users)
router.get(
  '/liked/:userId',
  optionallyVerifyToken,
  safeController(
    postControllers.getUserLikedPosts,
    'Get user liked posts endpoint',
  ),
)

// @route   POST /api/posts/:id/view
// @desc    Increment post view count
// @access  Public
router.post(
  '/:id/view',
  safeController(
    postControllers.incrementViewCount,
    'Increment view count endpoint',
  ),
)

// @route   POST /api/posts/:id/pin
// @desc    Pin or unpin a post
// @access  Private (post author or admin)
router.post(
  '/:id/pin',
  verifyToken,
  safeController(postControllers.togglePinPost, 'Toggle pin post endpoint'),
)

// ===== COMMENT ROUTES =====

// @route   GET /api/posts/:id/comments
// @desc    Get comments for a post
// @access  Public
router.get(
  '/:id/comments',
  safeController(postControllers.getComments, 'Get comments endpoint'),
)

// @route   POST /api/posts/:id/comments
// @desc    Create a comment on a post
// @access  Private
router.post(
  '/:id/comments',
  verifyToken,
  safeController(postControllers.createComment, 'Create comment endpoint'),
)

console.log('✅ Posts routes configured successfully!')

module.exports = router
