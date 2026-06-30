import React, { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { getPosts, getUserLikedPosts } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext'
import CreatePost from '../../post/CreatePost'
import Loading from './Loading'
import PostCard from './PostCard'
import SortBySelect from './SortBySelect'
import { ArrowUp, RefreshCw } from 'lucide-react'

const PostBrowser = ({
  createPost = false,
  contentType = 'posts',
  profileUser = null,
  className = '',
}) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState('-createdAt')
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  const [searchParams] = useSearchParams()
  const location = useLocation()
  const searchQuery = searchParams.get('search') || searchParams.get('query')

  const contentTypeSorts = {
    posts: {
      '-createdAt': 'Latest',
      '-likeCount': 'Most Liked',
      '-commentCount': 'Most Comments',
      createdAt: 'Earliest',
    },
    liked: {
      '-createdAt': 'Latest',
      createdAt: 'Earliest',
    },
  }

  const fetchPosts = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    const query = {
      page: isLoadMore ? page + 1 : 1,
      sortBy,
      limit: 10,
    }

    // Add filters based on props
    if (profileUser) query.author = profileUser._id
    if (searchQuery) query.search = searchQuery

    try {
      let data
      if (contentType === 'posts') {
        data = await getPosts(user?.token, query)
      } else if (contentType === 'liked') {
        data = await getUserLikedPosts(profileUser?._id, user?.token, query)
      }

      if (!data.error) {
        if (isLoadMore) {
          setPosts(prev => [...prev, ...data.posts])
          setPage(prev => prev + 1)
        } else {
          setPosts(data.posts || [])
          setPage(1)
        }

        setCount(data.total || data.posts?.length || 0)
        setHasMore(data.posts?.length === 10) // If we got 10 posts, there might be more
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPosts(false)
  }, [sortBy, contentType, profileUser, user])

  // Refetch when search changes
  useEffect(() => {
    if (location.pathname === '/unicollab/search' || searchQuery) {
      fetchPosts(false)
    }
  }, [searchQuery, location.pathname])

  const handleSortChange = newSortBy => {
    setSortBy(newSortBy)
  }

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchPosts(true)
    }
  }

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleRefresh = () => {
    fetchPosts(false)
  }

  const removePost = removedPost => {
    setPosts(posts.filter(post => post._id !== removedPost._id))
  }

  const sorts = contentTypeSorts[contentType] || contentTypeSorts.posts

  if (loading) {
    return (
      <div className={className}>
        <Loading />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex items-center gap-4'>
            {createPost && <CreatePost />}

            {/* Search results info */}
            {searchQuery && (
              <div className='hidden sm:block'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Results for "{searchQuery}"
                </h2>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {count} {count === 1 ? 'post' : 'posts'} found
                </p>
              </div>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className='p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors'
              title='Refresh'
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
            <SortBySelect
              sortBy={sortBy}
              onSortChange={handleSortChange}
              sorts={sorts}
            />
          </div>
        </div>

        {/* Mobile search results */}
        {searchQuery && (
          <div className='sm:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Results for "{searchQuery}"
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {count} {count === 1 ? 'post' : 'posts'} found
            </p>
          </div>
        )}
      </div>

      {/* Posts list */}
      <div className='space-y-4'>
        {posts.length === 0 ? (
          <div className='text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
            <div className='text-gray-500 dark:text-gray-400 text-lg mb-2'>
              {searchQuery ? 'No posts found' : 'No posts yet'}
            </div>
            <p className='text-gray-400 dark:text-gray-500'>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Be the first to share something!'}
            </p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onRemove={removePost} />
            ))}

            {/* Load more section */}
            {hasMore && (
              <div className='text-center py-6'>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {loadingMore ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}

            {/* End of results */}
            {!hasMore && posts.length > 0 && (
              <div className='text-center py-8'>
                <div className='text-gray-500 dark:text-gray-400 text-lg mb-2'>
                  {posts.length === 1 ? '1 post' : `${posts.length} posts`}{' '}
                  displayed
                </div>
                <p className='text-gray-400 dark:text-gray-500 mb-4'>
                  You've reached the end
                </p>
                <button
                  onClick={handleBackToTop}
                  className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium'
                >
                  <ArrowUp className='h-4 w-4' />
                  Back to top
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PostBrowser
