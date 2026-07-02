import UserAvatar from '../profile/UserAvatar'

const UserMessengerEntry = ({
  conservant,
  conversation,
  setConservant,
}) => {
  const recipient = conversation.recipient

  const active =
    conservant?._id === recipient?._id

  const formatTime = value => {
    if (!value) return ''

    const date = new Date(value)
    const now = new Date()

    const diff =
      (now.getTime() - date.getTime()) /
      (1000 * 60 * 60)

    if (diff < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <button
      onClick={() => setConservant(recipient)}
      className={`
        w-full
        px-5
        py-4
        text-left
        transition-all
        duration-200

        ${
          active
            ? 'bg-blue-600/15 border-l-4 border-blue-500'
            : 'hover:bg-slate-800/70 border-l-4 border-transparent'
        }
      `}
    >
      <div className="flex items-center gap-4">

        <div className="relative flex-shrink-0">

          <UserAvatar
            user={recipient}
            width={50}
            height={50}
          />

          <span
            className="
              absolute
              bottom-0
              right-0
              h-3.5
              w-3.5
              rounded-full
              border-2
              border-[#10141d]
              bg-emerald-500
            "
          />

        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between gap-3">

            <h3
              className={`
                truncate
                font-semibold

                ${
                  active
                    ? 'text-white'
                    : 'text-slate-200'
                }
              `}
            >
              {recipient.firstName}{' '}
              {recipient.lastName}
            </h3>

            <span className="flex-shrink-0 text-xs text-slate-500">
              {formatTime(
                conversation.lastMessageAt ||
                  conversation.updatedAt,
              )}
            </span>

          </div>

          <div className="mt-1 flex items-center justify-between gap-3">

            <p className="truncate text-sm text-slate-400">
              {conversation.lastMessage?.content ||
                'Start chatting...'}
            </p>

            {conversation.unreadCount > 0 && (
              <div
                className="
                  flex
                  h-6
                  min-w-[24px]
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-600
                  px-2
                  text-xs
                  font-semibold
                  text-white
                "
              >
                {conversation.unreadCount}
              </div>
            )}

          </div>

        </div>

      </div>
    </button>
  )
}

export default UserMessengerEntry




// <----------- works fine but commented out for now ----------------->
// import React from 'react'
// import UserAvatar from './UserAvatar'

// const UserMessengerEntry = ({ conservant, conversation, setConservant }) => {
//   const isActive = conservant && conservant._id === conversation.recipient._id

//   const formatTime = timestamp => {
//     if (!timestamp) return ''

//     const date = new Date(timestamp)
//     const now = new Date()
//     const diffInHours = (now - date) / (1000 * 60 * 60)

//     if (diffInHours < 24) {
//       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     } else {
//       return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
//     }
//   }

//   return (
//     <div
//       className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
//         isActive
//           ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
//           : 'hover:bg-gray-50 dark:hover:bg-gray-700'
//       }`}
//       onClick={() => setConservant(conversation.recipient)}
//     >
//       <div className='flex items-center space-x-3'>
//         <UserAvatar user={conversation.recipient} height={40} width={40} />

//         <div className='flex-1 min-w-0'>
//           <div className='flex items-center justify-between'>
//             <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
//               {conversation.recipient.firstName}{' '}
//               {conversation.recipient.lastName}
//             </p>
//             <span className='text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2'>
//               {formatTime(conversation.lastMessageAt || conversation.updatedAt)}
//             </span>
//           </div>

//           {conversation.lastMessage && (
//             <div className='flex items-center justify-between mt-1'>
//               <p className='text-xs text-gray-500 dark:text-gray-400 truncate flex-1'>
//                 {conversation.lastMessage.content}
//               </p>
//               {conversation.unreadCount > 0 && (
//                 <span className='bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2'>
//                   {conversation.unreadCount}
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default UserMessengerEntry
