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











// <------  this code runs fine (Old reddit UI) but it is commented out for now.  ------->
// import React, { useState } from 'react'
// import { Card, CardContent, CardHeader } from '../ui/Card.jsx'
// import { Button } from '../ui/Button.jsx'
// import { ThumbsUp, ThumbsDown, Reply, HelpCircle, Edit, Trash2 } from 'lucide-react'
// import { Textarea } from '../ui/TextArea.jsx'
// import ReactMarkdown from 'react-markdown'
// import { useAuth } from '../../utils/AuthContext'
// import { deleteComment, updateComment, likeComment, unlikeComment } from '../unicollab/api/posts.js'

// const Comment = ({
//   comment,
//   onReply,
//   onDelete,
//   onEdit,
//   depth = 0,
//   postId
// }) => {
//   const [isReplying, setIsReplying] = useState(false)
//   const [replyText, setReplyText] = useState('')
//   const [replies, setReplies] = useState(comment.replies || [])
//   const [showReplies, setShowReplies] = useState(true)
//   const [likes, setLikes] = useState(comment.likeCount || comment.likes || 0)
//   const [userReaction, setUserReaction] = useState(comment.userReaction || null)
//   const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)
//   const [isEditing, setIsEditing] = useState(false)
//   const [editText, setEditText] = useState(comment.content)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const { user } = useAuth()
//   const maxDepth = 4

//   // Check if current user is the author
//   const isAuthor = user && user._id === comment.authorId

//   const handleReplySubmit = async (e) => {
//     e.preventDefault()
//     if (!replyText.trim() || !user) return

//     setIsSubmitting(true)
//     try {
//       // This would call your API to create a reply
//       // For now, we'll simulate it
//       const newReply = {
//         id: Date.now().toString(),
//         content: replyText,
//         author: user.username,
//         authorId: user._id,
//         createdAt: new Date().toISOString(),
//         likeCount: 0,
//         replies: [],
//         depth: depth + 1,
//       }

//       const updatedReplies = [...replies, newReply]
//       setReplies(updatedReplies)

//       if (onReply) {
//         onReply(comment.id, newReply)
//       }

//       setReplyText('')
//       setIsReplying(false)
//     } catch (error) {
//       console.error('Error posting reply:', error)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleLike = async () => {
//     if (!user) return

//     try {
//       if (userReaction === 'like') {
//         await unlikeComment(comment.id, user)
//         setLikes(likes - 1)
//         setUserReaction(null)
//       } else {
//         await likeComment(comment.id, user)
//         if (userReaction === 'dislike') {
//           setLikes(likes + 2)
//         } else {
//           setLikes(likes + 1)
//         }
//         setUserReaction('like')
//       }
//     } catch (error) {
//       console.error('Error liking comment:', error)
//     }
//   }

//   const handleDislike = async () => {
//     if (!user) return

//     try {
//       // Note: You might not have a dislike system in your API
//       // This is a placeholder for the functionality
//       if (userReaction === 'dislike') {
//         setUserReaction(null)
//       } else {
//         if (userReaction === 'like') {
//           setLikes(likes - 1)
//         }
//         setUserReaction('dislike')
//       }
//     } catch (error) {
//       console.error('Error disliking comment:', error)
//     }
//   }

//   const handleSaveEdit = async () => {
//     if (!editText.trim()) return

//     setIsSubmitting(true)
//     try {
//       await updateComment(comment.id, user, { content: editText })
//       if (onEdit) {
//         onEdit(comment.id, editText)
//       }
//       setIsEditing(false)
//     } catch (error) {
//       console.error('Error updating comment:', error)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleDelete = async () => {
//     if (!window.confirm('Are you sure you want to delete this comment?')) return

//     try {
//       await deleteComment(comment.id, user)
//       if (onDelete) {
//         onDelete(comment.id)
//       }
//     } catch (error) {
//       console.error('Error deleting comment:', error)
//     }
//   }

//   const handleNestedReply = (commentId, newReply) => {
//     const updatedReplies = replies.map(reply =>
//       reply.id === commentId
//         ? { ...reply, replies: [...reply.replies, newReply] }
//         : reply
//     )
//     setReplies(updatedReplies)
//   }

//   // Markdown Help Component
//   const MarkdownHelp = () => (
//     <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
//       <div className="flex items-center justify-between mb-2">
//         <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
//           Markdown Help
//         </h4>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => setShowMarkdownHelp(false)}
//           className="h-6 w-6 p-0"
//         >
//           ×
//         </Button>
//       </div>
//       <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
//         <div><strong>**bold**</strong> → <strong>bold</strong></div>
//         <div><em>*italic*</em> → <em>italic</em></div>
//         <div><code>`code`</code> → <code>code</code></div>
//         <div><code>```code block```</code> → code block</div>
//         <div><a href="https://commonmark.org/help/" target="_blank" rel="noopener noreferrer" className="underline">
//           Full Markdown Guide
//         </a></div>
//       </div>
//     </div>
//   )

