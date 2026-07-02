import React, { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'

import { useAuth } from '../../../utils/AuthContext'
import { getComments, createComment } from '../api/posts'

import Loading from './Loading'
import Comment from '../../post/Comment'
import CommentEditor from './CommentEditor'

const Comments = ({ postId }) => {
  const { user } = useAuth()

  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = async () => {
    try {
      setLoading(true)

      const data = await getComments({ id: postId })

      setComments(data.comments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId])

  const handleCreateComment = async content => {
    if (!content.trim() || !user) return

    try {
      setSubmitting(true)

      const created = await createComment(
        { content },
        { id: postId },
        user,
      )

      setComments(prev => [created, ...prev])
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = id => {
    setComments(prev =>
      prev.filter(comment => comment._id !== id),
    )
  }

  const handleEdit = (id, content) => {
    setComments(prev =>
      prev.map(comment =>
        comment._id === id
          ? {
              ...comment,
              content,
              edited: true,
            }
          : comment,
      ),
    )
  }

  const handleReply = async (parentId, content) => {
    if (!content.trim()) return

    await handleCreateComment(content)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <section className="space-y-6">

      {/* Header */}

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
          <MessageCircle size={20} />
        </div>

        <div>

          <h2 className="text-xl font-bold text-white">
            Discussion
          </h2>

          <p className="text-sm text-slate-400">
            {comments.length}{' '}
            {comments.length === 1
              ? 'comment'
              : 'comments'}
          </p>

        </div>

      </div>

      {/* Editor */}

      {user ? (
        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-[#10141d]
            p-6
          "
        >
          <CommentEditor
            loading={submitting}
            placeholder="Join the discussion..."
            onSubmit={handleCreateComment}
          />
        </div>
      ) : (
        <div
          className="
            rounded-2xl
            border
            border-amber-700/30
            bg-amber-500/10
            p-5
            text-center
          "
        >
          <p className="text-amber-300">
            Login to join the discussion.
          </p>
        </div>
      )}

      {/* Comments */}

      {comments.length === 0 ? (
        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-[#10141d]
            py-14
            text-center
          "
        >
          <MessageCircle
            className="mx-auto mb-4 text-slate-600"
            size={42}
          />

          <h3 className="text-lg font-semibold text-white">
            No comments yet
          </h3>

          <p className="mt-2 text-slate-400">
            Be the first to start the discussion.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {comments.map(comment => (
            <Comment
              key={comment._id}
              comment={{
                id: comment._id,
                content: comment.content,
                author: comment.author?.username,
                authorId: comment.author?._id,
                createdAt: comment.createdAt,
                likes: comment.likeCount || 0,
                replies: comment.children || [],
                edited: comment.edited,
                isAuthor:
                  user &&
                  user.id === comment.author?._id,
              }}
              depth={0}
              onReply={handleReply}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}

        </div>
      )}

    </section>
  )
}

export default Comments