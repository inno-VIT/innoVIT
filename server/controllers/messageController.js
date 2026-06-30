const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/Users')
const mongoose = require('mongoose')

const sendMessageToUser = async (req, res) => {
  try {
    const recipientId = req.params.id
    const {
      content,
      messageType = 'text',
      mediaUrl,
      fileName,
      fileSize,
    } = req.body
    const userId = req.user.id

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      })
    }

    if (recipientId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself',
      })
    }

    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
      })
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(userId, recipientId)

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      content: content.trim(),
      messageType,
      mediaUrl: mediaUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0,
    })

    // Populate sender info
    await Message.populate(message, {
      path: 'sender',
      select: 'username firstName lastName avatar email',
    })

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message.toAPIJSON(userId),
    })
  } catch (err) {
    console.error('Send message error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const sendMessage = async (req, res) => {
  try {
    const conversationId = req.params.id
    const {
      content,
      messageType = 'text',
      mediaUrl,
      fileName,
      fileSize,
      replyTo,
    } = req.body
    const userId = req.user.id

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      })
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      recipients: { $in: [userId] },
    })

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation',
      })
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      messageType,
      mediaUrl: mediaUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0,
      replyTo: replyTo || null,
    })

    // Populate message with all relations
    await Message.populate(message, [
      {
        path: 'sender',
        select: 'username firstName lastName avatar email',
      },
      {
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username firstName lastName avatar',
        },
      },
    ])

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message.toAPIJSON(userId),
    })
  } catch (err) {
    console.error('Send message error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id
    const userId = req.user.id
    const { page = 1, limit = 50, before } = req.query

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required',
      })
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      recipients: { $in: [userId] },
    })

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation',
      })
    }

    const messages = await Message.getByConversation(
      conversationId,
      page,
      limit,
      before,
    )
    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    })

    // Mark messages as read
    await Message.markAsRead(conversationId, userId)

    return res.json({
      success: true,
      data: messages.map(msg => msg.toAPIJSON(userId)),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get messages error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20 } = req.query

    const conversations = await Conversation.getUserConversations(
      userId,
      page,
      limit,
    )
    const total = await Conversation.countDocuments({
      recipients: { $in: [userId] },
      isActive: true,
    })

    const formattedConversations = conversations.map(conversation =>
      conversation.toAPIJSON(userId),
    )

    return res.json({
      success: true,
      data: formattedConversations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get conversations error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const markAsRead = async (req, res) => {
  try {
    const conversationId = req.params.id
    const userId = req.user.id

    const conversation = await Conversation.findOne({
      _id: conversationId,
      recipients: { $in: [userId] },
    })

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation',
      })
    }

    await Message.markAsRead(conversationId, userId)
    await Conversation.markAsRead(conversationId, userId)

    return res.json({
      success: true,
      message: 'Messages marked as read',
    })
  } catch (err) {
    console.error('Mark as read error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getUnreadCount = async (req, res) => {
  try {
    const conversationId = req.params.id
    const userId = req.user.id

    const conversation = await Conversation.findOne({
      _id: conversationId,
      recipients: { $in: [userId] },
    })

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation',
      })
    }

    const unreadCount = await Message.getUnreadCount(conversationId, userId)

    return res.json({
      success: true,
      data: { unreadCount },
    })
  } catch (err) {
    console.error('Get unread count error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const createGroupConversation = async (req, res) => {
  try {
    const { name, recipients } = req.body
    const userId = req.user.id

    if (
      !name ||
      !recipients ||
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Group name and at least one recipient are required',
      })
    }

    // Include current user in recipients
    const allRecipients = [...new Set([userId, ...recipients])]

    if (allRecipients.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Group conversations require at least 3 participants',
      })
    }

    const conversation = await Conversation.create({
      recipients: allRecipients,
      isGroup: true,
      groupName: name.trim(),
      groupAdmin: userId,
    })

    await Conversation.populate(conversation, {
      path: 'recipients',
      select: 'username firstName lastName avatar email',
    })

    return res.status(201).json({
      success: true,
      message: 'Group conversation created successfully',
      data: conversation.toAPIJSON(userId),
    })
  } catch (err) {
    console.error('Create group conversation error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const updateConversation = async (req, res) => {
  try {
    const conversationId = req.params.id
    const { groupName } = req.body
    const userId = req.user.id

    const conversation = await Conversation.findOne({
      _id: conversationId,
      recipients: { $in: [userId] },
    })

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this conversation',
      })
    }

    if (conversation.isGroup && conversation.groupAdmin.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can update conversation details',
      })
    }

    if (groupName) {
      conversation.groupName = groupName.trim()
    }

    await conversation.save()

    return res.json({
      success: true,
      message: 'Conversation updated successfully',
      data: conversation.toAPIJSON(userId),
    })
  } catch (err) {
    console.error('Update conversation error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id
    const userId = req.user.id

    const conversation = await Conversation.findOne({
      _id: conversationId,
      recipients: { $in: [userId] },
    })

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this conversation',
      })
    }

    // For group chats, only admin can delete
    if (conversation.isGroup && conversation.groupAdmin.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can delete the conversation',
      })
    }

    // Soft delete by removing user from recipients or deactivating
    if (conversation.isGroup) {
      conversation.recipients = conversation.recipients.filter(
        recipient => recipient.toString() !== userId,
      )
      await conversation.save()
    } else {
      conversation.isActive = false
      await conversation.save()
    }

    return res.json({
      success: true,
      message: 'Conversation deleted successfully',
    })
  } catch (err) {
    console.error('Delete conversation error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

module.exports = {
  sendMessage,
  sendMessageToUser,
  getMessages,
  getConversations,
  markAsRead,
  getUnreadCount,
  createGroupConversation,
  updateConversation,
  deleteConversation,
}
