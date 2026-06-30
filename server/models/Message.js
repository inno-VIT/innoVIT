const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // New fields for enhanced messaging features
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    // For media messages
    mediaUrl: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      default: '', // 'image', 'video', 'document', etc.
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    // Read receipts
    read: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    readAt: {
      type: Date,
      default: null,
    },
    // For message reactions
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
        reactedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Reply functionality
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // For message deletion
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Edit history
    edited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        content: String,
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
messageSchema.index({ conversation: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })
messageSchema.index({ read: 1 })
messageSchema.index({ 'reactions.user': 1 })
messageSchema.index({ isDeleted: 1 })

// Virtual for formatted timestamp
messageSchema.virtual('timestamp').get(function () {
  return this.createdAt
})

// Virtual for message status
messageSchema.virtual('status').get(function () {
  if (this.isDeleted) return 'deleted'
  if (this.read) return 'read'
  return 'sent'
})

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true })
messageSchema.set('toObject', { virtuals: true })

// Static method to get messages by conversation with pagination
messageSchema.statics.getByConversation = function (
  conversationId,
  page = 1,
  limit = 50,
  before = null,
) {
  const skip = (page - 1) * limit

  let query = {
    conversation: conversationId,
    isDeleted: false,
  }

  // For infinite scroll - get messages before a certain date
  if (before) {
    query.createdAt = { $lt: new Date(before) }
  }

  return this.find(query)
    .populate('sender', 'username firstName lastName avatar email')
    .populate({
      path: 'replyTo',
      match: { isDeleted: false },
      populate: {
        path: 'sender',
        select: 'username firstName lastName avatar',
      },
    })
    .populate('readBy', 'username firstName lastName avatar')
    .populate('reactions.user', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
}

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function (
  conversationId,
  userId,
  upToMessageId = null,
) {
  const query = {
    conversation: conversationId,
    sender: { $ne: userId }, // Don't mark own messages as read
    read: false,
  }

  if (upToMessageId) {
    const upToMessage = await this.findById(upToMessageId)
    if (upToMessage) {
      query.createdAt = { $lte: upToMessage.createdAt }
    }
  }

  const result = await this.updateMany(query, {
    $set: { read: true, readAt: new Date() },
    $addToSet: { readBy: userId },
  })

  return result
}

// Static method to get unread message count for a user in a conversation
messageSchema.statics.getUnreadCount = function (conversationId, userId) {
  return this.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    read: false,
    isDeleted: false,
  })
}

// Static method to get last message in conversation
messageSchema.statics.getLastMessage = function (conversationId) {
  return this.findOne({
    conversation: conversationId,
    isDeleted: false,
  })
    .populate('sender', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
}

// Instance method to add a reaction
messageSchema.methods.addReaction = function (userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString(),
  )

  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    reactedAt: new Date(),
  })

  return this.save()
}

// Instance method to remove a reaction
messageSchema.methods.removeReaction = function (userId) {
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString(),
  )

  return this.save()
}

// Instance method to check if user has reacted with specific emoji
messageSchema.methods.hasReaction = function (userId, emoji = null) {
  if (emoji) {
    return this.reactions.some(
      reaction =>
        reaction.user.toString() === userId.toString() &&
        reaction.emoji === emoji,
    )
  }
  return this.reactions.some(
    reaction => reaction.user.toString() === userId.toString(),
  )
}

// Instance method to soft delete a message
messageSchema.methods.softDelete = function (userId) {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.deletedBy = userId
  this.content = '[message deleted]'
  this.mediaUrl = ''
  this.fileName = ''
  return this.save()
}

// Instance method to edit message content
messageSchema.methods.edit = function (newContent, userId) {
  // Save current content to edit history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date(),
  })

  // Update content
  this.content = newContent
  this.edited = true
  this.updatedAt = new Date()

  return this.save()
}

// Instance method to mark as read by a user
messageSchema.methods.markAsReadBy = function (userId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId)
  }

  if (!this.read) {
    this.read = true
    this.readAt = new Date()
  }

  return this.save()
}

// Instance method to format message for API response
messageSchema.methods.toAPIJSON = function (currentUserId = null) {
  const baseMessage = {
    _id: this._id,
    conversation: this.conversation,
    sender: this.sender,
    content: this.content,
    messageType: this.messageType,
    mediaUrl: this.mediaUrl,
    mediaType: this.mediaType,
    fileName: this.fileName,
    fileSize: this.fileSize,
    read: this.read,
    readBy: this.readBy,
    readAt: this.readAt,
    reactions: this.reactions,
    replyTo: this.replyTo,
    isDeleted: this.isDeleted,
    edited: this.edited,
    editHistory: this.edited ? this.editHistory : undefined,
    timestamp: this.createdAt,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }

  // Add user-specific data
  if (currentUserId) {
    baseMessage.userReaction = this.reactions.find(
      reaction =>
        reaction.user._id?.toString() === currentUserId.toString() ||
        reaction.user.toString() === currentUserId.toString(),
    )
    baseMessage.canDelete =
      this.sender._id?.toString() === currentUserId.toString() ||
      this.sender.toString() === currentUserId.toString()
    baseMessage.canEdit =
      baseMessage.canDelete && !this.isDeleted && this.messageType === 'text'
  }

  return baseMessage
}

// Pre-save middleware to update conversation's last message
messageSchema.post('save', async function (doc, next) {
  try {
    const Conversation = mongoose.model('Conversation')

    if (!doc.isDeleted) {
      await Conversation.findByIdAndUpdate(doc.conversation, {
        lastMessage: doc.content,
        lastMessageAt: doc.createdAt || new Date(),
      })
    }
  } catch (error) {
    console.error('Error updating conversation after message save:', error)
  }
  next()
})

module.exports = mongoose.model('Message', messageSchema)
