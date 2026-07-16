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

