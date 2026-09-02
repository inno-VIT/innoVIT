import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Flame, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { getPosts } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext'
import Loading from '../components/shared/Loading'
import PostCard from '../components/feed/PostCard'

const TopPosts = () => {
  const { token, isAuthenticated } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async (refresh = false) => {
    try {
      setError(null)

      if (refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const query = {
        sortBy: '-likeCount',
      }

      const response = await getPosts(
        isAuthenticated ? token : null,
        query,
      )

      let fetchedPosts = []

      if (Array.isArray(response)) {
        fetchedPosts = response
      } else if (Array.isArray(response?.data)) {
        fetchedPosts = response.data
      } else if (Array.isArray(response?.posts)) {
        fetchedPosts = response.posts
      }

      setPosts(fetchedPosts.slice(0, 3))
    } catch (err) {
      console.error('Error fetching top posts:', err)
      setPosts([])
      setError('Unable to load top posts.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, isAuthenticated])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-slate-800 bg-[#10141d]"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-500/20 p-2">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Trending Posts
            </h2>

            <p className="text-xs text-slate-400">
              Most liked posts today
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchPosts(true)}
          disabled={refreshing}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-5 w-5 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="py-10">
            <Loading />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={() => fetchPosts(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-8 text-center">
            <Flame className="mx-auto mb-3 h-10 w-10 text-slate-500" />

            <h3 className="font-medium text-white">
              No trending posts
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Check back later when the community becomes active.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.05,
                  }}
                >
                  <PostCard
                    preview="secondary"
                    post={post}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        <Link
          to="/unicollab/explore"
          className="mt-5 flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
        >
          View More Posts
        </Link>
      </div>
    </motion.div>
  )
}

export default TopPosts

