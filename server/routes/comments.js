const express = require('express')
const router = express.Router()
const commentControllers = require('../controllers/commentControllers')
console.log('===== COMMENT CONTROLLERS =====')
Object.keys(commentControllers).forEach(key => {
  console.log(key, typeof commentControllers[key])
})
// const { verifyToken, optionallyVerifyToken } = require('../middleware/auth')
const verifyToken = require('../middlewares/isLoggedinMiddleware')
const optionallyVerifyToken = require('../middlewares/isLoggedinMiddleware')

// @route   POST /api/comments
// @desc    Create a new comment on a post
// @access  Private
router.post('/', verifyToken, commentControllers.createComment)

// @route   GET /api/comments/post/:postId
// @desc    Get all comments for a post
// @access  Public (with enhanced features for logged-in users)
router.get(
  '/post/:postId',
  optionallyVerifyToken,
  commentControllers.getPostComments,
)

// @route   GET /api/comments/user/:userId
// @desc    Get all comments by a user
// @access  Public
router.get('/user/:userId', commentControllers.getUserComments)

// @route   GET /api/comments/:id
// @desc    Get a single comment by ID
// @access  Public
// router.get('/:id', commentControllers.getComment)

// @route   PATCH /api/comments/:id
// @desc    Update a comment
// @access  Private (comment owner or admin)
router.patch('/:id', verifyToken, commentControllers.updateComment)

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (comment owner or admin)
router.delete('/:id', verifyToken, commentControllers.deleteComment)

// @route   POST /api/comments/:id/like
// @desc    Like a comment
// @access  Private
router.post('/:id/like', verifyToken, commentControllers.likeComment)

// @route   DELETE /api/comments/:id/like
// @desc    Unlike a comment
// @access  Private
router.delete('/:id/like', verifyToken, commentControllers.unlikeComment)

// @route   POST /api/comments/:id/reply
// @desc    Reply to a comment (nested comments)
// @access  Private
router.post('/:id/reply', verifyToken, commentControllers.createReply)

// @route   GET /api/comments/:id/replies
// @desc    Get replies for a comment
// @access  Public
// router.get('/:id/replies', commentControllers.getCommentReplies)

module.exports = router
