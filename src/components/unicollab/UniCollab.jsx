import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import axios from 'axios'

import { useAuth } from '../../utils/AuthContext'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

import CreatePost from './components/feed/CreatePost'
import Post from './components/feed/Post'

import {
  Home,
  Flame,
  Clock3,
  Sparkles,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'

const API_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://innovit-backend.onrender.com'

const tabAnimation = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
}

const UniCollab = () => {
  const { user, token, isAuthenticated } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [activeTab, setActiveTab] = useState('relevant')

  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    try {
      setError(null)

      const response = await axios.get(`${API_URL}/api/posts`, {
        params: {
          sortBy: '-createdAt',
        },
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      const fetchedPosts =
        response.data.posts ||
        response.data.data ||
        response.data ||
        []

      setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : [])
    } catch (err) {
      console.error(err)

      setError('Unable to load posts.')

      setPosts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const refreshFeed = async () => {
    setRefreshing(true)
    await fetchPosts()
  }

  const handlePostCreated = post => {
    setPosts(prev => [post, ...prev])
  }

  const handleLike = updatedPost => {
    setPosts(prev =>
      prev.map(post =>
        post._id === updatedPost._id ? updatedPost : post,
      ),
    )
  }

  const handleDelete = postId => {
    setPosts(prev => prev.filter(post => post._id !== postId))
  }

  const relevantPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const scoreA =
        (a.likeCount || 0) * 3 +
        (a.commentCount || 0) * 2 +
        (a.viewCount || 0)

      const scoreB =
        (b.likeCount || 0) * 3 +
        (b.commentCount || 0) * 2 +
        (b.viewCount || 0)

      return scoreB - scoreA
    })
  }, [posts])

  const latestPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt),
    )
  }, [posts])

  const topPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        (b.likeCount || 0) -
        (a.likeCount || 0),
    )
  }, [posts])
    const displayedPosts = useMemo(() => {
    switch (activeTab) {
      case 'latest':
        return latestPosts

      case 'top':
        return topPosts

      default:
        return relevantPosts
    }
  }, [activeTab, relevantPosts, latestPosts, topPosts])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome Card */}

      <Card className="border border-slate-800 bg-[#10141d]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back,
              <span className="text-blue-500">
                {' '}
                {user?.firstName || user?.username}
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Share ideas, ask questions, and collaborate with your university
              community.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={refreshFeed}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />

            Refresh
          </Button>
        </CardHeader>
      </Card>

      {/* Create Post */}

      {isAuthenticated && (
        <CreatePost onPostCreate={handlePostCreated} />
      )}

      {/* Feed Tabs */}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="relevant"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Relevant
          </TabsTrigger>

          <TabsTrigger
            value="latest"
            className="gap-2"
          >
            <Clock3 className="h-4 w-4" />
            Latest
          </TabsTrigger>

          <TabsTrigger
            value="top"
            className="gap-2"
          >
            <Flame className="h-4 w-4" />
            Top
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-6 space-y-5"
            >
              {loading ? (
                <Card className="border border-slate-800 bg-[#10141d]">
                  <CardContent className="flex items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="border border-red-800 bg-[#10141d]">
                  <CardContent className="py-10 text-center">
                    <p className="mb-4 text-red-400">
                      {error}
                    </p>

                    <Button onClick={refreshFeed}>
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : displayedPosts.length === 0 ? (
                <Card className="border border-slate-800 bg-[#10141d]">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <MessageSquare className="mb-4 h-12 w-12 text-slate-500" />

                    <h2 className="text-lg font-semibold">
                      No posts yet
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Be the first person to start the discussion.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                displayedPosts.map(post => (
                  <motion.div
                    key={post._id}
                    // layout
                  >
                    <Post
                      post={post}
                      currentUser={user}
                      onLike={handleLike}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UniCollab