import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import axios from 'axios'

import { useAuth } from '../../utils/AuthContext'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

import CreatePost from '../post/CreatePost'
import Post from '../post/Post'

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
    <div className="mx-auto max-w-3xl space-y-6">
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
                    layout
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



// <----------------- Works perfectly fine, but the code is commented out for now. ----------------->
// import React, { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// // import Layout from './layout/Layout.jsx'
// import { Button } from '../ui/Button.jsx'
// import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card.jsx'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs.jsx'
// // import HeaderUniCollab from './layout/HeaderUniCollab.jsx'
// import CreatePost from '../post/CreatePost.jsx'
// import Post from '../post/Post.jsx'
// import { useAuth } from '../../utils/AuthContext.jsx'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Home, MessageSquare, Trophy } from 'lucide-react'

// const UniCollab = () => {
//   const [posts, setPosts] = useState([])
//   const [activeTab, setActiveTab] = useState('relevant')
//   const { currentUser, isAuthenticated } = useAuth()

//   // Load posts from localStorage on component mount
//   useEffect(() => {
//     const storedPosts = JSON.parse(localStorage.getItem('posts')) || []
//     setPosts(storedPosts)
//   }, [])

//   // Save posts to localStorage whenever posts change
//   useEffect(() => {
//     if (posts.length > 0) {
//       localStorage.setItem('posts', JSON.stringify(posts))
//     }
//   }, [posts])

//   const handleCreatePost = newPost => {
//     const postWithDefaults = {
//       ...newPost,
//       likes: 0,
//       dislikes: 0,
//       comments: [],
//       userReaction: null,
//     }

//     const updatedPosts = [postWithDefaults, ...posts]
//     setPosts(updatedPosts)
//   }

//   const handleLike = postId => {
//     setPosts(prevPosts =>
//       prevPosts.map(post => {
//         if (post.id !== postId) return post

//         const currentUserReaction = post.userReaction
//         let newLikes = post.likes
//         let newDislikes = post.dislikes
//         let newReaction = 'like'

//         if (currentUserReaction === 'like') {
//           newLikes = Math.max(0, post.likes - 1)
//           newReaction = null
//         } else if (currentUserReaction === 'dislike') {
//           newLikes = post.likes + 1
//           newDislikes = Math.max(0, post.dislikes - 1)
//           newReaction = 'like'
//         } else {
//           newLikes = post.likes + 1
//           newReaction = 'like'
//         }

//         return {
//           ...post,
//           likes: newLikes,
//           dislikes: newDislikes,
//           userReaction: newReaction,
//         }
//       }),
//     )
//   }

//   const handleDislike = postId => {
//     setPosts(prevPosts =>
//       prevPosts.map(post => {
//         if (post.id !== postId) return post

//         const currentUserReaction = post.userReaction
//         let newLikes = post.likes
//         let newDislikes = post.dislikes
//         let newReaction = 'dislike'

//         if (currentUserReaction === 'dislike') {
//           newDislikes = Math.max(0, post.dislikes - 1)
//           newReaction = null
//         } else if (currentUserReaction === 'like') {
//           newDislikes = post.dislikes + 1
//           newLikes = Math.max(0, post.likes - 1)
//           newReaction = 'dislike'
//         } else {
//           newDislikes = post.dislikes + 1
//           newReaction = 'dislike'
//         }

//         return {
//           ...post,
//           likes: newLikes,
//           dislikes: newDislikes,
//           userReaction: newReaction,
//         }
//       }),
//     )
//   }

//   const handleComment = (postId, newComment) => {
//     setPosts(prevPosts =>
//       prevPosts.map(post =>
//         post.id === postId
//           ? {
//               ...post,
//               comments: [newComment, ...post.comments],
//             }
//           : post,
//       ),
//     )
//   }

//   // Filter and sort posts based on active tab
//   const getFilteredPosts = () => {
//     switch (activeTab) {
//       case 'latest':
//         return [...posts].sort(
//           (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
//         )
//       case 'top':
//         return [...posts].sort(
//           (a, b) => b.likes - b.dislikes - (a.likes - a.dislikes),
//         )
//       case 'relevant':
//       default:
//         return [...posts].sort((a, b) => {
//           const aScore =
//             a.likes -
//             a.dislikes +
//             (new Date() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24)
//           const bScore =
//             b.likes -
//             b.dislikes +
//             (new Date() - new Date(b.createdAt)) / (1000 * 60 * 60 * 24)
//           return bScore - aScore
//         })
//     }
//   }

//   const filteredPosts = getFilteredPosts()

//   // Animation variants
//   const tabContentVariants = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -20 },
//   }

//   return (
//     <div className='max-w-[100vw] font-sora'>
//       {isAuthenticated ? (
//         // <Layout>
//           // <HeaderUniCollab />
//           <div className='space-y-6'>
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className='w-full'
//             >
//               <TabsList className='grid w-full grid-cols-3 p-1 bg-muted/50 rounded-lg'>
//                 <TabsTrigger
//                   value='relevant'
//                   className='relative data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200'
//                 >
//                   <Home className='w-4 h-4 mr-2' />
//                   Relevant
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value='latest'
//                   className='relative data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200'
//                 >
//                   <MessageSquare className='w-4 h-4 mr-2' />
//                   Latest
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value='top'
//                   className='relative data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200'
//                 >
//                   <Trophy className='w-4 h-4 mr-2' />
//                   Top
//                 </TabsTrigger>
//               </TabsList>

