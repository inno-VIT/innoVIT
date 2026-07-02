import {
  Check,
  CheckCheck,
  Clock,
} from 'lucide-react'

const Message = ({
  message,
  conservant,
  currentUser,
  showAvatar = true,
  showStatus = true,
  isGroupChat = false,
}) => {
  const isMine =
    message.sender?._id === currentUser?._id

  const user = isMine ? currentUser : conservant

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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusIcon = () => {
    if (!isMine || !showStatus) return null

    switch (message.status) {
      case 'read':
        return (
          <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
        )

      case 'delivered':
        return (
          <Check className="h-3.5 w-3.5 text-slate-300" />
        )

      default:
        return (
          <Clock className="h-3.5 w-3.5 text-slate-300" />
        )
    }
  }

  return (
    <div
      className={`flex w-full mb-4 ${
        isMine ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex max-w-[75%] items-end gap-3 ${
          isMine ? 'flex-row-reverse' : ''
        }`}
      >
        {showAvatar && (
          <div
            className={`
              flex
              h-9
              w-9
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              font-semibold
              text-white

              ${
                isMine
                  ? 'bg-blue-600'
                  : 'bg-slate-600'
              }
            `}
          >
            {user?.username?.charAt(0)?.toUpperCase() ||
              'U'}
          </div>
        )}

        <div
          className={`
            rounded-2xl
            px-4
            py-3
            shadow-sm

            ${
              isMine
                ? 'rounded-br-md bg-blue-600 text-white'
                : 'rounded-bl-md border border-slate-700 bg-[#151722] text-slate-100'
            }
          `}
        >
          {isGroupChat && !isMine && (
            <p className="mb-1 text-xs font-semibold text-blue-400">
              {user?.firstName || user?.username}
            </p>
          )}

          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>

          <div
            className={`mt-2 flex items-center gap-1 text-xs ${
              isMine
                ? 'justify-end text-blue-100'
                : 'justify-start text-slate-400'
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>

            {statusIcon()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message












// // Enhanced version
// import React from 'react';
// import { Check, CheckCheck, Clock } from 'lucide-react';

// const Message = ({
//   message,
//   conservant,
//   currentUser,
//   showAvatar = true,
//   showStatus = true,
//   isGroupChat = false
// }) => {
//   const isFromCurrentUser = message.sender?._id === currentUser?._id;
//   const username = isFromCurrentUser ? currentUser?.username : conservant?.username;
//   const displayName = isFromCurrentUser
//     ? currentUser?.firstName || currentUser?.username
//     : conservant?.firstName || conservant?.username;

//   const getStatusIcon = () => {
//     if (!isFromCurrentUser || !showStatus) return null;

//     if (message.status === 'sent') return <Clock className="h-3 w-3 text-gray-400" />;
//     if (message.status === 'delivered') return <Check className="h-3 w-3 text-gray-400" />;
//     if (message.status === 'read') return <CheckCheck className="h-3 w-3 text-blue-500" />;

//     return <Clock className="h-3 w-3 text-gray-400" />; // Default
//   };

//   const getMessageTime = () => {
//     const now = new Date();
//     const messageDate = new Date(message.createdAt);
//     const diffInHours = (now - messageDate) / (1000 * 60 * 60);

//     if (diffInHours < 24) {
//       return messageDate.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } else {
//       return messageDate.toLocaleDateString([], {
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     }
//   };

//   return (
//     <div className={`flex w-full py-1 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
//       <div className={`flex items-end gap-2 max-w-[75%] ${isFromCurrentUser ? 'flex-row-reverse' : ''}`}>
//         {/* Avatar */}
//         {!isFromCurrentUser && showAvatar && (
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
//             {username?.charAt(0)?.toUpperCase() || 'U'}
//           </div>
//         )}

//         {/* Message Bubble */}
//         <div
//           className={`rounded-2xl px-4 py-2 transition-colors ${
//             isFromCurrentUser
//               ? 'bg-blue-500 text-white rounded-br-md hover:bg-blue-600'
//               : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md hover:bg-gray-200 dark:hover:bg-gray-600'
//           } ${message.status === 'error' ? 'border border-red-300' : ''}`}
//         >
//           {/* Sender name for group chats */}
//           {isGroupChat && !isFromCurrentUser && (
//             <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
//               {displayName}
//             </p>
//           )}

//           {/* Message content */}
//           <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
//             {message.content}
//           </p>

//           {/* Timestamp and status */}
//           <div className={`flex items-center gap-1 mt-1 ${
//             isFromCurrentUser ? 'justify-end' : 'justify-start'
//           }`}>
//             <span className={`text-xs ${
//               isFromCurrentUser
//                 ? 'text-blue-100'
//                 : 'text-gray-500 dark:text-gray-400'
//             }`}>
//               {getMessageTime()}
//             </span>
//             {getStatusIcon()}
//           </div>
//         </div>

//         {/* Avatar for current user (optional) */}
//         {isFromCurrentUser && showAvatar && (
//           <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
//             {currentUser?.username?.charAt(0)?.toUpperCase() || 'Y'}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Message;
