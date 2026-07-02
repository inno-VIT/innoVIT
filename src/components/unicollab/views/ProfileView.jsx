import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
// import Layout from '../layout/Layout'
import Loading from '../components/shared/Loading'
import ErrorAlert from '../components/shared/ErrorAlert'
import { getUser } from '../api/users'
import { useAuth } from '../../../utils/AuthContext'
import ProfileTabs from '../components/profile/ProfileTabs'
import PostBrowser from '../components/PostBrowser'
import CommentBrowser from '../components/comments/CommentBrowser'

const ProfileView = () => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('posts')
  const [error, setError] = useState('')
  const params = useParams()
  const { user: currentUser } = useAuth()

  console.log("params:", params)
console.log("currentUser:", currentUser)

  // const fetchUser = async () => {
  //   setLoading(true)
  //   try {
  //     const data = await getUser(params.id)
  //     if (data.error) {
  //       setError(data.error)
  //     } else {
  //       setProfile(data)
  //     }
  //   } catch (err) {
  //     setError('Failed to load profile')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // useEffect(() => {
  //   if (params.id) {
  //     fetchUser()
  //   }
  // }, [params.id])


const fetchUser = async () => {
  setLoading(true)

  try {
    const userId = params.id || currentUser?._id

    console.log('Profile userId:', userId)

    if (!userId) {
      setError('No user ID found')
      return
    }

    const data = await getUser(userId)

    if (data.error) {
      setError(data.error)
    } else {
      setProfile(data)
    }
  } catch (err) {
    console.error(err)
    setError('Failed to load profile')
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  fetchUser()
}, [params.id, currentUser])

  // Check if this is the current user's profile
  const currentUserId = currentUser?.id || currentUser?._id
const isOwnProfile =
  profile &&
  currentUserId === profile._id

  let tabs
  if (profile) {
    tabs = {
      posts: <PostBrowser profileUser={profile} contentType='posts' />,
      liked: <PostBrowser profileUser={profile} contentType='liked' />,
      comments: <CommentBrowser profileUser={profile} />,
    }
  }

  return (
    <>
      <div className='max-w-6xl mx-auto'>
        {loading ? (
          <Loading />
        ) : profile ? (
          <div className='space-y-6'>
            {/* Profile Header */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
              <div className='flex items-center space-x-4'>
                <div className='w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
                  {profile.firstName?.charAt(0) || 'U'}
                </div>
                <div className='flex-1'>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className='text-gray-600 dark:text-gray-400'>
                    @{profile.username}
                  </p>
                  {profile.bio && (
                    <p className='text-gray-700 dark:text-gray-300 mt-2'>
                      {profile.bio}
                    </p>
                  )}
                </div>
                {!isOwnProfile && (
                  <button className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'>
                    Follow
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className='flex space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600'>
                <div className='text-center'>
                  <div className='text-lg font-bold text-gray-900 dark:text-white'>
                    {profile.followerCount || 0}
                  </div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    Followers
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-gray-900 dark:text-white'>
                    {profile.followingCount || 0}
                  </div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    Following
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-gray-900 dark:text-white'>
                    {profile.postCount || 0}
                  </div>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    Posts
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <ProfileTabs
              tab={tab}
              setTab={setTab}
              isOwnProfile={isOwnProfile}
            />

            {/* Tab Content */}
            {tabs && tabs[tab]}
          </div>
        ) : (
          error && <ErrorAlert error={error} />
        )}
      </div>
    </>
  )
}

export default ProfileView