//               <AnimatePresence mode='wait'>
//                 {activeTab === 'relevant' && (
//                   <TabsContent
//                     value='relevant'
//                     className='space-y-6'
//                     key='relevant-content'
//                   >
//                     <motion.div
//                       key='relevant-tab'
//                       variants={tabContentVariants}
//                       initial='initial'
//                       animate='animate'
//                       exit='exit'
//                       transition={{ duration: 0.3 }}
//                     >
//                       <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
//                         <CardHeader className='flex flex-row items-center gap-4'>
//                           <div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center'>
//                             <Home className='w-6 h-6 text-white' />
//                           </div>
//                           <div>
//                             <h2 className='text-xl font-semibold'>
//                               Welcome to UniCollab Community
//                             </h2>
//                             <p className='text-sm text-muted-foreground'>
//                               Connect, collaborate, and grow with fellow
//                               students.
//                             </p>
//                           </div>
//                         </CardHeader>
//                         <CardContent>
//                           <p className='text-muted-foreground'>
//                             Share your projects, ask questions, and help each
//                             other succeed in academic journey.
//                           </p>
//                         </CardContent>
//                         <CardFooter>
//                           <Button variant='outline' size='sm' className='gap-2'>
//                             Community Guidelines
//                           </Button>
//                         </CardFooter>
//                       </Card>

//                       <CreatePost onPostCreate={handleCreatePost} />

//                       <div className='space-y-4'>
//                         {filteredPosts.map(post => (
//                           <motion.div
//                             key={post.id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.3 }}
//                           >
//                             <Post
//                               post={post}
//                               onLike={handleLike}
//                               onDislike={handleDislike}
//                               onComment={handleComment}
//                               currentUser={currentUser}
//                             />
//                           </motion.div>
//                         ))}
//                       </div>
//                     </motion.div>
//                   </TabsContent>
//                 )}

//                 {activeTab === 'latest' && (
//                   <TabsContent
//                     value='latest'
//                     className='space-y-6'
//                     key='latest-content'
//                   >
//                     <motion.div
//                       key='latest-tab'
//                       variants={tabContentVariants}
//                       initial='initial'
//                       animate='animate'
//                       exit='exit'
//                       transition={{ duration: 0.3 }}
//                     >
//                       <CreatePost onPostCreate={handleCreatePost} />
//                       <div className='space-y-4'>
//                         {filteredPosts.map(post => (
//                           <motion.div
//                             key={post.id}
//                             initial={{ opacity: 0, x: -20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ duration: 0.3 }}
//                           >
//                             <Post
//                               post={post}
//                               onLike={handleLike}
//                               onDislike={handleDislike}
//                               onComment={handleComment}
//                               currentUser={currentUser}
//                             />
//                           </motion.div>
//                         ))}
//                       </div>
//                     </motion.div>
//                   </TabsContent>
//                 )}

//                 {activeTab === 'top' && (
//                   <TabsContent
//                     value='top'
//                     className='space-y-6'
//                     key='top-content'
//                   >
//                     <motion.div
//                       key='top-tab'
//                       variants={tabContentVariants}
//                       initial='initial'
//                       animate='animate'
//                       exit='exit'
//                       transition={{ duration: 0.3 }}
//                     >
//                       <CreatePost onPostCreate={handleCreatePost} />
//                       <div className='space-y-4'>
//                         {filteredPosts.map((post, index) => (
//                           <motion.div
//                             key={post.id}
//                             initial={{ opacity: 0, scale: 0.9 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             transition={{ duration: 0.3, delay: index * 0.1 }}
//                           >
//                             <Post
//                               post={post}
//                               onLike={handleLike}
//                               onDislike={handleDislike}
//                               onComment={handleComment}
//                               currentUser={currentUser}
//                             />
//                           </motion.div>
//                         ))}
//                       </div>
//                     </motion.div>
//                   </TabsContent>
//                 )}
//               </AnimatePresence>
//             </Tabs>
//           </div>
//         // </Layout>
//       ) : (
//         <div className='flex h-[86vh] min-h-[86vh] max-h-[86vh] w-full justify-center items-center flex-col'>
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <svg
//               xmlns='http://www.w3.org/2000/svg'
//               height='100px'
//               viewBox='0 -960 960 960'
//               width='100px'
//               fill='#F0ECE5'
//             >
//               <path d='M479.91-120q-28.91 0-49.41-20.59-20.5-20.59-20.5-49.5t20.59-49.41q20.59-20.5 49.5-20.5t49.41 20.59q20.5 20.59 20.5 49.5t-20.59 49.41q-20.59 20.5-49.5 20.5ZM410-360v-480h140v480H410Z' />
//             </svg>
//           </motion.div>

//           <motion.h3
//             className='w-[50%] text-[2rem] font-semibold tracking-wide mb-4 text-center'
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             <span className='font-black text-tertiary'> Oops! </span> Looks like
//             you are not signed in. Please sign up or log in to access this
//             feature!{' '}
//           </motion.h3>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//           >
//             <Link to={'/login'}>
//               <div className='font-sora text-xl bg-textColor text-primary font-black p-4 pl-8 pr-8 rounded-full hover:scale-105 transition-transform duration-200'>
//                 Sign in!
//               </div>
//             </Link>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default UniCollab
