import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UserPlus,
  UserCheck,
  MapPin,
  GraduationCap,
} from 'lucide-react'
import { motion } from 'framer-motion'

import UserAvatar from '../profile/UserAvatar'
import { followUser, unfollowUser } from '../../api/users'
import { useAuth } from '../../../../utils/AuthContext'

const UserCard = ({ user }) => {
  const { user: currentUser } = useAuth()

  const [loading, setLoading] = useState(false)

  const [isFollowing, setIsFollowing] = useState(
    user?.isFollowing || false,
  )

  if (!user) return null

  const isOwnProfile =
    currentUser &&
    (currentUser.id === user._id ||
      currentUser._id === user._id)

  const handleFollow = async e => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser || isOwnProfile) return

    try {
      setLoading(true)

      if (isFollowing) {
        await unfollowUser(user._id, currentUser)

        setIsFollowing(false)
      } else {
        await followUser(user._id, currentUser)

        setIsFollowing(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <Link
        to={`/unicollab/profile/${user._id}`}
      >
        <div
          className="
            h-full
            rounded-2xl
            border
            border-slate-800
            bg-[#10141d]
            p-6
            transition
            hover:border-blue-600/40
          "
        >
          <div className="flex flex-col items-center text-center">

            <UserAvatar
              user={user}
              width={84}
              height={84}
            />

            <h2 className="mt-4 text-lg font-semibold text-white">
              {user.firstName} {user.lastName}
            </h2>

            <p className="text-sm text-slate-400">
              @{user.username}
            </p>

            {user.bio && (
              <p
                className="
                  mt-4
                  line-clamp-3
                  text-sm
                  text-slate-400
                "
              >
                {user.bio}
              </p>
            )}

            <div className="mt-5 w-full space-y-2">

              {user.major && (
                <div className="flex items-center gap-2 text-sm text-slate-400">

                  <GraduationCap
                    className="h-4 w-4"
                  />

                  <span>
                    {user.major}
                  </span>

                </div>
              )}

              {user.university && (
                <div className="flex items-center gap-2 text-sm text-slate-400">

                  <MapPin
                    className="h-4 w-4"
                  />

                  <span>
                    {user.university}
                  </span>

                </div>
              )}

            </div>

            <div className="mt-6 flex w-full justify-around">

              <div>

                <p className="text-lg font-bold text-white">
                  {user.postCount || 0}
                </p>

                <p className="text-xs text-slate-500">
                  Posts
                </p>

              </div>

              <div>

                <p className="text-lg font-bold text-white">
                  {user.followerCount || 0}
                </p>

                <p className="text-xs text-slate-500">
                  Followers
                </p>

              </div>

              <div>

                <p className="text-lg font-bold text-white">
                  {user.followingCount || 0}
                </p>

                <p className="text-xs text-slate-500">
                  Following
                </p>

              </div>

            </div>

            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={loading}
                className={`
                  mt-6
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-4
                  py-3
                  font-medium
                  transition

                  ${
                    isFollowing
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }

                  ${
                    loading
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }
                `}
              >
                {loading ? (
                  <div
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white
                      border-t-transparent
                    "
                  />
                ) : isFollowing ? (
                  <>
                    <UserCheck
                      size={18}
                    />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus
                      size={18}
                    />
                    Follow
                  </>
                )}
              </button>
            )}

          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default UserCard