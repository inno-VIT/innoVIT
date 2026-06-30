import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deletePost, likePost, unlikePost, updatePost } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext'
import ContentDetails from './ContentDetails'
import LikeBox from './LikeBox'
import Markdown from './Markdown'
import ContentUpdateEditor from './ContentUpdateEditor'
import UserLikePreview from './UserLikePreview'
import { MessageCircle, Edit, Trash2, CheckCircle, X } from 'lucide-react'
import '../../unicollab/postCard.css' // Import the CSS file

const PostCard = ({
  post: initialPost,
  onRemove,
  preview = false,
  className = '',
}) => {
  const [post, setPost] = useState(initialPost)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [userLiked, setUserLiked] = useState(post.userLiked || false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const isAuthor = user && user._id === post.author?._id
  const isAdmin = user?.isAdmin

  const handleDeletePost = async e => {
    e.stopPropagation()

    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setLoading(true)
    try {
      await deletePost(post._id, user)
      if (onRemove) {
        onRemove(post)
      } else {
        navigate('/unicollab')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  const handleEditPost = e => {
    e.stopPropagation()
    setEditing(!editing)
  }

  const handleSubmit = async (e, content) => {
    e.preventDefault()

    try {
      const updatedPost = await updatePost(post._id, user, { content })
      setPost({ ...post, content: updatedPost.content, edited: true })
      setEditing(false)
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const handleLike = async liked => {
    try {
      if (liked) {
        setLikeCount(prev => prev + 1)
        setUserLiked(true)
        await likePost(post._id, user)
      } else {
        setLikeCount(prev => prev - 1)
        setUserLiked(false)
        await unlikePost(post._id, user)
      }
    } catch (error) {
      console.error('Error liking post:', error)
      // Revert the like count on error
      setLikeCount(post.likeCount || 0)
      setUserLiked(post.userLiked || false)
    }
  }

  const handlePostClick = () => {
    if (preview) {
      navigate(`/unicollab/post/${post._id}`)
    }
  }

  const getMaxHeight = () => {
    if (preview === 'primary') return 'max-h-60'
    if (preview === 'secondary') return 'max-h-32'
    return ''
  }

  const handleCommentClick = e => {
    e.stopPropagation()
    navigate(`/unicollab/post/${post._id}`)
  }

  const getPostCardClass = () => {
    if (preview === 'primary') return 'post-card post-card-primary'
    if (preview === 'secondary') return 'post-card post-card-secondary'
    return 'post-card'
  }

  const getContentClass = () => {
    if (preview === 'primary') return 'content'
    if (preview === 'secondary') return 'title'
    return ''
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md relative ${getPostCardClass()} ${className} ${
        preview ? 'cursor-pointer' : ''
      }`}
      onClick={handlePostClick}
    >
      <div className='flex'>
        {/* Like Box Sidebar */}
        <div className='w-12 bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-3'>
          <LikeBox
            likeCount={likeCount}
            liked={userLiked}
            onLike={handleLike}
            size='sm'
          />
        </div>

        {/* Main Content */}
        <div className='flex-1 p-4 min-w-0'>
          {/* Header */}
          <div className='flex items-start justify-between mb-3'>
            <ContentDetails
              user={post.author}
              createdAt={post.createdAt}
              edited={post.edited}
              preview={preview === 'secondary'}
            />

            {/* Action Buttons */}
            {user && (isAuthor || isAdmin) && preview !== 'secondary' && (
              <div className='flex items-center gap-1'>
                <button
                  onClick={handleEditPost}
                  disabled={loading}
                  className='p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
                  title={editing ? 'Cancel edit' : 'Edit post'}
                >
                  {editing ? (
                    <X className='h-4 w-4' />
                  ) : (
                    <Edit className='h-4 w-4' />
                  )}
                </button>
                <button
                  onClick={handleDeletePost}
                  disabled={loading}
                  className={`p-2 transition-colors rounded-full disabled:opacity-50 ${
                    confirmDelete
                      ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={confirmDelete ? 'Confirm delete' : 'Delete post'}
                >
                  {confirmDelete ? (
                    <CheckCircle className='h-4 w-4' />
                  ) : (
                    <Trash2 className='h-4 w-4' />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Title with gradient mask for secondary preview */}
          {post.title && (
            <h3
              className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 ${getContentClass()}`}
            >
              {post.title}
            </h3>
          )}

          {/* Content with gradient mask for primary preview */}
          {preview !== 'secondary' && (
            <div className={`overflow-hidden ${getMaxHeight()}`}>
              {editing ? (
                <ContentUpdateEditor
                  originalContent={post.content}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditing(false)}
                  placeholder='Edit your post content...'
                />
              ) : (
                <div
                  className={`prose prose-sm dark:prose-invert max-w-none ${getContentClass()}`}
                >
                  <Markdown content={post.content} />
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
            <button
              onClick={handleCommentClick}
              className='flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors'
            >
              <MessageCircle className='h-4 w-4' />
              <span>{post.commentCount || 0} comments</span>
            </button>

            <div className='flex items-center gap-3'>
              <UserLikePreview
                postId={post._id}
                userLikePreview={post.likes?.slice(0, 3)} // Pass first 3 likes for preview
              />
              {likeCount > 0 && (
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  {likeCount} like{likeCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {confirmDelete && (
        <div
          className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-10'
          onClick={e => e.stopPropagation()}
        >
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg text-center max-w-xs mx-4'>
            <Trash2 className='h-8 w-8 text-red-500 mx-auto mb-3' />
            <p className='text-sm font-medium mb-3 text-gray-900 dark:text-white'>
              Delete this post?
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mb-4'>
              This action cannot be undone.
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setConfirmDelete(false)}
                className='flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={loading}
                className='flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors'
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostCard
