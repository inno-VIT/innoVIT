import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Image as ImageIcon } from 'lucide-react'
import { Textarea } from '../ui/TextArea.jsx'
import Comment from '../unicollab/components/comments/Comment.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const Post = ({ post, onLike, onDislike, onComment, currentUser }) => {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(post.comments || [])
  const [isLiking, setIsLiking] = useState(false)
  const [isDisliking, setIsDisliking] = useState(false)

  useEffect(() => {
    const storedComments = JSON.parse(localStorage.getItem(`comments_${post.id}`)) || []
    if (storedComments.length > 0) {
      setComments(storedComments)
    }
  }, [post.id])

  const saveCommentsToLocalStorage = (updatedComments) => {
    localStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedComments))
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newComment = {
      id: Date.now(),
      content: commentText,
      author: currentUser?.fullName || currentUser?.username || 'Anonymous',
      authorId: currentUser?.id || 'unknown',
      createdAt: new Date().toISOString(),
      likes: 0,
    }

    const updatedComments = [newComment, ...comments]
    setComments(updatedComments)
    saveCommentsToLocalStorage(updatedComments)

    onComment(post.id, newComment)
    setCommentText('')
    setIsCommenting(false)
  }

  const handleLike = async () => {
    setIsLiking(true)
    await new Promise(resolve => setTimeout(resolve, 200)) // Simulate async operation
    onLike(post.id)
    setIsLiking(false)
  }

  const handleDislike = async () => {
    setIsDisliking(true)
    await new Promise(resolve => setTimeout(resolve, 200)) // Simulate async operation
    onDislike(post.id)
    setIsDisliking(false)
  }

  const getReactionButtonStyle = (reactionType) => {
    if (post.userReaction === reactionType) {
      return 'default'
    }
    return 'outline'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="mb-4"
    >
      <Card className='hover:shadow-md transition-shadow duration-200'>
        <CardHeader className='flex flex-row items-center gap-4'>
          <motion.div
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {post.author?.charAt(0)?.toUpperCase() || 'A'}
          </motion.div>
          <div>
            <h3 className='font-semibold'>{post.author || 'Anonymous'}</h3>
            <p className='text-sm text-muted-foreground'>
              {new Date(post.createdAt).toLocaleDateString()} at{' '}
              {new Date(post.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.image && (
            <motion.div
              className="rounded-lg overflow-hidden border"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto max-h-96 object-cover cursor-pointer"
                onClick={() => window.open(post.image, '_blank')}
              />
            </motion.div>
          )}
          <p className='whitespace-pre-wrap'>{post.content}</p>
        </CardContent>
        <CardFooter className='flex flex-col gap-4'>
          <div className='flex gap-4 w-full'>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={getReactionButtonStyle('like')}
                size='sm'
                className='gap-2'
                onClick={handleLike}
                disabled={isLiking}
              >
                <motion.div
                  animate={{ scale: isLiking ? 1.2 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ThumbsUp className='h-4 w-4' />
                </motion.div>
                {post.likes || 0}
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={getReactionButtonStyle('dislike')}
                size='sm'
                className='gap-2'
                onClick={handleDislike}
                disabled={isDisliking}
              >
                <motion.div
                  animate={{ scale: isDisliking ? 1.2 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ThumbsDown className='h-4 w-4' />
                </motion.div>
                {post.dislikes || 0}
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={() => setIsCommenting(!isCommenting)}
              >
                <MessageCircle className='h-4 w-4' />
                {comments.length}
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {isCommenting && (
              <motion.form
                onSubmit={handleCommentSubmit}
                className='w-full space-y-2'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder='Write a comment...'
                  className='min-h-[80px] resize-none'
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCommenting(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    size='sm'
                    disabled={!commentText.trim()}
                    className="gap-2"
                  >
                    <Send className='h-4 w-4' />
                    Comment
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {comments.length > 0 && (
            <motion.div
              className='w-full space-y-3'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Comment comment={comment} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default Post


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
