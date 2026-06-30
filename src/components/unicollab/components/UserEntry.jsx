import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, UserCheck } from 'lucide-react'
import { followUser, unfollowUser } from '../api/users'
import { useAuth } from '../../../utils/AuthContext'
import UserAvatar from './UserAvatar' // Add this import

const UserEntry = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false)
  const [isLoading, setIsLoading] = useState(false)
  const { user: currentUser } = useAuth()

  const handleFollow = async () => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(user._id, currentUser)
        setIsFollowing(false)
      } else {
        await followUser(user._id, currentUser)
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error following user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-between group'>
      <Link
        to={`/unicollab/profile/${user._id}`}
        className='flex items-center gap-3 flex-1 min-w-0 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors'
      >
        {/* Replace the custom avatar with UserAvatar component */}
        <UserAvatar user={user} height={40} width={40} />

        {/* User Info */}
        <div className='min-w-0 flex-1'>
          <p className='font-medium text-gray-900 dark:text-white truncate'>
            {user.firstName} {user.lastName}
          </p>
          <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
            @{user.username}
          </p>
        </div>
      </Link>

      {/* Follow Button */}
      {currentUser && currentUser._id !== user._id && (
        <button
          onClick={handleFollow}
          disabled={isLoading}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
            isFollowing
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <div className='w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin'></div>
          ) : isFollowing ? (
            <>
              <UserCheck className='h-3 w-3' />
              <span className='hidden sm:inline'>Following</span>
            </>
          ) : (
            <>
              <UserPlus className='h-3 w-3' />
              <span className='hidden sm:inline'>Follow</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default UserEntry
