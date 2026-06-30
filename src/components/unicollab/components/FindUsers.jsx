import React, { useEffect, useState } from 'react'
import { AiOutlineUser } from 'react-icons/ai'
import { MdRefresh } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { getRandomUsers } from '../api/users'
import Loading from './Loading'
import UserAvatar from './UserAvatar'
// import HorizontalStack from '../../ui/HorizontalStack'
import UserEntry from './UserEntry'

const FindUsers = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    const data = await getRandomUsers({ size: 5 })
    setLoading(false)
    setUsers(data)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleClick = () => {
    fetchUsers()
  }

  return (
    <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
      <div className='flex flex-col space-y-4'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            <AiOutlineUser className='w-5 h-5 text-gray-600' />
            <h3 className='text-lg font-semibold text-gray-800'>Find Others</h3>
          </div>
          <button
            onClick={handleClick}
            disabled={loading}
            className={`p-2 rounded-full transition-colors ${
              loading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Divider */}
        <div className='border-t border-gray-200'></div>

        {/* Users List */}
        {loading ? (
          <Loading />
        ) : (
          users &&
          users.map(user => (
            <UserEntry
              username={user.username}
              key={user.username}
              userId={user._id}
              avatar={user.avatar}
              bio={user.bio}
            />
          ))
        )}

        {/* Empty State */}
        {!loading && (!users || users.length === 0) && (
          <div className='text-center py-4'>
            <p className='text-gray-500'>No users found</p>
            <button
              onClick={handleClick}
              className='mt-2 text-blue-600 hover:text-blue-800 font-medium'
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FindUsers
