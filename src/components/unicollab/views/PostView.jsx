import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
// import Layout from '../layout/Layout'
import Loading from '../components/shared/Loading'
import ErrorAlert from '../components/shared/ErrorAlert'
import { getPost, likePost, unlikePost } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext'
import Comments from '../components/comments/Comments'
import { ThumbsUp, ThumbsDown, MessageCircle, Share } from 'lucide-react'
import { Button } from '../../ui/Button'

const PostView = () => {
  const params = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const { user } = useAuth()

  const fetchPost = async () => {
    setLoading(true)
    try {
      const data = await getPost(params.id, user?.token)
      if (data.error) {
        setError(data.error)
      } else {
        setPost(data)
      }
    } catch (err) {
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id, user])

  const handleLike = async () => {
    if (!user || !post) return

    setIsLiking(true)
    try {
      if (post.userLiked) {
        await unlikePost(post._id, user)
        setPost(prev => ({
          ...prev,
          likeCount: prev.likeCount - 1,
          userLiked: false,
        }))
      } else {
        await likePost(post._id, user)
        setPost(prev => ({
          ...prev,
          likeCount: prev.likeCount + 1,
          userLiked: true,
        }))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + '...',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <>
        <div className='max-w-4xl mx-auto'>
          <Loading />
        </div>
      </>
    )
  }

  return (
    <>
      <div className='max-w-4xl mx-auto'>
        {post ? (
          <div className='space-y-6'>
            {/* Post Content */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
              {/* Author and Date */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold'>
                    {post.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className='font-semibold text-gray-900 dark:text-white'>
                      {post.author?.username || 'Unknown User'}
                    </p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(post.createdAt).toLocaleDateString()} at{' '}
                      {new Date(post.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Title and Content */}
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                {post.title}
              </h1>

              <div className='prose dark:prose-invert max-w-none mb-6'>
                {post.content}
              </div>

              {/* Post Actions */}
              <div className='flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600'>
                <div className='flex items-center space-x-4'>
                  <Button
                    variant={post.userLiked ? 'default' : 'outline'}
                    size='sm'
                    onClick={handleLike}
                    disabled={!user || isLiking}
                    className='flex items-center gap-2'
                  >
                    <ThumbsUp className='h-4 w-4' />
                    {post.likeCount || 0}
                  </Button>

                  <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                    <MessageCircle className='h-4 w-4' />
                    {post.commentCount || 0} comments
                  </div>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleShare}
                  className='flex items-center gap-2'
                >
                  <Share className='h-4 w-4' />
                  Share
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
              <Comments postId={post._id} />
            </div>
          </div>
        ) : (
          error && <ErrorAlert error={error} />
        )}
      </div>
    </>
  )
}

export default PostView
