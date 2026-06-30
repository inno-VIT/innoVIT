import React, { useEffect, useState } from 'react'
import { getUserComments } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext'
import Loading from './Loading'
import Comment from './Comments' // Your enhanced Comment component

const CommentBrowser = ({ profileUser }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('-createdAt')
  const { user } = useAuth()

  const sorts = {
    '-createdAt': 'Latest',
    createdAt: 'Earliest',
    '-likeCount': 'Most Liked',
  }

  const fetchComments = async () => {
    if (!profileUser?._id) return

    setLoading(true)
    try {
      const data = await getUserComments({
        id: profileUser._id,
        query: { sortBy },
      })
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [profileUser, sortBy])

  const handleSortChange = e => {
    const newSortBy = e.target.value
    setSortBy(newSortBy)
  }

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className='space-y-4'>
      {/* Sort Controls */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Comments
          </h3>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className='border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
          >
            {Object.entries(sorts).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className='text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='text-gray-500 dark:text-gray-400 text-lg mb-2'>
            No comments yet
          </div>
          <p className='text-gray-400 dark:text-gray-500'>
            {profileUser._id === user?._id
              ? "You haven't posted any comments yet."
              : "This user hasn't posted any comments yet."}
          </p>
        </div>
      ) : (
        <>
          <div className='space-y-4'>
            {comments.map(comment => (
              <div
                key={comment._id}
                className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'
              >
                {/* Comment Header with Post Info */}
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h4 className='font-semibold text-gray-900 dark:text-white'>
                      On: {comment.post?.title || 'Post'}
                    </h4>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {comment.edited && (
                        <span className='text-xs text-gray-400 ml-2'>
                          (edited)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className='flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400'>
                    <span>👍 {comment.likeCount || 0}</span>
                    <span>💬 {comment.replyCount || 0}</span>
                  </div>
                </div>

                {/* Comment Content */}
                <div className='prose prose-sm dark:prose-invert max-w-none mb-3'>
                  {comment.content}
                </div>

                {/* View Post Button */}
                {comment.post && (
                  <div className='flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600'>
                    <button
                      onClick={() =>
                        (window.location.href = `/unicollab/posts/${comment.post._id}`)
                      }
                      className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium'
                    >
                      View Post →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Back to Top */}
          {comments.length > 3 && (
            <div className='text-center py-6'>
              <p className='text-gray-500 dark:text-gray-400 mb-3'>
                {comments.length} comments displayed
              </p>
              <button
                onClick={handleBackToTop}
                className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium'
              >
                Back to top
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CommentBrowser
