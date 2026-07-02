import { useState } from 'react'
import UserAvatar from './UserAvatar'
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


// import React, { useState } from 'react'
// import HorizontalStack from '../../ui/HorizontalStack'
// import UserLikeModal from './UserLikeModal'
// import UserAvatar from './UserAvatar'

// const UserLikePreview = ({ postId, userLikePreview }) => {
//   const [open, setOpen] = useState(false)

//   const handleClick = event => {
//     event.stopPropagation()
//     setOpen(true)
//   }

//   let userLikes
//   if (userLikePreview) {
//     userLikes = userLikePreview.slice(0, 3)
//   }

//   if (!userLikes || userLikes.length === 0) {
//     return null
//   }

//   return (
//     <>
//       <button
//         onClick={handleClick}
//         className='inline-flex items-center gap-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
//       >
//         <span className='text-blue-500'>👍</span>
//         <HorizontalStack spacing={-2}>
//           <div className='flex -space-x-2'>
//             {userLikes.map(userLike => (
//               <UserAvatar
//                 key={userLike._id || userLike.username}
//                 user={userLike}
//                 height={24}
//                 width={24}
//                 className='border-2 border-white dark:border-gray-800'
//               />
//             ))}
//           </div>
//         </HorizontalStack>
//       </button>

//       <UserLikeModal open={open} setOpen={setOpen} postId={postId} />
//     </>
//   )
// }

// export default UserLikePreview
