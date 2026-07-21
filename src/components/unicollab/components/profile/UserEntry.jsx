import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, UserCheck } from 'lucide-react'
import { followUser, unfollowUser } from '../../api/users'
import { useAuth } from '../../../../utils/AuthContext'
import UserAvatar from './UserAvatar'

const UserEntry = ({ user, onFollowChange }) => {
  const { user: currentUser } = useAuth()

  if (!user) return null

  const [isFollowing, setIsFollowing] = useState(
    user?.isFollowing || false,
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsFollowing(user?.isFollowing || false)
  }, [user?.isFollowing])

  const handleFollow = async () => {
    if (!currentUser || !user || isLoading) return

    try {
      setIsLoading(true)

      if (isFollowing) {
        await unfollowUser(user._id, currentUser)

        setIsFollowing(false)
        onFollowChange?.(user._id, false)
      } else {
        await followUser(user._id, currentUser)

        setIsFollowing(true)
        onFollowChange?.(user._id, true)
      }
    } catch (error) {
      console.error('Error following user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between group">
      <Link
        to={`/unicollab/profile/${user?._id || user?.id}`}
        className="flex flex-1 min-w-0 items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <UserAvatar user={user} height={40} width={40} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </p>

          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            @{user.username}
          </p>
        </div>
      </Link>

      {currentUser &&
        (currentUser._id || currentUser.id) !== user._id && (
          <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isFollowing ? (
              <>
                <UserCheck className="h-3 w-3" />
                <span className="hidden sm:inline">
                  Following
                </span>
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3" />
                <span className="hidden sm:inline">
                  Follow
                </span>
              </>
            )}
          </button>
        )}
    </div>
  )
}

export default UserEntry