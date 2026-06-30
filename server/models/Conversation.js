const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema(
  {
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // New fields for enhanced messaging features
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    // For group conversations
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: '',
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // For conversation metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRead: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Ensure unique conversations between users (for 1-on-1 chats only)
conversationSchema.index(
  { recipients: 1 },
  {
    unique: true,
    partialFilterExpression: { isGroup: false },
  },
)

// Index for better query performance
conversationSchema.index({ lastMessageAt: -1 })
conversationSchema.index({ 'unreadCount.$**': 1 })
conversationSchema.index({ isGroup: 1 })

// Virtual for getting the other participant in 1-on-1 chats
conversationSchema.virtual('otherParticipant').get(function () {
  if (this.recipients && this.recipients.length === 2) {
    return this.recipients[1] // Assuming current user is first, return second
  }
  return null
})

// Ensure virtual fields are serialized
conversationSchema.set('toJSON', { virtuals: true })
conversationSchema.set('toObject', { virtuals: true })

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreate = async function (userId1, userId2) {
  // Sort recipients to ensure consistent conversation lookup
  const sortedRecipients = [userId1, userId2].sort()

  let conversation = await this.findOne({
    recipients: { $all: sortedRecipients },
    isGroup: false,
  })

  if (!conversation) {
    conversation = await this.create({
      recipients: sortedRecipients,
      isGroup: false,
    })
  }

  return conversation
}

// Static method to get user's conversations with pagination
conversationSchema.statics.getUserConversations = function (
  userId,
  page = 1,
  limit = 20,
) {
  const skip = (page - 1) * limit

  return this.find({
    recipients: { $in: [userId] },
    isActive: true,
  })
    .populate('recipients', 'username firstName lastName avatar email')
    .populate('groupAdmin', 'username firstName lastName')
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to mark messages as read for a user
conversationSchema.statics.markAsRead = async function (
  conversationId,
  userId,
) {
  return this.findByIdAndUpdate(
    conversationId,
    {
      $set: {
        [`unreadCount.${userId}`]: 0,
        [`lastRead.${userId}`]: new Date(),
      },
    },
    { new: true },
  )
}

// Instance method to get unread count for a user
conversationSchema.methods.getUnreadCount = function (userId) {
  return this.unreadCount.get(userId?.toString()) || 0
}

// Instance method to increment unread count for recipients except sender
conversationSchema.methods.incrementUnreadCounts = function (senderId) {
  this.recipients.forEach(recipientId => {
    if (recipientId.toString() !== senderId?.toString()) {
      const currentCount = this.getUnreadCount(recipientId)
      this.unreadCount.set(recipientId.toString(), currentCount + 1)
    }
  })
  return this.save()
}

// Instance method to get the other user in 1-on-1 chat
conversationSchema.methods.getOtherUser = function (currentUserId) {
  if (this.isGroup || this.recipients.length !== 2) {
    return null
  }

  return this.recipients.find(
    recipient => recipient._id?.toString() !== currentUserId?.toString(),
  )
}

// Instance method to check if user is participant
conversationSchema.methods.isParticipant = function (userId) {
  return this.recipients.some(
    recipient => recipient._id?.toString() === userId?.toString(),
  )
}

// Instance method to format conversation for API response
conversationSchema.methods.toAPIJSON = function (currentUserId = null) {
  const baseConversation = {
    _id: this._id,
    recipients: this.recipients,
    lastMessage: this.lastMessage,
    lastMessageAt: this.lastMessageAt,
    isGroup: this.isGroup,
    groupName: this.groupName,
    groupAdmin: this.groupAdmin,
    unreadCount: currentUserId ? this.getUnreadCount(currentUserId) : 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }

  // For 1-on-1 chats, include the other user's info
  if (!this.isGroup && this.recipients.length === 2 && currentUserId) {
    const otherUser = this.getOtherUser(currentUserId)
    baseConversation.recipient = otherUser
  }

  return baseConversation
}

// Pre-save middleware to ensure recipients are unique within a conversation
conversationSchema.pre('save', function (next) {
  if (this.recipients && this.recipients.length > 0) {
    // Remove duplicate recipients
    const uniqueRecipients = [
      ...new Set(this.recipients.map(r => r.toString())),
    ]
    this.recipients = uniqueRecipients

    // Auto-set group flag based on recipient count
    if (this.recipients.length > 2 && !this.isGroup) {
      this.isGroup = true
    }
  }
  next()
})

module.exports = mongoose.model('Conversation', conversationSchema)
