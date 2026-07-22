const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageController')
console.log('===== MESSAGE CONTROLLERS =====')
Object.keys(messageController).forEach(key => {
  console.log(key, typeof messageController[key])
})
const verifyToken = require('../middlewares/isLoggedinMiddleware')

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the current user
// @access  Private
router.get('/conversations', verifyToken, messageController.getConversations)

// @route   GET /api/messages/conversations/:id
// @desc    Get messages from a specific conversation
// @access  Private
router.get('/conversations/:id', verifyToken, messageController.getMessages)

// @route   POST /api/messages/conversations/:id
// @desc    Send a message to a conversation
// @access  Private
router.post('/conversations/:id', verifyToken, messageController.sendMessage)

// @route   POST /api/messages/users/:id
// @desc    Send a message to a user (creates or uses existing conversation)
// @access  Private
router.post('/users/:id', verifyToken, messageController.sendMessageToUser)

// @route   PUT /api/messages/conversations/:id/read
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/conversations/:id/read', verifyToken, messageController.markAsRead)

// @route   GET /api/messages/conversations/:id/unread
// @desc    Get unread message count for a conversation
// @access  Private
router.get(
  '/conversations/:id/unread',
  verifyToken,
  messageController.getUnreadCount,
)

// @route   POST /api/messages/conversations
// @desc    Create a new group conversation
// @access  Private
router.post(
  '/conversations',
  verifyToken,
  messageController.createGroupConversation,
)

// @route   PUT /api/messages/conversations/:id
// @desc    Update conversation details (group name, etc.)
// @access  Private
router.put(
  '/conversations/:id',
  verifyToken,
  messageController.updateConversation,
)

// @route   DELETE /api/messages/conversations/:id
// @desc    Leave or delete a conversation
// @access  Private
router.delete(
  '/conversations/:id',
  verifyToken,
  messageController.deleteConversation,
)

module.exports = router
