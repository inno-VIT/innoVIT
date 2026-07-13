const mongoose = require('mongoose')
const Post = require('../models/Posts')
const User = require('../models/Users')
const Comment = require('../models/Comment')
const PostLike = require('../models/PostLike')

const createPost = async (req, res) => {
  try {
    const { title, content, tags, isAnonymous, type } = req.body
    const userId = req.userId

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Post content is required',
      })
    }
    

    const post = await Post.create({
      title: title?.trim() || '',
      content: content.trim(),
      author: userId,
      tags: tags || [],
      isAnonymous: isAnonymous || false,
      type: type || 'discussion',
    })

    // Update user's post count
    await User.findByIdAndUpdate(userId, {
      $inc: { postCount: 1 },
    })

    const populatedPost = await Post.findById(post._id).populate({
      path: 'author',
      select: 'username firstName lastName avatar email',
    })

const postData = populatedPost.toAPIJSON(userId)

// Resolve async value before sending response
postData.userLiked = await populatedPost.isLikedBy(userId)

return res.status(201).json({
  success: true,
  message: 'Post created successfully',
  data: postData,
})
} catch (err) {
  console.error('========== CREATE POST ERROR ==========')
  console.error(err)
  console.error(err.stack)

  return res.status(500).json({
    success: false,
    message: err.message,
  })
}
}

//     const populatedPost = await Post.findById(post._id)
//     .populate({
//       path: 'author',
//       select: 'username firstName lastName avatar email',
//     })
//     .populate({
//       path: 'likes',
//       select: 'username firstName lastName avatar',
//     })
//     .populate({
//       path: 'comments',
//     })

//     // // Populate author info
//     // await Post.populate(post, {
//     //   path: 'author',
//     //   select: 'username firstName lastName avatar email',
//     // })

//     return res.status(201).json({
//       success: true,
//       message: 'Post created successfully',
//       data: populatedPost.toAPIJSON(userId),
//     })
//   } catch (err) {
//     console.error('Create post error:', err)
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: err.message,
//     })
//   }
// }

