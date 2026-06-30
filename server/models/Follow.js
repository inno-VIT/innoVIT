const mongoose = require('mongoose')

const followSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional: Add metadata for follow relationships
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    // For tracking follow request status (if you implement private accounts later)
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'accepted', // Default to accepted for public accounts
    },
    followedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure unique follows
followSchema.index({ userId: 1, followingId: 1 }, { unique: true })

// Index for better query performance
followSchema.index({ userId: 1, status: 1 })
followSchema.index({ followingId: 1, status: 1 })
followSchema.index({ followedAt: -1 })

// Static method to check if user is following another user
followSchema.statics.isFollowing = async function (userId, followingId) {
  if (userId.toString() === followingId.toString()) {
    return false // Users can't follow themselves
  }

  const follow = await this.findOne({
    userId: userId,
    followingId: followingId,
    status: 'accepted',
  })

  return !!follow
}

// Static method to get followers count for a user
followSchema.statics.getFollowerCount = function (userId) {
  return this.countDocuments({
    followingId: userId,
    status: 'accepted',
  })
}

// Static method to get following count for a user
followSchema.statics.getFollowingCount = function (userId) {
  return this.countDocuments({
    userId: userId,
    status: 'accepted',
  })
}

// Static method to get followers with pagination
followSchema.statics.getFollowers = function (userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit

  return this.find({
    followingId: userId,
    status: 'accepted',
  })
    .populate(
      'userId',
      'username firstName lastName avatar bio university major year',
    )
    .sort({ followedAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get following users with pagination
followSchema.statics.getFollowing = function (userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit

  return this.find({
    userId: userId,
    status: 'accepted',
  })
    .populate(
      'followingId',
      'username firstName lastName avatar bio university major year',
    )
    .sort({ followedAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Static method to get mutual follows (users who follow each other)
followSchema.statics.getMutualFollows = async function (userId, targetUserId) {
  const [userFollowing, targetFollowing] = await Promise.all([
    this.find({ userId: userId, status: 'accepted' }).select('followingId'),
    this.find({ userId: targetUserId, status: 'accepted' }).select(
      'followingId',
    ),
  ])

  const userFollowingIds = new Set(
    userFollowing.map(f => f.followingId.toString()),
  )
  const targetFollowingIds = new Set(
    targetFollowing.map(f => f.followingId.toString()),
  )

  const mutualIds = [...userFollowingIds].filter(id =>
    targetFollowingIds.has(id),
  )

  // Return populated mutual users
  const User = mongoose.model('User')
  return User.find({ _id: { $in: mutualIds } }).select(
    'username firstName lastName avatar bio',
  )
}

// Static method to get follow suggestions based on mutual connections
followSchema.statics.getSuggestions = async function (userId, limit = 10) {
  // Get users that the current user follows
  const userFollowing = await this.find({
    userId: userId,
    status: 'accepted',
  }).select('followingId')
  const userFollowingIds = userFollowing.map(f => f.followingId.toString())

  // Get users followed by people the current user follows (friends of friends)
  const friendsOfFriends = await this.find({
    userId: { $in: userFollowingIds },
    followingId: { $ne: userId, $nin: userFollowingIds }, // Exclude self and already followed
    status: 'accepted',
  })
    .populate(
      'followingId',
      'username firstName lastName avatar bio university major year followerCount',
    )
    .limit(limit * 2) // Get more than needed for sorting

  // Count occurrences and sort by popularity
  const suggestionCounts = {}
  friendsOfFriends.forEach(follow => {
    const userId = follow.followingId._id.toString()
    suggestionCounts[userId] = (suggestionCounts[userId] || 0) + 1
  })

  // Sort by count and follower count, then take top suggestions
  const sortedSuggestions = friendsOfFriends
    .filter(
      (follow, index, self) =>
        index ===
        self.findIndex(
          f =>
            f.followingId._id.toString() === follow.followingId._id.toString(),
        ),
    )
    .sort((a, b) => {
      const countA = suggestionCounts[a.followingId._id.toString()] || 0
      const countB = suggestionCounts[b.followingId._id.toString()] || 0

      if (countB !== countA) return countB - countA
      return (
        (b.followingId.followerCount || 0) - (a.followingId.followerCount || 0)
      )
    })
    .slice(0, limit)
    .map(follow => follow.followingId)

  return sortedSuggestions
}

// Instance method to format follow for API response
followSchema.methods.toAPIJSON = function (currentUserId = null) {
  const baseFollow = {
    _id: this._id,
    userId: this.userId,
    followingId: this.followingId,
    status: this.status,
    notificationEnabled: this.notificationEnabled,
    followedAt: this.followedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }

  // Add mutual follow status if current user is provided
  if (currentUserId) {
    const Follow = mongoose.model('Follow')
    baseFollow.isMutual = Follow.isFollowing(
      this.followingId._id || this.followingId,
      currentUserId,
    )
  }

  return baseFollow
}

// Pre-save middleware to prevent self-follow and update timestamps
followSchema.pre('save', function (next) {
  if (
    this.userId &&
    this.followingId &&
    this.userId.toString() === this.followingId.toString()
  ) {
    return next(new Error('Users cannot follow themselves'))
  }

  if (this.isNew) {
    this.followedAt = new Date()
  }

  next()
})

// Post-save middleware to update user follower/following counts
followSchema.post('save', async function (doc, next) {
  try {
    const User = mongoose.model('User')

    if (doc.status === 'accepted') {
      // Update follower count for the user being followed
      await User.findByIdAndUpdate(doc.followingId, {
        $inc: { followerCount: 1 },
      })

      // Update following count for the user who is following
      await User.findByIdAndUpdate(doc.userId, {
        $inc: { followingCount: 1 },
      })
    }
  } catch (error) {
    console.error('Error updating user counts after follow:', error)
  }
  next()
})

// Post-remove middleware to update user follower/following counts
followSchema.post('findOneAndDelete', async function (doc, next) {
  if (doc && doc.status === 'accepted') {
    try {
      const User = mongoose.model('User')

      // Decrement follower count for the user being unfollowed
      await User.findByIdAndUpdate(doc.followingId, {
        $inc: { followerCount: -1 },
      })

      // Decrement following count for the user who unfollowed
      await User.findByIdAndUpdate(doc.userId, {
        $inc: { followingCount: -1 },
      })
    } catch (error) {
      console.error('Error updating user counts after unfollow:', error)
    }
  }
  next()
})

module.exports = mongoose.model('Follow', followSchema)
