const User = require('../models/Users')
const Post = require('../models/Posts')
const Follow = require('../models/Follow')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const getUserDict = (token, user) => {
  return {
    token,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    id: user._id,
    userId: user._id,
    bio: user.bio || '',
    avatar: user.avatar || '',
    university: user.university || '',
    major: user.major || '',
    year: user.year || '',
    followerCount: user.followerCount || 0,
    followingCount: user.followingCount || 0,
    postCount: user.postCount || 0,
    commentCount: user.commentCount || 0,
    likeCount: user.likeCount || 0,
    isVerified: user.isVerified || false,
    isPrivate: user.isPrivate || false,
    accountType: user.accountType || 'both',
    createdAt: user.createdAt,
  }
}

const buildToken = user => {
  return {
    userId: user._id,
    email: user.email,
    username: user.username,
  }
}

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      university,
      major,
      year,
    } = req.body

    if (!(username && email && password && firstName && lastName)) {
      return res.status(400).json({
        success: false,
        message:
          'First name, last name, username, email and password are required',
      })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format (VIT email pattern)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@vitbhopal\.ac\.in$/
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please use your VIT Bhopal email address',
      })
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists',
      })
    }

    // Create user - password will be hashed by the model's pre-save middleware
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: password, // Will be hashed automatically
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      university: university?.trim() || '',
      major: major?.trim() || '',
      year: year?.trim() || '',
      accountType: 'both', // Default to both innoVIT and UniCollab
    })

    const token = jwt.sign(buildToken(user), process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: getUserDict(token, user),
    })
  } catch (err) {
    console.error('Registration error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!(email && password)) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Use the model's comparePassword method
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = jwt.sign(buildToken(user), process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    return res.json({
      success: true,
      message: 'Login successful',
      data: getUserDict(token, user),
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getUser = async (req, res) => {
  try {
    const userId = req.params.id
    const currentUserId = req.user?.userId

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      })
    }

    const user = await User.findById(userId).select('-password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Get user stats
    const postCount = await Post.countDocuments({
      author: user._id,
      isPublished: true,
    })
    const likeCount = await Post.aggregate([
      { $match: { author: user._id, isPublished: true } },
      { $group: { _id: null, totalLikes: { $sum: '$likeCount' } } },
    ])

    const totalLikes = likeCount.length > 0 ? likeCount[0].totalLikes : 0

    // Check if current user is following this user
    let isFollowing = false
    if (currentUserId) {
      const follow = await Follow.findOne({
        userId: currentUserId,
        followingId: user._id,
        status: 'accepted',
      })
      isFollowing = !!follow
    }

    // For private accounts, limit information for non-followers
    if (
      user.isPrivate &&
      currentUserId &&
      !isFollowing &&
      currentUserId !== user._id.toString()
    ) {
      return res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          isPrivate: true,
          followerCount: user.followerCount,
          followingCount: user.followingCount,
          postCount: postCount,
          likeCount: totalLikes,
          isFollowing: false,
          accountType: user.accountType,
        },
      })
    }

    const userProfile = user.getProfile()

    const data = {
      ...userProfile,
      postCount,
      likeCount: totalLikes,
      isFollowing,
    }

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (err) {
    console.error('Get user error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id
    const currentUserId = req.user?.userId
    const { page = 1, limit = 10 } = req.query

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if user is private and current user is not following
    if (
      user.isPrivate &&
      currentUserId &&
      currentUserId !== user._id.toString()
    ) {
      const isFollowing = await Follow.isFollowing(currentUserId, user._id)
      if (!isFollowing) {
        return res.status(403).json({
          success: false,
          message: 'Cannot view posts of private account',
        })
      }
    }

    const posts = await Post.getByUser(userId, page, limit)
    const total = await Post.countDocuments({
      author: userId,
      isPublished: true,
    })

    // Check if current user liked each post
    if (currentUserId) {
      const postIds = posts.map(post => post._id)
      const userLikes = await PostLike.find({
        postId: { $in: postIds },
        userId: currentUserId,
      })

      const likedPostIds = new Set(
        userLikes.map(like => like.postId.toString()),
      )

      posts.forEach(post => {
        post.userLiked = likedPostIds.has(post._id.toString())
      })
    }

    return res.json({
      success: true,
      data: posts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get user posts error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId
    const {
      username,
      firstName,
      lastName,
      bio,
      avatar,
      university,
      major,
      year,
      isPrivate,
    } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId },
      })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken',
        })
      }
      user.username = username.trim()
    }

    if (firstName) user.firstName = firstName.trim()
    if (lastName) user.lastName = lastName.trim()
    if (bio !== undefined) user.bio = bio?.trim() || ''
    if (avatar) user.avatar = avatar
    if (university !== undefined) user.university = university?.trim() || ''
    if (major !== undefined) user.major = major?.trim() || ''
    if (year !== undefined) user.year = year?.trim() || ''
    if (isPrivate !== undefined) user.isPrivate = isPrivate

    user.updatedAt = Date.now()
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getProfile(),
    })
  } catch (err) {
    console.error('Update user error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const follow = async (req, res) => {
  try {
    const userId = req.user.userId
    const followingId = req.params.id

    if (userId === followingId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself',
      })
    }

    const userToFollow = await User.findById(followingId)
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // For private accounts, create pending follow request
    const status = userToFollow.isPrivate ? 'pending' : 'accepted'

    const existingFollow = await Follow.findOne({ userId, followingId })

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: `Already ${
          existingFollow.status === 'pending'
            ? 'requested to follow'
            : 'following'
        } this user`,
      })
    }

    const follow = await Follow.create({ userId, followingId, status })

    if (status === 'accepted') {
      // Update follower/following arrays and counts immediately for public accounts
      await User.findByIdAndUpdate(userId, {
        $addToSet: { following: followingId },
        $inc: { followingCount: 1 },
      })

      await User.findByIdAndUpdate(followingId, {
        $addToSet: { followers: userId },
        $inc: { followerCount: 1 },
      })
    }

    return res.status(200).json({
      success: true,
      message:
        status === 'accepted'
          ? 'User followed successfully'
          : 'Follow request sent',
      data: follow,
    })
  } catch (err) {
    console.error('Follow error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const unfollow = async (req, res) => {
  try {
    const userId = req.user.userId
    const followingId = req.params.id

    const existingFollow = await Follow.findOne({ userId, followingId })

    if (!existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user',
      })
    }

    await Follow.findByIdAndDelete(existingFollow._id)

    // Update follower/following arrays and counts if follow was accepted
    if (existingFollow.status === 'accepted') {
      await User.findByIdAndUpdate(userId, {
        $pull: { following: followingId },
        $inc: { followingCount: -1 },
      })

      await User.findByIdAndUpdate(followingId, {
        $pull: { followers: userId },
        $inc: { followerCount: -1 },
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User unfollowed successfully',
      data: { id: existingFollow._id },
    })
  } catch (err) {
    console.error('Unfollow error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id
    const { page = 1, limit = 20 } = req.query

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const followers = await Follow.getFollowers(userId, page, limit)
    const total = await Follow.getFollowerCount(userId)

    return res.status(200).json({
      success: true,
      data: followers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get followers error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id
    const { page = 1, limit = 20 } = req.query

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const following = await Follow.getFollowing(userId, page, limit)
    const total = await Follow.getFollowingCount(userId)

    return res.status(200).json({
      success: true,
      data: following,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get following error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getRandomUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const currentUserId = req.user?.userId

    const users = await User.aggregate([
      {
        $match: {
          isActive: true,
          _id: {
            $ne: currentUserId
              ? new mongoose.Types.ObjectId(currentUserId)
              : null,
          },
        },
      },
      { $sample: { size: parseInt(limit) } },
      { $project: { password: 0 } },
    ])

    // If user is logged in, check follow status
    if (currentUserId) {
      const userIds = users.map(user => user._id)
      const follows = await Follow.find({
        userId: currentUserId,
        followingId: { $in: userIds },
        status: 'accepted',
      })

      const followMap = new Map()
      follows.forEach(follow => {
        followMap.set(follow.followingId.toString(), true)
      })

      users.forEach(user => {
        user.isFollowing = followMap.has(user._id.toString())
      })
    }

    return res.status(200).json({
      success: true,
      data: users,
    })
  } catch (err) {
    console.error('Get random users error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const searchUsers = async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      })
    }

    const users = await User.search(query.trim(), limit)

    return res.status(200).json({
      success: true,
      data: users,
    })
  } catch (err) {
    console.error('Search users error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getPopularUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const users = await User.getPopular(limit)

    return res.status(200).json({
      success: true,
      data: users,
    })
  } catch (err) {
    console.error('Get popular users error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getMutualFollows = async (req, res) => {
  try {
    const targetUserId = req.params.id
    const currentUserId = req.user.userId

    const mutuals = await Follow.getMutualFollows(currentUserId, targetUserId)

    return res.status(200).json({
      success: true,
      data: mutuals,
    })
  } catch (err) {
    console.error('Get mutual follows error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 10 } = req.query

    const suggestions = await Follow.getSuggestions(userId, limit)

    return res.status(200).json({
      success: true,
      data: suggestions,
    })
  } catch (err) {
    console.error('Get suggestions error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getUserComments = async (req, res) => {
  try {
    const userId = req.params.id
    const { page = 1, limit = 20 } = req.query

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const comments = await Comment.getByUser(userId, page, limit)
    const total = await Comment.countDocuments({
      commenter: userId,
      isDeleted: false,
    })

    return res.json({
      success: true,
      data: comments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get user comments error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

module.exports = {
  register,
  login,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  getUser,
  getRandomUsers,
  updateUser,
  searchUsers,
  getPopularUsers,
  getMutualFollows,
  getSuggestions,
  getUserPosts,
  getUserComments,
}
