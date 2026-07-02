import React, { useState, useEffect } from 'react'
import { Edit, MessageCircle } from 'lucide-react'
import { useAuth } from '../../utils/AuthContext'
import ContentUpdateEditor from './ContentUpdateEditor'
import Loading from './Loading'
import { useNavigate } from 'react-router-dom'

const ProfileCard = ({
  profile,
  editing,
  handleEditing,
  handleSubmit,
  validate,
  handleMessage,
  className = '',
}) => {
  const [user, setUser] = useState(null)
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile) {
      setUser(profile.user || profile)
    }
  }, [profile])

  if (!user) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <Loading label='Loading profile' />
      </div>
    )
  }

  const isOwnProfile = currentUser && currentUser.id === user._id

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className='flex flex-col items-center space-y-4'>
        {/* Avatar */}
        <div className='w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold'>
          {user.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        {/* Username */}
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          {user.username}
        </h2>

        {/* Name */}
        {(user.firstName || user.lastName) && (
          <p className='text-gray-600 dark:text-gray-400 text-lg'>
            {user.firstName} {user.lastName}
          </p>
        )}

        {/* Bio Section */}
        <div className='text-center w-full'>
          {editing ? (
            <div className='w-full max-w-md mx-auto'>
              <ContentUpdateEditor
                handleSubmit={handleSubmit}
                originalContent={user.bio || user.biography || ''}
                validate={validate}
                onCancel={handleEditing}
                placeholder='Tell us about yourself...'
                maxLength={250}
              />
            </div>
          ) : user.bio || user.biography ? (
            <div>
              <p className='text-gray-700 dark:text-gray-300 text-center leading-relaxed'>
                <span className='font-semibold'>Bio: </span>
                {user.bio || user.biography}
              </p>
            </div>
          ) : (
            <p className='text-gray-500 dark:text-gray-400 italic'>
              No bio yet
              {isOwnProfile && ' - Click edit to add your bio'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 w-full max-w-xs'>
          {isOwnProfile && (
            <button
              onClick={handleEditing}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                editing
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Edit className='h-4 w-4' />
              {editing ? 'Cancel' : 'Edit Bio'}
            </button>
          )}

          {!isOwnProfile && currentUser && (
            <button
              onClick={handleMessage}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              <MessageCircle className='h-4 w-4' />
              Message
            </button>
          )}
        </div>

        {/* Stats */}
        <div className='flex justify-center gap-6 w-full max-w-xs'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900 dark:text-white'>
              {profile?.posts?.likeCount || user.likeCount || 0}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Likes
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900 dark:text-white'>
              {profile?.posts?.count || user.postCount || 0}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Posts
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900 dark:text-white'>
              {user.followerCount || 0}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Followers
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
