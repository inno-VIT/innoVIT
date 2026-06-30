import React from 'react'
import UserAvatar from './UserAvatar'

const UserMessengerEntry = ({ conservant, conversation, setConservant }) => {
  const isActive = conservant && conservant._id === conversation.recipient._id

  const formatTime = timestamp => {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div
      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
      onClick={() => setConservant(conversation.recipient)}
    >
      <div className='flex items-center space-x-3'>
        <UserAvatar user={conversation.recipient} height={40} width={40} />

        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
              {conversation.recipient.firstName}{' '}
              {conversation.recipient.lastName}
            </p>
            <span className='text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2'>
              {formatTime(conversation.lastMessageAt || conversation.updatedAt)}
            </span>
          </div>

          {conversation.lastMessage && (
            <div className='flex items-center justify-between mt-1'>
              <p className='text-xs text-gray-500 dark:text-gray-400 truncate flex-1'>
                {conversation.lastMessage.content}
              </p>
              {conversation.unreadCount > 0 && (
                <span className='bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2'>
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserMessengerEntry
