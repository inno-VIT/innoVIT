import React from 'react'
import UserMessengerEntry from './UserMessengerEntry'
import Loading from './Loading'

const UserMessengerEntries = ({
  conservant,
  conversations,
  setConservant,
  loading,
}) => {
  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <Loading />
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header with icon */}
      <div className='p-4 border-b border-gray-200 dark:border-gray-600'>
        <div className='flex items-center gap-2'>
          <span className='text-xl'>💬</span>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Your Conversations
          </h2>
        </div>
      </div>

      {/* Conversations List */}
      <div className='flex-1 overflow-y-auto'>
        {conversations.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center text-center p-8'>
            <span className='text-4xl mb-4'>😔</span>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              No Conversations
            </h3>
            <p className='text-gray-500 dark:text-gray-400 text-sm max-w-xs'>
              Click 'Message' on another user's profile to start a conversation
            </p>
          </div>
        ) : (
          <div className='divide-y divide-gray-200 dark:divide-gray-600'>
            {conversations.map(conversation => (
              <UserMessengerEntry
                key={conversation._id || conversation.recipient?.username}
                conservant={conservant}
                conversation={conversation}
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
