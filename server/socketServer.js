const jwt = require('jsonwebtoken')
let users = []

const authSocket = (socket, next) => {
  let token = socket.handshake.auth.token

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || process.env.TOKEN_KEY,
      )
      socket.decoded = decoded
      next()
    } catch (err) {
      console.error('Socket authentication error:', err.message)
      next(new Error('Authentication error'))
    }
  } else {
    console.error('No token provided for socket connection')
    next(new Error('Authentication error'))
  }
}

const socketServer = socket => {
  const userId = socket.decoded.userId || socket.decoded.id

  if (!userId) {
    console.error('No user ID found in socket token')
    socket.disconnect()
    return
  }

  console.log(`User ${userId} connected with socket ID: ${socket.id}`)

  // Remove user if they already exist (multiple connections)
  users = users.filter(user => user.userId !== userId)

  // Add new user connection
  users.push({ userId, socketId: socket.id })

  // Log current active users (for debugging)
  console.log(`Active socket users: ${users.length}`)

  // Handle sending messages
  socket.on('send-message', data => {
    try {
      const { recipientUserId, username, content, conversationId, messageId } =
        data

      console.log(
        `Message from ${userId} to ${recipientUserId}: ${content.substring(
          0,
          50,
        )}...`,
      )

      const recipient = users.find(user => user.userId == recipientUserId)

      if (recipient) {
        socket.to(recipient.socketId).emit('receive-message', {
          senderId: userId,
          username,
          content,
          conversationId,
          messageId,
          timestamp: new Date().toISOString(),
        })
        console.log(`Message delivered to user ${recipientUserId}`)
      } else {
        console.log(`User ${recipientUserId} is not connected. Message queued.`)
      }
    } catch (error) {
      console.error('Error in send-message:', error)
    }
  })

  // Handle typing indicators
  socket.on('typing-start', data => {
    const { recipientUserId, conversationId } = data
    const recipient = users.find(user => user.userId == recipientUserId)

    if (recipient) {
      socket.to(recipient.socketId).emit('user-typing', {
        userId,
        conversationId,
        isTyping: true,
      })
    }
  })

  socket.on('typing-stop', data => {
    const { recipientUserId, conversationId } = data
    const recipient = users.find(user => user.userId == recipientUserId)

    if (recipient) {
      socket.to(recipient.socketId).emit('user-typing', {
        userId,
        conversationId,
        isTyping: false,
      })
    }
  })

  // Handle post likes and comments notifications
  socket.on('post-like', data => {
    const { postAuthorId, postId, username } = data
    const author = users.find(user => user.userId == postAuthorId)

    if (author && author.userId !== userId) {
      // Don't notify yourself
      socket.to(author.socketId).emit('post-liked', {
        postId,
        likedBy: userId,
        username,
        timestamp: new Date().toISOString(),
      })
    }
  })

  socket.on('new-comment', data => {
    const { postAuthorId, postId, username, commentText } = data
    const author = users.find(user => user.userId == postAuthorId)

    if (author && author.userId !== userId) {
      // Don't notify yourself
      socket.to(author.socketId).emit('post-commented', {
        postId,
        commentedBy: userId,
        username,
        commentText: commentText.substring(0, 100), // Preview
        timestamp: new Date().toISOString(),
      })
    }
  })

  // Handle user online status
  socket.on('user-online', () => {
    // Broadcast to all users that this user is online
    socket.broadcast.emit('user-status-changed', {
      userId,
      isOnline: true,
      lastSeen: new Date().toISOString(),
    })
  })

  // Handle disconnect
  socket.on('disconnect', reason => {
    console.log(`User ${userId} disconnected. Reason: ${reason}`)

    // Remove user from active users
    users = users.filter(user => user.userId != userId)

    // Broadcast user offline status
    socket.broadcast.emit('user-status-changed', {
      userId,
      isOnline: false,
      lastSeen: new Date().toISOString(),
    })

    console.log(`Active socket users after disconnect: ${users.length}`)
  })

  // Handle connection errors
  socket.on('error', error => {
    console.error(`Socket error for user ${userId}:`, error)
  })
}

// Utility function to get online users (optional)
const getOnlineUsers = () => {
  return users.map(user => user.userId)
}

// Utility function to send notification to specific user
const sendNotificationToUser = (userId, notification) => {
  const user = users.find(user => user.userId === userId)
  if (user) {
    const io = require('./index').io // You'll need to export io from index.js
    io.to(user.socketId).emit('notification', notification)
    return true
  }
  return false
}

module.exports = {
  socketServer,
  authSocket,
  getOnlineUsers,
  sendNotificationToUser,
}
