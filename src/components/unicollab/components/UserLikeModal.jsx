import React, { useEffect, useRef, useState } from 'react'
import { getUserLikes } from '../api/posts'
import Loading from './shared/Loading'
import UserEntry from '../components/profile/UserEntry'

const UserLikeModal = ({ postId, open, setOpen }) => {
  const [userLikes, setUserLikes] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMorePages, setHasMorePages] = useState(true)
  const scrollBoxRef = useRef(null)

  const handleClose = () => setOpen(false)

  const handleBackdropClick = event => {
    event.stopPropagation()
    setOpen(false)
  }

  const fetchUserLikes = async () => {
    if (loading || !hasMorePages) return

    setLoading(true)

    let anchor = ''
    if (userLikes && userLikes.length > 0) {
      anchor = userLikes[userLikes.length - 1].id
    }

    try {
      const data = await getUserLikes(postId, anchor)

      setLoading(false)
      if (data.success) {
        setUserLikes([...userLikes, ...data.userLikes])
        setHasMorePages(data.hasMorePages)
      }
    } catch (error) {
      console.error('Error fetching user likes:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      // Reset state when opening
      setUserLikes([])
      setHasMorePages(true)
      fetchUserLikes()
    }
  }, [open])

  const handleScroll = () => {
    const scrollBox = scrollBoxRef.current

    if (
      scrollBox.scrollTop + scrollBox.clientHeight >
      scrollBox.scrollHeight - 12
    ) {
      fetchUserLikes()
    }
  }

  useEffect(() => {
    if (!scrollBoxRef.current) {
      return
    }
    const scrollBox = scrollBoxRef.current
    scrollBox.addEventListener('scroll', handleScroll)

    return () => {
      scrollBox.removeEventListener('scroll', handleScroll)
    }
  }, [userLikes, loading, hasMorePages])

  if (!open) return null

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      onClick={handleBackdropClick}
    >
      <div
        ref={scrollBoxRef}
        className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-96 overflow-y-auto'
        onClick={e => e.stopPropagation()}
      >
        <div className='p-6'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
            Liked by
          </h2>

          <div className='space-y-3'>
            {userLikes && userLikes.length > 0
              ? userLikes.map(like => (
                  <UserEntry user={like} key={like._id || like.username} />
                ))
              : !loading && (
                  <p className='text-gray-500 dark:text-gray-400 text-center py-4'>
                    No likes yet
                  </p>
                )}
          </div>

          {loading && (
            <div className='flex justify-center py-4'>
              <Loading />
            </div>
          )}

          {hasMorePages && !loading && userLikes.length > 0 && (
            <div className='py-6'></div> // Space for infinite scroll trigger
          )}
        </div>
      </div>
    </div>
  )
}

export default UserLikeModal
