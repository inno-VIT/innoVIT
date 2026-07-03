import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ThumbsUp,
  Reply,
  Edit,
  Trash2,
  Check,
  X,
} from 'lucide-react'

import { useAuth } from '../../../../utils/AuthContext'
import {
  likeComment,
  unlikeComment,
  updateComment,
  deleteComment,
} from '../../api/posts'

import CommentEditor from './CommentEditor'

const Comment = ({
  comment,
  onReply,
  onDelete,
  onEdit,
  depth = 0,
}) => {
  const { user } = useAuth()

  const [likes, setLikes] = useState(comment.likes || 0)
  const [liked, setLiked] = useState(comment.userLiked || false)

  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [content, setContent] = useState(comment.content)

  const isAuthor =
    user &&
    (user.id === comment.authorId ||
      user._id === comment.authorId)

  const handleLike = async () => {
    if (!user) return

    try {
      if (liked) {
        setLiked(false)
        setLikes(prev => prev - 1)

        await unlikeComment(comment.id, user)
      } else {
        setLiked(true)
        setLikes(prev => prev + 1)

        await likeComment(comment.id, user)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async newContent => {
    try {
      setLoading(true)

      await updateComment(comment.id, user, {
        content: newContent,
      })

      setContent(newContent)

      onEdit?.(comment.id, newContent)

      setEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return

    try {
      await deleteComment(comment.id, user)

      onDelete?.(comment.id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      className={`${
        depth > 0
          ? 'ml-8 border-l border-slate-700 pl-5'
          : ''
      }`}
    >
      <div className="rounded-2xl border border-slate-800 bg-[#10141d] p-5">

        {/* Header */}

        <div className="flex items-start justify-between">

          <div className="flex gap-3">

            <Link
              to={`/unicollab/profile/${comment.authorId}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                {comment.author?.charAt(0)?.toUpperCase()}
              </div>
            </Link>

            <div>

              <Link
                to={`/unicollab/profile/${comment.authorId}`}
                className="font-semibold text-white hover:text-blue-400"
              >
                {comment.author}
              </Link>

              <div className="mt-1 text-xs text-slate-500">
                {new Date(
                  comment.createdAt,
                ).toLocaleString()}
                {comment.edited && (
                  <span className="ml-2">
                    • edited
                  </span>
                )}
              </div>

            </div>

          </div>

          {isAuthor && !editing && (
            <div className="flex gap-1">

              <button
                onClick={() => setEditing(true)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={handleDelete}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-900/20 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>

            </div>
          )}

        </div>

        {/* Content */}

        <div className="mt-4">

          {editing ? (
            <CommentEditor
              placeholder="Edit your comment..."
              loading={loading}
              defaultValue={content}
              submitLabel="Save"
              onSubmit={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <p className="whitespace-pre-wrap leading-7 text-slate-300">
              {content}
            </p>
          )}

        </div>

        {!editing && (
          <div className="mt-5 flex flex-wrap items-center gap-3">

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                liked
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ThumbsUp size={16} />

              {likes}
            </button>

            {user && (
              <button
                onClick={() =>
                  setReplying(!replying)
                }
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
              >
                <Reply size={16} />

                Reply
              </button>
            )}

          </div>
        )}

        {replying && (
          <div className="mt-5">

            <CommentEditor
              placeholder="Write a reply..."
              submitLabel="Reply"
              onSubmit={content => {
                onReply?.(comment.id, content)

                setReplying(false)
              }}
              onCancel={() =>
                setReplying(false)
              }
            />

          </div>
        )}

      </div>

      {comment.replies &&
        comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">

            {comment.replies.map(reply => (
              <Comment
                key={reply.id || reply._id}
                comment={reply}
                depth={depth + 1}
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}

          </div>
        )}
    </div>
  )
}

export default Comment











