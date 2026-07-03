import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  Edit3,
  Trash2,
  Check,
  X,
} from 'lucide-react'

import {
  deletePost,
  likePost,
  unlikePost,
  updatePost,
} from '../../api/posts'

import { useAuth } from '../../../../utils/AuthContext'

import ContentDetails from '../ContentDetails'
import LikeBox from '../../components/shared/LikeBox'
import Markdown from '../../components/shared/Markdown'
import ContentUpdateEditor from '../ContentUpdateEditor'
import UserLikePreview from '../UserLikePreview'

const PostCard = ({
  post: initialPost,
  onRemove,
  preview = false,
  className = '',
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [post, setPost] = useState(initialPost)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const [liked, setLiked] = useState(post.userLiked || false)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)

  const isAuthor = user?.id === post.author?._id
  const isAdmin = user?.isAdmin

  const openPost = () => {
    if (!preview) return
    navigate(`/unicollab/post/${post._id}`)
  }

  const handleComment = e => {
    e.stopPropagation()
    navigate(`/unicollab/post/${post._id}`)
  }

  const handleLike = async value => {
    if (!user) return

    try {
      if (value) {
        setLiked(true)
        setLikeCount(prev => prev + 1)
        await likePost(post._id, user)
      } else {
        setLiked(false)
        setLikeCount(prev => prev - 1)
        await unlikePost(post._id, user)
      }
    } catch (err) {
      console.error(err)
      setLiked(post.userLiked)
      setLikeCount(post.likeCount || 0)
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

      onRemove?.(post)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  const handleUpdate = async (e, content) => {
    e.preventDefault()

    try {
      const updated = await updatePost(
        post._id,
        user,
        { content },
      )

      setPost({
        ...post,
        content: updated.content,
        edited: true,
      })

      setEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <article
      onClick={openPost}
      className={`
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-[#10141d]
        transition-all
        duration-300
        hover:border-slate-700
        hover:shadow-xl
        ${preview ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="flex">
        {/* Vote Column */}

        <aside className="flex w-16 flex-col items-center border-r border-slate-800 bg-[#0b0e15] py-5">

          <LikeBox
            liked={liked}
            likeCount={likeCount}
            onLike={handleLike}
          />

        </aside>

        {/* Main Content */}

        <div className="flex-1 p-6">

          {/* Header */}

          <div className="mb-5 flex items-start justify-between">

            <ContentDetails
              user={post.author}
              createdAt={post.createdAt}
              edited={post.edited}
              preview={preview}
            />

            {(isAuthor || isAdmin) && !preview && (

              <div className="flex items-center gap-2">

                <button
                  onClick={e => {
                    e.stopPropagation()
                    setEditing(!editing)
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  {editing ? (
                    <X size={17} />
                  ) : (
                    <Edit3 size={17} />
                  )}
                </button>

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className={`rounded-lg p-2 transition ${
                    confirmDelete
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:bg-red-600 hover:text-white'
                  }`}
                >
                  {confirmDelete ? (
                    <Check size={17} />
                  ) : (
                    <Trash2 size={17} />
                  )}
                </button>

              </div>

            )}

          </div>

          {/* Title */}

          {post.title && (
            <h2 className="mb-3 text-2xl font-bold leading-tight text-white">
              {post.title}
            </h2>
          )}

          {/* Content */}

          {editing ? (
            <ContentUpdateEditor
              originalContent={post.content}
              handleSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div
              className={`
                prose
                prose-invert
                max-w-none
                text-slate-300
                ${
                  preview === 'primary'
                    ? 'line-clamp-6'
                    : ''
                }
              `}
            >
              <Markdown content={post.content} />
            </div>
          )}
                    {/* Footer */}

          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">

            <button
              onClick={handleComment}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-sm
                text-slate-400
                transition
                hover:bg-slate-800
                hover:text-white
              "
            >
              <MessageCircle className="h-4 w-4" />

              <span>
                {post.commentCount || 0} Comment
                {(post.commentCount || 0) !== 1 ? 's' : ''}
              </span>
            </button>

            <div className="flex items-center gap-4">

              <UserLikePreview
                postId={post._id}
                userLikePreview={post.likes?.slice(0, 3)}
              />

              <span className="text-sm text-slate-500">
                {likeCount} Like{likeCount !== 1 ? 's' : ''}
              </span>

            </div>

          </div>

        </div>
      </div>

      {/* Delete Confirmation */}

      {confirmDelete && (

        <div
          className="
            absolute
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            backdrop-blur-sm
          "
          onClick={e => e.stopPropagation()}
        >

          <div
            className="
              w-full
              max-w-sm
              rounded-2xl
              border
              border-slate-700
              bg-[#10141d]
              p-6
            "
          >

            <h3 className="text-xl font-semibold text-white">
              Delete Post?
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setConfirmDelete(false)}
                className="
                  rounded-xl
                  border
                  border-slate-700
                  px-5
                  py-2
                  text-sm
                  text-slate-300
                  transition
                  hover:bg-slate-800
                "
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={handleDelete}
                className="
                  rounded-xl
                  bg-red-600
                  px-5
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:opacity-50
                "
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>

            </div>

          </div>

        </div>

      )}

    </article>
  )
}

export default PostCard








