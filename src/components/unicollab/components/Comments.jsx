import React, { useEffect, useState } from 'react'
import { getComments, createComment } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext'
import Loading from './Loading'
import Comment from './Comments' // Your enhanced Comment component
import CommentEditor from './CommentEditor' // The standalone editor we discussed

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const fetchComments = async () => {
    try {
      setLoading(true)
      const data = await getComments({ id: postId })
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId])

  const handleAddComment = async content => {
    if (!user || !content.trim()) return

    setSubmitting(true)
    try {
      const newComment = await createComment({ content }, { id: postId }, user)

      // Add the new comment to the top
      setComments(prev => [newComment, ...prev])
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = (parentCommentId, replyContent) => {
    // This would handle nested replies
    // For now, we'll add it as a top-level comment
    // You can enhance this for nested replies later
    handleAddComment(replyContent)
  }

  const handleDeleteComment = commentId => {
    setComments(prev => prev.filter(comment => comment._id !== commentId))
  }

  const handleEditComment = (commentId, newContent) => {
    setComments(prev =>
      prev.map(comment =>
        comment._id === commentId
          ? { ...comment, content: newContent, edited: true }
          : comment,
      ),
    )
  }

  if (loading) {
    return <Loading label='Loading comments' />
  }

  return (
    <div className='space-y-6'>
      {/* Comment Editor */}
      {user ? (
        <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Add a Comment
          </h3>
          <CommentEditor
            onSubmit={handleAddComment}
            loading={submitting}
            placeholder='Share your thoughts on this post...'
          />
        </div>
      ) : (
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center'>
          <p className='text-yellow-800 dark:text-yellow-200'>
            Please log in to comment on this post.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className='space-y-4'>
        {comments.length === 0 ? (
          <div className='text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
            <div className='text-gray-500 dark:text-gray-400 text-lg mb-2'>
              No comments yet
            </div>
            <p className='text-gray-400 dark:text-gray-500'>
              {user
                ? 'Be the first to share your thoughts!'
                : 'Log in to be the first to comment!'}
            </p>
          </div>
        ) : (
          <>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Comments ({comments.length})
              </h3>
            </div>

            {comments.map(comment => (
              <Comment
                key={comment._id}
                comment={{
                  id: comment._id,
                  content: comment.content,
                  author: comment.author?.username || 'Unknown',
                  authorId: comment.author?._id,
                  createdAt: comment.createdAt,
                  likes: comment.likeCount || 0,
                  replies: comment.children || [],
                  edited: comment.edited,
                  isAuthor: user && user._id === comment.author?._id,
                }}
                onReply={handleReply}
                onDelete={handleDeleteComment}
                onEdit={handleEditComment}
                depth={0}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Comments
