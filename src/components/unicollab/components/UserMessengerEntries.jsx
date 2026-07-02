import { MessageCircle } from 'lucide-react'

import Loading from './shared/Loading'
import UserMessengerEntry from './UserMessengerEntry'

const UserMessengerEntries = ({
  conservant,
  conversations,
  setConservant,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[#10141d]">

      {/* Header */}

      <div className="border-b border-slate-800 px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <MessageCircle size={20} />
          </div>

          <div>

            <h2 className="text-lg font-bold text-white">
              Messages
            </h2>

            <p className="text-sm text-slate-400">
              {conversations.length}{' '}
              {conversations.length === 1
                ? 'conversation'
                : 'conversations'}
            </p>

          </div>

        </div>

      </div>

      {/* Conversation List */}

      <div className="flex-1 overflow-y-auto">

        {conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">

              <MessageCircle
                size={36}
                className="text-slate-500"
              />

            </div>

            <h3 className="text-lg font-semibold text-white">
              No conversations
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
              Start messaging people from their profile to
              see your conversations here.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-800">

            {conversations.map(conversation => (
              <UserMessengerEntry
                key={
                  conversation._id ||
                  conversation.recipient?._id
                }
                conversation={conversation}
                conservant={conservant}
                setConservant={setConservant}
              />
            ))}

          </div>
        )}

      </div>

    </div>
  )
}

export default UserMessengerEntries



// < -------------- code works fine, but commented out for now ----------------- >
// import React from 'react'
// import UserMessengerEntry from './UserMessengerEntry'
// import Loading from './Loading'

// const UserMessengerEntries = ({
//   conservant,
//   conversations,
//   setConservant,
//   loading,
// }) => {
//   if (loading) {
//     return (
//       <div className='h-full flex items-center justify-center'>
//         <Loading />
//       </div>
//     )
//   }

//   return (
//     <div className='h-full flex flex-col'>
//       {/* Header with icon */}
//       <div className='p-4 border-b border-gray-200 dark:border-gray-600'>
//         <div className='flex items-center gap-2'>
//           <span className='text-xl'>💬</span>
//           <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
//             Your Conversations
//           </h2>
//         </div>
//       </div>

//       {/* Conversations List */}
//       <div className='flex-1 overflow-y-auto'>
//         {conversations.length === 0 ? (
//           <div className='h-full flex flex-col items-center justify-center text-center p-8'>
//             <span className='text-4xl mb-4'>😔</span>
//             <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
//               No Conversations
//             </h3>
//             <p className='text-gray-500 dark:text-gray-400 text-sm max-w-xs'>
//               Click 'Message' on another user's profile to start a conversation
//             </p>
//           </div>
//         ) : (
//           <div className='divide-y divide-gray-200 dark:divide-gray-600'>
//             {conversations.map(conversation => (
//               <UserMessengerEntry
//                 key={conversation._id || conversation.recipient?.username}
//                 conservant={conservant}
//                 conversation={conversation}
//                 setConservant={setConservant}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default UserMessengerEntries
