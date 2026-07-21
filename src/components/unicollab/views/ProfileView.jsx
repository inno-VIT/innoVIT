import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Loading from '../components/shared/Loading'
import ErrorAlert from '../components/shared/ErrorAlert'
import {
  getUser,
  followUser,
  unfollowUser,
} from '../api/users'
import { useAuth } from '../../../utils/AuthContext'
import ProfileTabs from '../components/profile/ProfileTabs'
import PostBrowser from '../components/feed/PostBrowser'
import CommentBrowser from '../components/comments/CommentBrowser'

const ProfileView = () => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('posts')
  const [error, setError] = useState('')

  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const params = useParams()
  const { user: currentUser } = useAuth()

  const fetchUser = async () => {
    setLoading(true)

    try {
      const userId = params.id || currentUser?._id || currentUser?.id

      if (!userId) {
        setError('No user ID found')
        return
      }

      const data = await getUser(userId)

      if (data.error) {
        setError(data.error)
      } else {
        setProfile(data)
        setIsFollowing(Boolean(data.isFollowing))
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

  useEffect(() => {
    if (profile) {
      setIsFollowing(Boolean(profile.isFollowing))
    }
  }, [profile?.isFollowing])

  const handleFollow = async () => {
    if (!currentUser || !profile || followLoading) return

    const wasFollowing = isFollowing

    // Optimistic UI update
    setIsFollowing(!wasFollowing)

    setProfile(prev => ({
      ...prev,
      isFollowing: !wasFollowing,
      followerCount: Math.max(
        0,
        (prev?.followerCount || 0) + (wasFollowing ? -1 : 1),
      ),
    }))

    try {
      setFollowLoading(true)

      if (wasFollowing) {
        await unfollowUser(profile._id, currentUser)
      } else {
        await followUser(profile._id, currentUser)
      }
    } catch (err) {
      console.error('Follow error:', err)

      // Rollback on failure
      setIsFollowing(wasFollowing)

      setProfile(prev => ({
        ...prev,
        isFollowing: wasFollowing,
        followerCount: Math.max(
          0,
          (prev?.followerCount || 0) + (wasFollowing ? 1 : -1),
        ),
      }))
    } finally {
      setFollowLoading(false)
    }
  }

  const currentUserId = currentUser?.id || currentUser?._id

  const isOwnProfile =
    profile &&
    currentUserId &&
    currentUserId.toString() === profile._id.toString()

  let tabs

  if (profile) {
    tabs = {
      posts: (
        <PostBrowser
          profileUser={profile}
          contentType="posts"
        />
      ),
      liked: (
        <PostBrowser
          profileUser={profile}
          contentType="liked"
        />
      ),
      comments: (
        <CommentBrowser profileUser={profile} />
      ),
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {loading ? (
        <Loading />
      ) : profile ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.firstName?.charAt(0) || 'U'}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.firstName} {profile.lastName}
                </h1>

                <p className="text-gray-600 dark:text-gray-400">
                  @{profile.username}
                </p>

                {profile.bio && (
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {profile.bio}
                  </p>
                )}
              </div>

              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`rounded-md px-4 py-2 text-white transition-colors disabled:opacity-60 ${
                    isFollowing
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {followLoading
                    ? 'Please wait...'
                    : isFollowing
                    ? 'Following'
                    : 'Follow'}
                </button>
              )}
            </div>

            <div className="mt-4 flex space-x-6 border-t border-gray-200 pt-4 dark:border-gray-600">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {profile.followerCount ?? 0}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Followers
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {profile.followingCount ?? 0}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Following
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {profile.postCount ?? 0}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Posts
                </div>
              </div>
            </div>
          </div>

          <ProfileTabs
            tab={tab}
            setTab={setTab}
            isOwnProfile={isOwnProfile}
          />

          {tabs && tabs[tab]}
        </div>
      ) : (
        error && <ErrorAlert error={error} />
      )}
    </div>
  )
}

export default ProfileView