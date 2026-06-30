const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    commenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    // New fields for social media features
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    // For soft delete functionality
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Add children virtual for comment threading
commentSchema.virtual('children', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
})

// Add replies virtual (alias for children)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
})

commentSchema.set('toJSON', { virtuals: true })
commentSchema.set('toObject', { virtuals: true })

// Index for better query performance
commentSchema.index({ post: 1, createdAt: -1 })
commentSchema.index({ commenter: 1 })
commentSchema.index({ parent: 1 })
commentSchema.index({ isDeleted: 1 })

// Middleware to update post comment count when comment is saved
commentSchema.post('save', async function (doc, next) {
  try {
    if (doc.isNew) {
      // Only update post comment count for new comments (not replies)
      const Post = mongoose.model('Post')
      const post = await Post.findById(doc.post)
      if (post) {
        post.commentCount = (post.commentCount || 0) + 1
        await post.save()
      }
    }
  } catch (error) {
    console.error('Error updating post comment count:', error)
  }
  next()
})

// Middleware to update post comment count when comment is deleted
commentSchema.post('findOneAndDelete', async function (doc, next) {
  if (doc) {
    try {
      const Post = mongoose.model('Post')
      const post = await Post.findById(doc.post)
      if (post) {
        post.commentCount = Math.max(0, (post.commentCount || 0) - 1)
        await post.save()
      }

      // Also delete all child comments (replies)
      const Comment = mongoose.model('Comment')
      await Comment.deleteMany({ parent: doc._id })
    } catch (error) {
      console.error('Error in comment post-delete middleware:', error)
    }
  }
  next()
})

// Static method to get comments by post with pagination
commentSchema.statics.getByPost = function (
  postId,
  page = 1,
  limit = 50,
  includeReplies = true,
) {
  const skip = (page - 1) * limit

  let query = this.find({
    post: postId,
    parent: null, // Only get root comments
    isDeleted: false,
  })
    .populate('commenter', 'username firstName lastName avatar bio')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  if (includeReplies) {
    query = query.populate({
      path: 'children',
      match: { isDeleted: false },
      options: { sort: { createdAt: 1 } },
      populate: {
        path: 'commenter',
        select: 'username firstName lastName avatar bio',
      },
    })
  }

  return query
}

// Static method to get comment count for a post
commentSchema.statics.getCountByPost = function (postId) {
  return this.countDocuments({
    post: postId,
    isDeleted: false,
  })
}

// Static method to get user's comments
commentSchema.statics.getByUser = function (userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit

  return this.find({
    commenter: userId,
    isDeleted: false,
  })
    .populate('post', 'title content')
    .populate('commenter', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Instance method to soft delete a comment
commentSchema.methods.softDelete = function () {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.content = '[deleted]'
  return this.save()
}

// Instance method to like a comment
commentSchema.methods.like = function (userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId)
    this.likeCount += 1
    return this.save()
  }
  return Promise.resolve(this)
}

// Instance method to unlike a comment
commentSchema.methods.unlike = function (userId) {
  const userIndex = this.likes.indexOf(userId)
  if (userIndex > -1) {
    this.likes.splice(userIndex, 1)
    this.likeCount = Math.max(0, this.likeCount - 1)
    return this.save()
  }
  return Promise.resolve(this)
}

// Instance method to check if user liked the comment
commentSchema.methods.isLikedBy = function (userId) {
  return this.likes.includes(userId)
}

// Instance method to format comment for API response
commentSchema.methods.toAPIJSON = function (userId = null) {
  const baseComment = {
    _id: this._id,
    content: this.content,
    commenter: this.commenter,
    post: this.post,
    parent: this.parent,
    edited: this.edited,
    likeCount: this.likeCount,
    userLiked: userId ? this.isLikedBy(userId) : false,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isDeleted: this.isDeleted,
  }

  // Include children/replies if populated
  if (this.children && Array.isArray(this.children)) {
    baseComment.replies = this.children.map(reply =>
      typeof reply.toAPIJSON === 'function' ? reply.toAPIJSON(userId) : reply,
    )
  } else if (this.replies && Array.isArray(this.replies)) {
    baseComment.replies = this.replies.map(reply =>
      typeof reply.toAPIJSON === 'function' ? reply.toAPIJSON(userId) : reply,
    )
  }

  return baseComment
}

// Pre-save middleware to update timestamps and handle content
commentSchema.pre('save', function (next) {
  if (this.isModified('content') && !this.isNew) {
    this.edited = true
  }
  next()
})

module.exports = mongoose.model('Comment', commentSchema)
