import React, { useEffect, useState } from 'react'
import { getPosts } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext'
import Loading from './Loading'
import PostCard from './PostCard'
import HorizontalStack from '../../ui/HorizontalStack'

const TopPosts = () => {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState(null)
  const { user, token, isAuthenticated } = useAuth()

  const fetchPosts = async () => {
    try {
      const query = { sortBy: '-likeCount' }

      // Use the token from AuthContext if user is authenticated
      const userToken = isAuthenticated ? token : null
      const data = await getPosts(userToken, query)

      const topPosts = []

      if (data && data.data) {
        for (let i = 0; i < 3 && i < data.data.length; i++) {
          topPosts.push(data.data[i])
        }
      }

      setPosts(topPosts)
    } catch (error) {
      console.error('Error fetching top posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [isAuthenticated]) // Re-fetch when authentication status changes

  return (
    <div className='space-y-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4'>
        <HorizontalStack spacing={2}>
          <span className='text-xl'>🏆</span>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
            Top Posts
          </h3>
        </HorizontalStack>
      </div>

      {!loading ? (
        posts && posts.length > 0 ? (
          posts.map(post => (
            <PostCard preview='secondary' post={post} key={post._id} />
          ))
        ) : (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            No top posts found
          </div>
        )
      ) : (
        <Loading />
      )}
    </div>
  )
}

export default TopPosts
