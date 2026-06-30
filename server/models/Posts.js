const mongoose = require('mongoose')
const PostLike = require('./PostLike')
const Comment = require('./Comment')

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: [80, 'Must be no more than 80 characters'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: [8000, 'Must be no more than 8000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Social media features
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    // Additional fields for enhanced functionality
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['discussion', 'question', 'resource', 'announcement'],
      default: 'discussion',
    },
    // For post visibility and moderation
    isPublished: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
    // For analytics
    viewCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    // For post expiration (if needed)
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ likeCount: -1, createdAt: -1 })
postSchema.index({ commentCount: -1, createdAt: -1 })
postSchema.index({ tags: 1 })
postSchema.index({ type: 1 })
postSchema.index({ isPublished: 1 })
postSchema.index({ isPinned: -1, createdAt: -1 })

// Virtual for post URL
postSchema.virtual('url').get(function () {
  return `/unicollab/post/${this._id}`
})

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true })
postSchema.set('toObject', { virtuals: true })

// Static method to get trending posts
postSchema.statics.getTrending = function (limit = 10, days = 7) {
  const date = new Date()
  date.setDate(date.getDate() - days)

  return this.find({
    createdAt: { $gte: date },
    isPublished: true,
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ likeCount: -1, commentCount: -1, viewCount: -1 })
    .limit(limit)
}

// Static method to get posts by user with pagination
postSchema.statics.getByUser = function (userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit

  return this.find({
    author: userId,
    isPublished: true,
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get posts by tag
postSchema.statics.getByTag = function (tag, page = 1, limit = 20) {
  const skip = (page - 1) * limit

  return this.find({
    tags: tag,
    isPublished: true,
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to search posts
postSchema.statics.search = function (query, page = 1, limit = 20) {
  const skip = (page - 1) * limit
  const searchRegex = new RegExp(query, 'i')

  return this.find({
    $or: [
      { title: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ],
    isPublished: true,
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get popular posts
postSchema.statics.getPopular = function (limit = 10) {
  return this.find({
    isPublished: true,
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ likeCount: -1, commentCount: -1 })
    .limit(limit)
}

// Instance method to like a post
postSchema.methods.like = function (userId) {
  const PostLike = mongoose.model('PostLike')

  return PostLike.findOne({ postId: this._id, userId: userId }).then(
    existingLike => {
      if (existingLike) {
        return this // Already liked
      }

      return PostLike.create({ postId: this._id, userId: userId }).then(() => {
        this.likeCount += 1
        return this.save()
      })
    },
  )
}

// Instance method to unlike a post
postSchema.methods.unlike = function (userId) {
  const PostLike = mongoose.model('PostLike')

  return PostLike.findOneAndDelete({ postId: this._id, userId: userId }).then(
    deletedLike => {
      if (deletedLike) {
        this.likeCount = Math.max(0, this.likeCount - 1)
        return this.save()
      }
      return this
    },
  )
}

// Instance method to check if user liked the post
postSchema.methods.isLikedBy = async function (userId) {
  const PostLike = mongoose.model('PostLike')
  const like = await PostLike.findOne({ postId: this._id, userId: userId })
  return !!like
}

// Instance method to increment view count
postSchema.methods.incrementViewCount = function () {
  this.viewCount += 1
  return this.save()
}

// Instance method to pin/unpin post
postSchema.methods.togglePin = function () {
  this.isPinned = !this.isPinned
  this.pinnedAt = this.isPinned ? new Date() : null
  return this.save()
}

// Instance method to format post for API response
postSchema.methods.toAPIJSON = function (userId = null) {
  const basePost = {
    _id: this._id,
    title: this.title,
    content: this.content,
    author: this.author,
    likeCount: this.likeCount,
    commentCount: this.commentCount,
    edited: this.edited,
    tags: this.tags,
    isAnonymous: this.isAnonymous,
    type: this.type,
    isPublished: this.isPublished,
    isPinned: this.isPinned,
    viewCount: this.viewCount,
    shareCount: this.shareCount,
    url: this.url,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }

  // Add user-specific data
  if (userId) {
    basePost.userLiked = this.isLikedBy(userId)
    basePost.canEdit =
      this.author._id?.toString() === userId.toString() ||
      this.author.toString() === userId.toString()
    basePost.canDelete = basePost.canEdit
  }

  return basePost
}

// Pre-save middleware for content validation and filtering
postSchema.pre('save', function (next) {
  // You can add content filtering here if needed
  // if (this.title) this.title = filter.clean(this.title)
  // if (this.content) this.content = filter.clean(this.content)

  if (this.isModified('content') && !this.isNew) {
    this.edited = true
  }

  next()
})

// Post-remove middleware to clean up related data
postSchema.post('findOneAndDelete', async function (doc, next) {
  if (doc) {
    try {
      // Delete all likes for this post
      await PostLike.deleteMany({ postId: doc._id })

      // Delete all comments for this post
      await Comment.deleteMany({ post: doc._id })
    } catch (error) {
      console.error('Error cleaning up post data:', error)
    }
  }
  next()
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