//   const renderContent = () => {
//     if (isEditing) {
//       return (
//         <div className="space-y-3">
//           <Textarea
//             value={editText}
//             onChange={(e) => setEditText(e.target.value)}
//             className="min-h-[100px]"
//           />
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               onClick={handleSaveEdit}
//               disabled={isSubmitting || !editText.trim()}
//             >
//               {isSubmitting ? 'Saving...' : 'Save'}
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 setIsEditing(false)
//                 setEditText(comment.content)
//               }}
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )
//     }

//     return (
//       <div className="prose prose-sm dark:prose-invert max-w-none">
//         <ReactMarkdown>{comment.content}</ReactMarkdown>
//       </div>
//     )
//   }

//   return (
//     <div className={`space-y-2 ${depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}`}>
//       <Card className='bg-background/50'>
//         <CardHeader className='py-3'>
//           <div className="flex items-center justify-between">
//             <div>
//               <div className='text-sm font-semibold'>{comment.author}</div>
//               <div className='text-xs text-muted-foreground'>
//                 {new Date(comment.createdAt).toLocaleDateString()} at{' '}
//                 {new Date(comment.createdAt).toLocaleTimeString([], {
//                   hour: '2-digit',
//                   minute: '2-digit'
//                 })}
//                 {comment.edited && <span className="ml-2 text-gray-500">(edited)</span>}
//               </div>
//             </div>

//             {/* Edit/Delete buttons for authors */}
//             {isAuthor && !isEditing && (
//               <div className="flex gap-1">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => setIsEditing(true)}
//                   className="h-8 w-8 p-0"
//                 >
//                   <Edit className="h-3 w-3" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={handleDelete}
//                   className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
//                 >
//                   <Trash2 className="h-3 w-3" />
//                 </Button>
//               </div>
//             )}
//           </div>
//         </CardHeader>
//         <CardContent className='py-2'>
//           <div className="mb-3">
//             {renderContent()}
//           </div>

//           <div className="flex items-center gap-4 text-xs">
//             <div className="flex items-center gap-1">
//               <Button
//                 variant={userReaction === 'like' ? 'default' : 'ghost'}
//                 size="sm"
//                 className="h-6 px-2"
//                 onClick={handleLike}
//                 disabled={!user}
//               >
//                 <ThumbsUp className="h-3 w-3" />
//               </Button>
//               <span className="min-w-4 text-center">{likes}</span>
//               <Button
//                 variant={userReaction === 'dislike' ? 'default' : 'ghost'}
//                 size="sm"
//                 className="h-6 px-2"
//                 onClick={handleDislike}
//                 disabled={!user}
//               >
//                 <ThumbsDown className="h-3 w-3" />
//               </Button>
//             </div>

//             {depth < maxDepth && user && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-6 px-2 gap-1"
//                 onClick={() => setIsReplying(!isReplying)}
//                 disabled={isEditing}
//               >
//                 <Reply className="h-3 w-3" />
//                 Reply
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {isReplying && depth < maxDepth && (
//         <form onSubmit={handleReplySubmit} className="ml-4">
//           {/* Markdown Help Toggle */}
//           <div className="flex justify-between items-center mb-2">
//             <label htmlFor={`reply-${comment.id}`} className="text-sm font-medium">
//               Write a reply
//             </label>
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
//               className="h-6 px-2 gap-1"
//             >
//               <HelpCircle className="h-3 w-3" />
//               Markdown
//             </Button>
//           </div>

//           {/* Markdown Help */}
//           {showMarkdownHelp && <MarkdownHelp />}

//           <Textarea
//             id={`reply-${comment.id}`}
//             value={replyText}
//             onChange={(e) => setReplyText(e.target.value)}
//             placeholder="Share your thoughts..."
//             className="min-h-[80px] text-sm mb-2"
//             disabled={isSubmitting}
//           />

//           <div className="flex gap-2 justify-end">
//             <Button
//               type="button"
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 setIsReplying(false)
//                 setShowMarkdownHelp(false)
//               }}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               size="sm"
//               disabled={!replyText.trim() || isSubmitting}
//             >
//               {isSubmitting ? 'Posting...' : 'Reply'}
//             </Button>
//           </div>
//         </form>
//       )}

//       {replies.length > 0 && showReplies && (
//         <div className="space-y-2">
//           {replies.map((reply) => (
//             <Comment
//               key={reply.id}
//               comment={reply}
//               onReply={handleNestedReply}
//               depth={depth + 1}
//               postId={postId}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default Comment

