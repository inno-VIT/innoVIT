import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import {
  MessageCircle,
  Edit,
  Trash2,
  CheckCircle,
  X,
} from 'lucide-react'

import {
  deletePost,
  likePost,
  unlikePost,
  updatePost,
} from '../../api/posts'

import { useAuth } from '../../../../utils/AuthContext'

import { Card, CardContent } from '../../../ui/Card'
import { Button } from '../../../ui/Button'

import ContentDetails from '../ContentDetails'
import LikeBox from '../shared/LikeBox'
import Markdown from '../shared/Markdown'
import Comments from '../comments/Comments'
import UserLikePreview from '../UserLikePreview'
import ContentUpdateEditor from '../ContentUpdateEditor'

const Post = ({
  post: initialPost,
  currentUser,
  onLike,
  onDelete,
  preview = false,
}) => {
  const navigate = useNavigate()

  const { user } = useAuth()

  const [post, setPost] = useState(initialPost)

  const [editing, setEditing] = useState(false)

  const [showComments, setShowComments] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)

  const [loading, setLoading] = useState(false)

  const [likeCount, setLikeCount] = useState(
    initialPost.likeCount || 0,
  )

  const [userLiked, setUserLiked] = useState(
    initialPost.userLiked || false,
  )

  useEffect(() => {
    setPost(initialPost)

    setLikeCount(initialPost.likeCount || 0)

    setUserLiked(initialPost.userLiked || false)
  }, [initialPost])

  const isAuthor =
    user &&
    post.author &&
    user._id === post.author._id

  const isAdmin = user?.isAdmin

  const handleLike = async liked => {
    if (!user) {
      navigate('/login')
      return
    }

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

      if (onLike) {
        onLike({
          ...post,
          likeCount: liked
            ? likeCount + 1
            : likeCount - 1,
          userLiked: liked,
        })
      }
    } catch (err) {
      console.error(err)

      setLikeCount(post.likeCount || 0)
      setUserLiked(post.userLiked || false)
    }
  }

  const handleDelete = async e => {
    e.stopPropagation()

    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    try {
      setLoading(true)

      await deletePost(post._id, user)

      if (onDelete) {
        onDelete(post._id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  const handleEdit = e => {
    e.stopPropagation()

    setEditing(prev => !prev)
  }

  const handleUpdate = async (
    e,
    updatedContent,
  ) => {
    e.preventDefault()

    try {
      const updated = await updatePost(
        post._id,
        user,
        {
          content: updatedContent,
        },
      )

      setPost(prev => ({
        ...prev,
        content:
          updated.content ||
          updated.post?.content ||
          updatedContent,
        edited: true,
      }))

      setEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  const openPost = () => {
    if (preview) {
      navigate(`/unicollab/post/${post._id}`)
    }
  }

  const authorName =
    post.author?.firstName && post.author?.lastName
      ? `${post.author.firstName} ${post.author.lastName}`
      : post.author?.username || 'Anonymous'

  const authorUsername =
    post.author?.username || 'anonymous'

  const avatarLetter =
    authorUsername.charAt(0).toUpperCase()
      return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="mb-5"
    >
      <Card
        onClick={openPost}
        className={`overflow-hidden border border-slate-800 bg-[#10141d] transition-all hover:border-slate-700 hover:shadow-xl ${
          preview ? 'cursor-pointer' : ''
        }`}
      >
        <CardContent className="p-0">

          <div className="flex">

            {/* Like Sidebar */}

            <div className="w-14 flex-shrink-0 bg-[#0b0f17] border-r border-slate-800 flex flex-col items-center py-4">
              <LikeBox
                likeCount={likeCount}
                liked={userLiked}
                onLike={handleLike}
                size="sm"
              />
            </div>

            {/* Content */}

            <div className="flex-1 p-5 min-w-0">

              {/* Header */}

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold"
                  >
                    {avatarLetter}
                  </div>

                  <ContentDetails
                    username={authorUsername}
                    createdAt={post.createdAt}
                    edited={post.edited}
                    preview={false}
                  />

                </div>

                {(isAuthor || isAdmin) && (
                  <div className="flex items-center gap-1">

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEdit}
                    >
                      {editing ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                    >
                      {confirmDelete ? (
                        <CheckCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>

                  </div>
                )}

              </div>

              {/* Title */}

              {post.title && (
                <h2 className="mt-4 text-2xl font-bold text-white">
                  {post.title}
                </h2>
              )}

              {/* Image */}

              {post.image && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="mt-5 overflow-hidden rounded-xl border border-slate-700"
                >
                  <img
                    src={post.image}
                    alt=""
                    className="w-full object-cover max-h-[550px]"
                  />
                </motion.div>
              )}

              {/* Markdown */}

              <div className="mt-5">

                {editing ? (
                  <ContentUpdateEditor
                    originalContent={post.content}
                    handleSubmit={handleUpdate}
                    onCancel={() => setEditing(false)}
                    placeholder="Edit your post..."
                  />
                ) : (
                  <Markdown
                    content={post.content}
                    size="base"
                  />
                )}

              </div>

              {/* Footer */}

              <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">

                <div className="flex items-center gap-3">

                  <Button
                    variant="ghost"
                    onClick={() =>
                      setShowComments(prev => !prev)
                    }
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />

                    {post.commentCount || 0}
                  </Button>

                  <UserLikePreview
                    postId={post._id}
                    userLikePreview={post.likes}
                  />

                </div>

                <div className="text-sm text-slate-400">
                  {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                </div>

              </div>
                            {/* Comments */}

              <AnimatePresence>

                {showComments && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: 'auto',
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="mt-6 overflow-hidden border-t border-slate-800 pt-6"
                  >
                    <Comments postId={post._id} />
                  </motion.div>

                )}

              </AnimatePresence>

            </div>

          </div>

        </CardContent>

        {/* Delete Confirmation */}

        <AnimatePresence>

          {confirmDelete && (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                absolute
                inset-0
                bg-black/60
                backdrop-blur-sm
                flex
                items-center
                justify-center
                z-50
              "
            >

              <motion.div
                initial={{
                  scale: 0.9,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.9,
                  opacity: 0,
                }}
                className="
                  w-[360px]
                  rounded-xl
                  border
                  border-slate-700
                  bg-[#141923]
                  p-6
                  shadow-2xl
                "
              >

                <h3 className="text-lg font-semibold text-white">
                  Delete Post?
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-end gap-3">

                  <Button
                    variant="outline"
                    onClick={() =>
                      setConfirmDelete(false)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="destructive"
                    disabled={loading}
                    onClick={handleDelete}
                  >
                    {loading
                      ? 'Deleting...'
                      : 'Delete'}
                  </Button>

                </div>

              </motion.div>

            </motion.div>

          )}

        </AnimatePresence>

      </Card>

    </motion.div>
  )
}

export default Post

























// import React, { useState, useEffect } from 'react'
// import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card.jsx'
// import { Button } from '../ui/Button.jsx'
// import { ThumbsUp, ThumbsDown, MessageCircle, Send, Image as ImageIcon } from 'lucide-react'
// import { Textarea } from '../ui/TextArea.jsx'
// import Comment from '../unicollab/components/comments/Comment.jsx'
// import { motion, AnimatePresence } from 'framer-motion'

// const Post = ({ post, onLike, onDislike, onComment, currentUser }) => {
//   const [isCommenting, setIsCommenting] = useState(false)
//   const [commentText, setCommentText] = useState('')
//   const [comments, setComments] = useState(post.comments || [])
//   const [isLiking, setIsLiking] = useState(false)
//   const [isDisliking, setIsDisliking] = useState(false)

//   useEffect(() => {
//     const storedComments = JSON.parse(localStorage.getItem(`comments_${post.id}`)) || []
//     if (storedComments.length > 0) {
//       setComments(storedComments)
//     }
//   }, [post.id])

//   const saveCommentsToLocalStorage = (updatedComments) => {
//     localStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedComments))
//   }

//   const handleCommentSubmit = (e) => {
//     e.preventDefault()
//     if (!commentText.trim()) return

//     const newComment = {
//       id: Date.now(),
//       content: commentText,
//       author: currentUser?.fullName || currentUser?.username || 'Anonymous',
//       authorId: currentUser?.id || 'unknown',
//       createdAt: new Date().toISOString(),
//       likes: 0,
//     }

//     const updatedComments = [newComment, ...comments]
//     setComments(updatedComments)
//     saveCommentsToLocalStorage(updatedComments)

//     onComment(post.id, newComment)
//     setCommentText('')
//     setIsCommenting(false)
//   }

//   const handleLike = async () => {
//     setIsLiking(true)
//     await new Promise(resolve => setTimeout(resolve, 200)) // Simulate async operation
//     onLike(post.id)
//     setIsLiking(false)
//   }

//   const handleDislike = async () => {
//     setIsDisliking(true)
//     await new Promise(resolve => setTimeout(resolve, 200)) // Simulate async operation
//     onDislike(post.id)
//     setIsDisliking(false)
//   }

//   const getReactionButtonStyle = (reactionType) => {
//     if (post.userReaction === reactionType) {
//       return 'default'
//     }
//     return 'outline'
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       whileHover={{ scale: 1.01 }}
//       className="mb-4"
//     >
//       <Card className='hover:shadow-md transition-shadow duration-200'>
//         <CardHeader className='flex flex-row items-center gap-4'>
//           <motion.div
//             className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold"
//             whileHover={{ scale: 1.1 }}
//             transition={{ type: "spring", stiffness: 400, damping: 10 }}
//           >
//             {post.author?.charAt(0)?.toUpperCase() || 'A'}
//           </motion.div>
//           <div>
//             <h3 className='font-semibold'>{post.author || 'Anonymous'}</h3>
//             <p className='text-sm text-muted-foreground'>
//               {new Date(post.createdAt).toLocaleDateString()} at{' '}
//               {new Date(post.createdAt).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               })}
//             </p>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {post.image && (
//             <motion.div
//               className="rounded-lg overflow-hidden border"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.3 }}
//             >
//               <img
//                 src={post.image}
//                 alt="Post content"
//                 className="w-full h-auto max-h-96 object-cover cursor-pointer"
//                 onClick={() => window.open(post.image, '_blank')}
//               />
//             </motion.div>
//           )}
//           <p className='whitespace-pre-wrap'>{post.content}</p>
//         </CardContent>
//         <CardFooter className='flex flex-col gap-4'>
//           <div className='flex gap-4 w-full'>
//             <motion.div whileTap={{ scale: 0.95 }}>
//               <Button
//                 variant={getReactionButtonStyle('like')}
//                 size='sm'
//                 className='gap-2'
//                 onClick={handleLike}
//                 disabled={isLiking}
//               >
//                 <motion.div
//                   animate={{ scale: isLiking ? 1.2 : 1 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   <ThumbsUp className='h-4 w-4' />
//                 </motion.div>
//                 {post.likes || 0}
//               </Button>
//             </motion.div>

//             <motion.div whileTap={{ scale: 0.95 }}>
//               <Button
//                 variant={getReactionButtonStyle('dislike')}
//                 size='sm'
//                 className='gap-2'
//                 onClick={handleDislike}
//                 disabled={isDisliking}
//               >
//                 <motion.div
//                   animate={{ scale: isDisliking ? 1.2 : 1 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   <ThumbsDown className='h-4 w-4' />
//                 </motion.div>
//                 {post.dislikes || 0}
//               </Button>
//             </motion.div>

//             <motion.div whileTap={{ scale: 0.95 }}>
//               <Button
//                 variant='outline'
//                 size='sm'
//                 className='gap-2'
//                 onClick={() => setIsCommenting(!isCommenting)}
//               >
//                 <MessageCircle className='h-4 w-4' />
//                 {comments.length}
//               </Button>
//             </motion.div>
//           </div>

//           <AnimatePresence>
//             {isCommenting && (
//               <motion.form
//                 onSubmit={handleCommentSubmit}
//                 className='w-full space-y-2'
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: 'auto' }}
//                 exit={{ opacity: 0, height: 0 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <Textarea
//                   value={commentText}
//                   onChange={(e) => setCommentText(e.target.value)}
//                   placeholder='Write a comment...'
//                   className='min-h-[80px] resize-none'
//                 />
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setIsCommenting(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type='submit'
//                     size='sm'
//                     disabled={!commentText.trim()}
//                     className="gap-2"
//                   >
//                     <Send className='h-4 w-4' />
//                     Comment
//                   </Button>
//                 </div>
//               </motion.form>
//             )}
//           </AnimatePresence>

//           {comments.length > 0 && (
//             <motion.div
//               className='w-full space-y-3'
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.3 }}
//             >
//               {comments.map((comment, index) => (
//                 <motion.div
//                   key={comment.id}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.3, delay: index * 0.1 }}
//                 >
//                   <Comment comment={comment} />
//                 </motion.div>
//               ))}
//             </motion.div>
//           )}
//         </CardFooter>
//       </Card>
//     </motion.div>
//   )
// }

// export default Post


// <---------THe code below works completely fine-------->
// import React, { useState, useEffect } from 'react'
// import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card.jsx'
// import { Button } from '../ui/Button.jsx'
// import { ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react'
// import { Textarea } from '../ui/TextArea.jsx'
// import Comment from './Comment.jsx'

// const Post = ({ post, onLike, onDislike, onComment }) => {
//   const [isCommenting, setIsCommenting] = useState(false)
//   const [commentText, setCommentText] = useState('')
//   const [comments, setComments] = useState([])
//   const { user } = 'useUser()'

//   useEffect(() => {
//     // Load comments for this post from localStorage
//     const storedComments =
//       JSON.parse(localStorage.getItem(`comments_${post.id}`)) || []
//     setComments(storedComments)
//   }, [post.id])

//   const saveCommentsToLocalStorage = updatedComments => {
//     localStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedComments))
//   }

//   const handleCommentSubmit = e => {
//     e.preventDefault()
//     if (!commentText.trim()) return

//     const newComment = {
//       id: Date.now(),
//       content: commentText,
//       author: user?.fullName || 'Anonymous',
//       authorId: user?.id || 'unknown',
//       createdAt: new Date().toISOString(),
//     }

//     const updatedComments = [...comments, newComment]
//     setComments(updatedComments)
//     // saveCommentsToLocalStorage(updatedComments);

//     // Pass the comment to the parent component if needed
//     onComment(post.id, newComment)

//     setCommentText('')
//     setIsCommenting(false)
//   }

//   return (
//     <Card className='mb-4'>
//       <CardHeader className='flex flex-row items-center gap-4'>
//         <div>
//           <h3 className='font-semibold'>{post.author}</h3>
//           <p className='text-sm text-muted-foreground'>
//             {new Date(post.createdAt).toLocaleDateString()}
//           </p>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <p className='whitespace-pre-wrap'>{post.content}</p>
//       </CardContent>
//       <CardFooter className='flex flex-col gap-4'>
//         <div className='flex gap-4 w-full'>
//           <Button
//             variant='ghost'
//             size='sm'
//             className='gap-2'
//             onClick={() => onLike(post.id)}
//           >
//             <ThumbsUp className='h-4 w-4' />
//             {post.likes}
//           </Button>
//           <Button
//             variant='ghost'
//             size='sm'
//             className='gap-2'
//             onClick={() => onDislike(post.id)}
//           >
//             <ThumbsDown className='h-4 w-4' />
//             {post.dislikes}
//           </Button>
//           <Button
//             variant='ghost'
//             size='sm'
//             className='gap-2'
//             onClick={() => setIsCommenting(!isCommenting)}
//           >
//             <MessageCircle className='h-4 w-4' />
//             {comments.length}
//           </Button>
//         </div>

//         {isCommenting && (
//           <form onSubmit={handleCommentSubmit} className='w-full'>
//             <div className='flex gap-2'>
//               <Textarea
//                 value={commentText}
//                 onChange={e => setCommentText(e.target.value)}
//                 placeholder='Write a comment...'
//                 className='min-h-[60px]'
//               />
//               <Button
//                 type='submit'
//                 size='sm'
//                 className='self-end'
//                 disabled={!commentText.trim()}
//               >
//                 <Send className='h-4 w-4' />
//               </Button>
//             </div>
//           </form>
//         )}

//         {comments.length > 0 && (
//           <div className='w-full space-y-2'>
//             {comments.map(comment => (
//               <Comment key={comment.id} comment={comment} />
//             ))}
//           </div>
//         )}
//       </CardFooter>
//     </Card>
//   )
// }

// export default Post
