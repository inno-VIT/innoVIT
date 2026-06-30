import { axiosConfig } from '../../../axiosConfig'

// Get posts with query parameters
const getPosts = async (token, query = {}) => {
  try {
    const headers = token ? { 'x-access-token': token } : {}
    const res = await axiosConfig.get('/api/posts', {
      params: query,
      headers,
    })
    return res.data
  } catch (err) {
    console.error('Error fetching posts:', err)
    throw err
  }
}

// Get single post
const getPost = async (postId, token) => {
  try {
    const headers = token ? { 'x-access-token': token } : {}
    const res = await axiosConfig.get(`/api/posts/${postId}`, {
      headers,
    })
    return res.data
  } catch (err) {
    console.error('Error fetching post:', err)
    throw err
  }
}

// Get user's liked posts
const getUserLikedPosts = async (userId, token, query = {}) => {
  try {
    const headers = token ? { 'x-access-token': token } : {}
    const res = await axiosConfig.get(`/api/posts/liked/${userId}`, {
      params: query,
      headers,
    })
    return res.data
  } catch (err) {
    console.error('Error fetching liked posts:', err)
    throw err
  }
}

// Get users who liked a post (for UserLikeModal)
const getUserLikes = async (postId, anchor = '', limit = 9) => {
  try {
    const res = await axiosConfig.get(`/api/posts/${postId}/likes`, {
      params: { anchor, limit },
    })
    return res.data
  } catch (err) {
    console.error('Error fetching user likes:', err)
    throw err
  }
}

// Create new post
const createPost = async (post, user) => {
  try {
    const res = await axiosConfig.post('/api/posts', post, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.error('Error creating post:', err)
    throw err
  }
}

// Update post
const updatePost = async (postId, user, data) => {
  try {
    const res = await axiosConfig.patch(`/api/posts/${postId}`, data, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.error('Error updating post:', err)
    throw err
  }
}

// Delete post
const deletePost = async (postId, user) => {
  try {
    const res = await axiosConfig.delete(`/api/posts/${postId}`, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.error('Error deleting post:', err)
    throw err
  }
}

// Like a post
const likePost = async (postId, user) => {
  try {
    const res = await axiosConfig.post(
      `/api/posts/${postId}/like`,
      {},
      {
        headers: {
          'x-access-token': user.token,
        },
      },
    )
    return res.data
  } catch (err) {
    console.error('Error liking post:', err)
    throw err
  }
}

// Unlike a post
const unlikePost = async (postId, user) => {
  try {
    const res = await axiosConfig.delete(`/api/posts/${postId}/like`, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.error('Error unliking post:', err)
    throw err
  }
}

// Get post comments - UPDATED
const getComments = async (postId, query = {}) => {
  try {
    const res = await axiosConfig.get(`/api/comments/post/${postId}`, {
      params: query,
    })
    return res.data
  } catch (err) {
    console.error('Error fetching comments:', err)
    throw err
  }
}

// Get user's comments - UPDATED
const getUserComments = async (userId, query = {}) => {
  try {
    const res = await axiosConfig.get(`/api/comments/user/${userId}`, {
      params: query,
    })
    return res.data
  } catch (err) {
    console.error('Error fetching user comments:', err)
    throw err
  }
}

// Create comment - UPDATED
const createComment = async (commentData, user) => {
  try {
    const res = await axiosConfig.post('/api/comments', commentData, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.error('Error creating comment:', err)
    throw err
  }
}

// Update comment
const updateComment = async (commentId, user, data) => {
  try {
    const res = await axiosConfig.patch(`/api/comments/${commentId}`, data, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.error('Error updating comment:', err)
    throw err
  }
}

// Delete comment
const deleteComment = async (commentId, user) => {
  try {
    const res = await axiosConfig.delete(`/api/comments/${commentId}`, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.error('Error deleting comment:', err)
    throw err
  }
}

// Like a comment
const likeComment = async (commentId, user) => {
  try {
    const res = await axiosConfig.post(
      `/api/comments/${commentId}/like`,
      {},
      {
        headers: {
          'x-access-token': user.token,
        },
      },
    )
    return res.data
  } catch (err) {
    console.error('Error liking comment:', err)
    throw err
  }
}

// Unlike a comment
const unlikeComment = async (commentId, user) => {
  try {
    const res = await axiosConfig.delete(`/api/comments/${commentId}/like`, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.error('Error unliking comment:', err)
    throw err
  }
}

// Search posts
const searchPosts = async (query, token) => {
  try {
    const headers = token ? { 'x-access-token': token } : {}
    const res = await axiosConfig.get('/api/posts/search', {
      params: { q: query },
      headers,
    })
    return res.data
  } catch (err) {
    console.error('Error searching posts:', err)
    throw err
  }
}

// Get trending posts
const getTrendingPosts = async (token, limit = 10) => {
  try {
    const headers = token ? { 'x-access-token': token } : {}
    const res = await axiosConfig.get('/api/posts/trending', {
      params: { limit },
      headers,
    })
    return res.data
  } catch (err) {
    console.error('Error fetching trending posts:', err)
    throw err
  }
}

// Get posts by user
const getUserPosts = async (userId, token, query = {}) => {
  try {
    const headers = token ? { 'x-access-token': token } : {}
    const res = await axiosConfig.get(`/api/users/${userId}/posts`, {
      params: query,
      headers,
    })
    return res.data
  } catch (err) {
    console.error('Error fetching user posts:', err)
    throw err
  }
}

// Get posts by tags
const getPostsByTag = async (tag, token, query = {}) => {
  try {
    const headers = token ? { 'x-access-token': token } : {}
    const res = await axiosConfig.get(`/api/posts/tag/${tag}`, {
      params: query,
      headers,
    })
    return res.data
  } catch (err) {
    console.error('Error fetching posts by tag:', err)
    throw err
  }
}

export {
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  likeComment, // Added this export
  unlikeComment, // Added this export
  getUserLikedPosts,
  getUserLikes,
  getComments,
  getUserComments,
  createComment,
  updateComment,
  deleteComment,
  searchPosts,
  getTrendingPosts,
  getUserPosts,
  getPostsByTag,
}
