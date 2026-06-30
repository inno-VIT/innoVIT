const Comment = require('../models/Comment')
const Post = require('../models/Posts')
const User = require('../models/Users')

const createComment = async (req, res) => {
  try {
    const postId = req.params.id
    const { content, parentId } = req.body
    const userId = req.user.id

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comment = await Comment.create({
      content: content.trim(),
      parent: parentId || null,
      post: postId,
      commenter: userId,
    })

    // Update post comment count and user comment count
    post.commentCount = (post.commentCount || 0) + 1
    await post.save()

    await User.findByIdAndUpdate(userId, {
      $inc: { commentCount: 1 },
    })

    // Populate commenter details
    await Comment.populate(comment, {
      path: 'commenter',
      select: 'username firstName lastName avatar bio',
    })

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment.toAPIJSON(userId),
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

const createReply = async (req, res) => {
  try {
    const parentCommentId = req.params.id
    const { content } = req.body
    const userId = req.user.id

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required',
      })
    }

    const parentComment = await Comment.findById(parentCommentId)
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found',
      })
    }

    const reply = await Comment.create({
      content: content.trim(),
      parent: parentCommentId,
      post: parentComment.post,
      commenter: userId,
    })

    // Update post comment count and user comment count
    await Post.findByIdAndUpdate(parentComment.post, {
      $inc: { commentCount: 1 },
    })

    await User.findByIdAndUpdate(userId, {
      $inc: { commentCount: 1 },
    })

    // Populate reply details
    await Comment.populate(reply, {
      path: 'commenter',
      select: 'username firstName lastName avatar bio',
    })

    return res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      data: reply.toAPIJSON(userId),
    })
  } catch (err) {
    console.error('Create reply error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    })
  }
}

const getPostComments = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user?.id
    const { page = 1, limit = 50 } = req.query

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required',
      })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comments = await Comment.getByPost(postId, page, limit)
    const total = await Comment.getCountByPost(postId)

    // Format comments for API response
    const formattedComments = comments.map(comment => comment.toAPIJSON(userId))

    return res.json({
      success: true,
      data: formattedComments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get post comments error:', err)
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

    const formattedComments = comments.map(comment => comment.toAPIJSON())

    return res.json({
      success: true,
      data: formattedComments,
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

const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id
    const { content } = req.body
    const userId = req.user.id

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
    if (comment.commenter.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment',
      })
    }

    await comment.edit(content.trim(), userId)

    await Comment.populate(comment, {
      path: 'commenter',
      select: 'username firstName lastName avatar bio',
    })

    return res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment.toAPIJSON(userId),
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

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id
    const userId = req.user.id

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    // Check authorization
    if (comment.commenter.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      })
    }

    await comment.softDelete(userId)

    // Update post and user comment counts
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -1 },
    })

    await User.findByIdAndUpdate(comment.commenter, {
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

const likeComment = async (req, res) => {
  try {
    const commentId = req.params.id
    const userId = req.user.id

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    await comment.like(userId)

    return res.json({
      success: true,
      message: 'Comment liked successfully',
      data: comment.toAPIJSON(userId),
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

const unlikeComment = async (req, res) => {
  try {
    const commentId = req.params.id
    const userId = req.user.id

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    await comment.unlike(userId)

    return res.json({
      success: true,
      message: 'Comment unliked successfully',
      data: comment.toAPIJSON(userId),
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
  createComment,
  createReply,
  getPostComments,
  getUserComments,
  //   getComment,
  //   getCommentReplies,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
}