const getPost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user?.id

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      })
    }

    const post = await Post.findById(postId)
      .populate(
        'author',
        'username firstName lastName avatar email bio university major year',
      )
      .lean()

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    // Increment view count
    await Post.findByIdAndUpdate(postId, {
      $inc: { viewCount: 1 },
    })

    // Check if user liked the post
    if (userId) {
      const PostLike = mongoose.model('PostLike')
      const userLike = await PostLike.findOne({
        postId: postId,
        userId: userId,
      })
      post.userLiked = !!userLike
    }

    return res.json({
      success: true,
      data: post,
    })
  } catch (err) {
    console.error('Get post error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const updatePost = async (req, res) => {
  try {
    const postId = req.params.id
    const { title, content, tags } = req.body
    const userId = req.userId
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Post content is required',
      })
    }

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    // Check authorization
    if (post.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      })
    }

    post.title = title?.trim() || post.title
    post.content = content.trim()
    post.tags = tags || post.tags
    post.edited = true
    post.updatedAt = Date.now()

    await post.save()

    await Post.populate(post, {
      path: 'author',
      select: 'username firstName lastName avatar email',
    })

    return res.json({
      success: true,
      message: 'Post updated successfully',
      data: post.toAPIJSON(userId),
    })
  } catch (err) {
    console.error('Update post error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.userId

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    // Check authorization
    if (post.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      })
    }

    await Post.findByIdAndDelete(postId)

    // Update user's post count
    await User.findByIdAndUpdate(userId, {
      $inc: { postCount: -1 },
    })

    return res.json({
      success: true,
      message: 'Post deleted successfully',
      data: { id: postId },
    })
  } catch (err) {
    console.error('Delete post error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getPosts = async (req, res) => {
  try {
    const currentUserId = req.user?.id
    const {
      page = 1,
      limit = 10,
      sortBy = '-createdAt',
      author,
      search,
      tags,
      type,
    } = req.query

    let query = { isPublished: true }

    // Build search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ]
    }

    if (author) {
      const user = await User.findOne({ username: author })
      if (user) {
        query.author = user._id
      }
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      query.tags = { $in: tagArray }
    }

    if (type) {
      query.type = type
    }

    const posts = await Post.find(query)
      .populate(
        'author',
        'username firstName lastName avatar email bio university major year',
      )
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    const total = await Post.countDocuments(query)

    // Check if current user liked each post
    if (currentUserId) {
      const postIds = posts.map(post => post._id)
      const PostLike = mongoose.model('PostLike')
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
    console.error('Get posts error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getTrendingPosts = async (req, res) => {
  try {
    const currentUserId = req.user?.id
    const { limit = 10 } = req.query

    const posts = await Post.getTrending(limit)

    // Check if current user liked each post
    if (currentUserId) {
      const postIds = posts.map(post => post._id)
      const PostLike = mongoose.model('PostLike')
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
    })
  } catch (err) {
    console.error('Get trending posts error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getPopularPosts = async (req, res) => {
  try {
    const currentUserId = req.user?.id
    const { limit = 10 } = req.query

    const posts = await Post.getPopular(limit)

    // Check if current user liked each post
    if (currentUserId) {
      const postIds = posts.map(post => post._id)
      const PostLike = mongoose.model('PostLike')
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
    })
  } catch (err) {
    console.error('Get popular posts error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const searchPosts = async (req, res) => {
  try {
    const currentUserId = req.user?.id
    const { q: query, page = 1, limit = 20 } = req.query

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      })
    }

    const posts = await Post.search(query.trim(), page, limit)

    // Check if current user liked each post
    if (currentUserId) {
      const postIds = posts.map(post => post._id)
      const PostLike = mongoose.model('PostLike')
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

    const total = await Post.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
      isPublished: true,
    })

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
    console.error('Search posts error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getPostsByTag = async (req, res) => {
  try {
    const currentUserId = req.user?.id
    const { tag } = req.params
    const { page = 1, limit = 20 } = req.query

    const posts = await Post.getByTag(tag, page, limit)

    // Check if current user liked each post
    if (currentUserId) {
      const postIds = posts.map(post => post._id)
      const PostLike = mongoose.model('PostLike')
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

    const total = await Post.countDocuments({
      tags: tag,
      isPublished: true,
    })

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
    console.error('Get posts by tag error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const likePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.userId
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    await post.like(userId)

    // Update user's like count
    await User.findByIdAndUpdate(userId, {
      $inc: { likeCount: 1 },
    })

    return res.json({
      success: true,
      message: 'Post liked successfully',
      data: { likeCount: post.likeCount },
    })
  } catch (err) {
    console.error('Like post error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const unlikePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.userId

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    await post.unlike(userId)

    // Update user's like count
    await User.findByIdAndUpdate(userId, {
      $inc: { likeCount: -1 },
    })

    return res.json({
      success: true,
      message: 'Post unliked successfully',
      data: { likeCount: post.likeCount },
    })
  } catch (err) {
    console.error('Unlike post error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getUserLikes = async (req, res) => {
  try {
    const postId = req.params.id
    const { anchor, limit = 9 } = req.query

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    let query = { postId: postId }
    if (anchor) {
      query._id = { $gt: anchor }
    }

    const postLikes = await PostLike.find(query)
      .populate('userId', 'username firstName lastName avatar')
      .sort('_id')
      .limit(limit * 1 + 1)
      .lean()

    const hasMorePages = postLikes.length > limit
    if (hasMorePages) {
      postLikes.pop() // Remove the extra one used to check for more pages
    }

    const userLikes = postLikes.map(like => ({
      _id: like._id,
      username: like.userId.username,
      firstName: like.userId.firstName,
      lastName: like.userId.lastName,
      avatar: like.userId.avatar,
    }))

    return res.json({
      success: true,
      data: userLikes,
      hasMorePages,
    })
  } catch (err) {
    console.error('Get user likes error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getUserLikedPosts = async (req, res) => {
  try {
    const userId = req.params.userId
    const currentUserId = req.user?.id
    const { page = 1, limit = 10 } = req.query

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const postLikes = await PostLike.find({ userId: userId })
      .populate({
        path: 'postId',
        match: { isPublished: true },
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar email',
        },
      })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    const posts = postLikes.map(like => like.postId).filter(Boolean)

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

    const total = await PostLike.countDocuments({ userId: userId })

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
    console.error('Get user liked posts error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const incrementViewCount = async (req, res) => {
  try {
    const postId = req.params.id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    await post.incrementViewCount()

    return res.json({
      success: true,
      message: 'View count incremented',
      data: { viewCount: post.viewCount },
    })
  } catch (err) {
    console.error('Increment view count error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const togglePinPost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.userId
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    // Check authorization
    if (post.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pin this post',
      })
    }

    await post.togglePin()

    return res.json({
      success: true,
      message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { isPinned: post.isPinned },
    })
  } catch (err) {
    console.error('Toggle pin post error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

// ===== COMMENT CONTROLLERS =====

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const postId = req.params.id
    const { page = 1, limit = 50, sortBy = '-createdAt' } = req.query

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comments = await Comment.find({ postId: postId, parentId: null })
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar',
        },
      })
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    const total = await Comment.countDocuments({
      postId: postId,
      parentId: null,
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
    console.error('Get comments error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

// @desc    Create a comment on a post
// @route   POST /api/posts/:id/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const postId = req.params.id
    const { content, parentId } = req.body
    const userId = req.userId
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      })
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const commentData = {
      content: content.trim(),
      author: userId,
      postId: postId,
    }

    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
      const parentComment = await Comment.findById(parentId)
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        })
      }
      commentData.parentId = parentId
    }

    const comment = await Comment.create(commentData)

    // Update post comment count
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    })

    // Update user's comment count
    await User.findByIdAndUpdate(userId, {
      $inc: { commentCount: 1 },
    })

    // Populate author info
    await Comment.populate(comment, {
      path: 'author',
      select: 'username firstName lastName avatar',
    })

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    })
  } catch (err) {
    console.error('Create comment error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

// @desc    Update a comment
// @route   PATCH /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id
    const { content } = req.body
    const userId = req.userId

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      })
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    // Check authorization
    if (comment.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment',
      })
    }

    comment.content = content.trim()
    comment.edited = true
    comment.updatedAt = Date.now()

    await comment.save()

    await Comment.populate(comment, {
      path: 'author',
      select: 'username firstName lastName avatar',
    })

    return res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    })
  } catch (err) {
    console.error('Update comment error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id
    const userId = req.userId

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    // Check authorization
    if (comment.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      })
    }

    await Comment.findByIdAndDelete(commentId)

    // Update post comment count
    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentCount: -1 },
    })

    // Update user's comment count
    await User.findByIdAndUpdate(userId, {
      $inc: { commentCount: -1 },
    })

    return res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: { id: commentId },
    })
  } catch (err) {
    console.error('Delete comment error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const commentId = req.params.id
    const userId = req.userId

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    // Check if already liked
    const alreadyLiked = comment.likes.includes(userId)
    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'Comment already liked',
      })
    }

    comment.likes.push(userId)
    comment.likeCount = comment.likes.length
    await comment.save()

    return res.json({
      success: true,
      message: 'Comment liked successfully',
      data: { likeCount: comment.likeCount },
    })
  } catch (err) {
    console.error('Like comment error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

// @desc    Unlike a comment
// @route   DELETE /api/comments/:id/like
// @access  Private
const unlikeComment = async (req, res) => {
  try {
    const commentId = req.params.id
    const userId = req.userId

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    // Remove like
    comment.likes = comment.likes.filter(id => id.toString() !== userId)
    comment.likeCount = comment.likes.length
    await comment.save()

    return res.json({
      success: true,
      message: 'Comment unliked successfully',
      data: { likeCount: comment.likeCount },
    })
  } catch (err) {
    console.error('Unlike comment error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

module.exports = {
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getUserLikedPosts,
  getUserLikes,
  getTrendingPosts,
  getPopularPosts,
  searchPosts,
  getPostsByTag,
  incrementViewCount,
  togglePinPost,
  // Comment controllers
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
}
