const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { isEmail } = require('validator')

const userSchema = new mongoose.Schema(
  {
    // Existing auth fields
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxLength: [50, 'First name must be no more than 50 characters long'],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxLength: [50, 'Last name must be no more than 50 characters long'],
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minLength: [3, 'Username must be at least 3 characters long'],
      maxLength: [30, 'Username must be no more than 30 characters long'],
      validate: {
        validator: function (val) {
          return !/\s/.test(val) // No spaces allowed
        },
        message: 'Username must contain no spaces',
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate: [isEmail, 'Must be a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, 'Password must be at least 6 characters long'],
    },

    // UniCollab Social Media Fields
    bio: {
      type: String,
      default: '',
      maxLength: [250, 'Bio must be at most 250 characters long'],
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followerCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },

    // UniCollab specific preferences
    university: {
      type: String,
      default: '',
      trim: true,
    },
    major: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: String,
      default: '',
      trim: true,
    },

    // Account type to distinguish between innoVIT and UniCollab usage
    accountType: {
      type: String,
      enum: ['innovit', 'unicollab', 'both'],
      default: 'both',
    },

    // Additional fields from social media app
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // New fields for enhanced functionality
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    // For email preferences
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    // Privacy settings
    isPrivate: {
      type: Boolean,
      default: false,
    },
    // For analytics
    postCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
userSchema.index({ username: 1 })
userSchema.index({ email: 1 })
userSchema.index({ firstName: 1, lastName: 1 })
userSchema.index({ university: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ followerCount: -1 })
userSchema.index({ createdAt: -1 })

// Existing password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Pre-save middleware for username and bio validation
userSchema.pre('save', function (next) {
  // You can add profanity filtering here if needed
  // if (filter.isProfane(this.username)) {
  //   throw new Error("Username cannot contain profanity")
  // }

  // if (this.bio.length > 0) {
  //   this.bio = filter.clean(this.bio)
  // }

  // Update lastActive timestamp
  this.lastActive = new Date()

  next()
})

// Existing password comparison method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// New method to get user profile for social features
userSchema.methods.getProfile = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username,
    email: this.email,
    bio: this.bio,
    avatar: this.avatar,
    university: this.university,
    major: this.major,
    year: this.year,
    followerCount: this.followerCount,
    followingCount: this.followingCount,
    postCount: this.postCount,
    commentCount: this.commentCount,
    likeCount: this.likeCount,
    isVerified: this.isVerified,
    isPrivate: this.isPrivate,
    accountType: this.accountType,
    createdAt: this.createdAt,
    lastActive: this.lastActive,
  }
}

// Method to get public profile (for non-followers if account is private)
userSchema.methods.getPublicProfile = function () {
  const profile = this.getProfile()
  if (this.isPrivate) {
    // Hide sensitive information for private accounts
    delete profile.email
    delete profile.lastActive
    delete profile.isPrivate
  }
  return profile
}

// Method to update user activity
userSchema.methods.updateActivity = function () {
  this.lastActive = new Date()
  return this.save()
}

// Method to increment post count
userSchema.methods.incrementPostCount = function () {
  this.postCount += 1
  return this.save()
}

// Method to decrement post count
userSchema.methods.decrementPostCount = function () {
  this.postCount = Math.max(0, this.postCount - 1)
  return this.save()
}

// Method to increment comment count
userSchema.methods.incrementCommentCount = function () {
  this.commentCount += 1
  return this.save()
}

// Method to decrement comment count
userSchema.methods.decrementCommentCount = function () {
  this.commentCount = Math.max(0, this.commentCount - 1)
  return this.save()
}

// Method to increment like count
userSchema.methods.incrementLikeCount = function () {
  this.likeCount += 1
  return this.save()
}

// Method to decrement like count
userSchema.methods.decrementLikeCount = function () {
  this.likeCount = Math.max(0, this.likeCount - 1)
  return this.save()
}

// Static method to search users
userSchema.statics.search = function (query, limit = 20) {
  const searchRegex = new RegExp(query, 'i')

  return this.find({
    $or: [
      { username: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { university: searchRegex },
      { major: searchRegex },
    ],
    isActive: true,
  })
    .select(
      'username firstName lastName avatar bio university major year followerCount postCount',
    )
    .limit(limit)
}

// Static method to get popular users
userSchema.statics.getPopular = function (limit = 10) {
  return this.find({
    isActive: true,
  })
    .select(
      'username firstName lastName avatar bio university major year followerCount postCount',
    )
    .sort({ followerCount: -1, postCount: -1 })
    .limit(limit)
}

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for display name (username with @)
userSchema.virtual('displayName').get(function () {
  return `@${this.username}`
})

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password
    delete ret.__v
    return ret
  },
})
userSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('User', userSchema)

// <----- Completely fine code ------->
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     required: true,
//   },
//   username: {
//     type: String,
//     unique: true,
//     required: true,
//   },
//   email: {
//     type: String,
//     unique: true,
//     required: true,
//     lowercase: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// }, {
//   timestamps: true,
// });

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// module.exports = mongoose.model("User", userSchema);
