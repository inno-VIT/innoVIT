import { useState } from 'react'
import UserAvatar from './profile/UserAvatar'
import UserLikeModal from './UserLikeModal'

const UserLikePreview = ({
  postId,
  userLikePreview = [],
}) => {
  const [open, setOpen] = useState(false)

  if (!userLikePreview.length) return null

  const previewUsers = userLikePreview.slice(0, 3)

  return (
    <>
      <button
        onClick={e => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-slate-700
          bg-[#151722]
          px-3
          py-2
          transition
          hover:border-blue-500
          hover:bg-slate-800
        "
      >
        <div className="flex -space-x-2">
          {previewUsers.map(user => (
            <UserAvatar
              key={user._id}
              user={user}
              width={28}
              height={28}
              className="border-2 border-[#10141d]"
            />
          ))}
        </div>

        <span className="text-sm font-medium text-slate-300">
          {userLikePreview.length}{' '}
          {userLikePreview.length === 1
            ? 'Like'
            : 'Likes'}
        </span>
      </button>

      <UserLikeModal
        open={open}
        setOpen={setOpen}
        postId={postId}
      />
    </>
  )
}

export default UserLikePreview
