import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { getRandomUsers } from '../api/users'
import Loading from './Loading'
import UserEntry from './UserEntry'

const FindUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async (refresh = false) => {
    try {
      setError(null)

      if (refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await getRandomUsers({ size: 5 })

      let fetchedUsers = []

      if (Array.isArray(response)) {
        fetchedUsers = response
      } else if (Array.isArray(response?.users)) {
        fetchedUsers = response.users
      } else if (Array.isArray(response?.data)) {
        fetchedUsers = response.data
      } else {
        fetchedUsers = []
      }

      setUsers(fetchedUsers)
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([])
      setError('Unable to load users.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-slate-800 bg-[#10141d]"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-600/20 p-2">
            <Users className="h-5 w-5 text-blue-500" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Discover Students
            </h2>

            <p className="text-xs text-slate-400">
              Meet new people from your campus
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-5 w-5 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      <div className="p-4">
                {loading ? (
          <div className="py-10">
            <Loading />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={() => fetchUsers(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-slate-500" />

            <h3 className="font-medium text-white">
              No users found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Try refreshing to discover more students.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.05,
                  }}
                >
                  <UserEntry
                    userId={user._id}
                    username={user.username}
                    avatar={user.avatar}
                    bio={user.bio}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        <Link
          to="/unicollab/search"
          className="mt-5 flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
        >
          View All Users
        </Link>
      </div>
    </motion.div>
  )
}

export default FindUsers


// < ----------------- Works completely fine, but the code is commented out for now. ----------------- >  
// import React, { useEffect, useState } from 'react'
// import { AiOutlineUser } from 'react-icons/ai'
// import { MdRefresh } from 'react-icons/md'
// import { Link } from 'react-router-dom'
// import { getRandomUsers } from '../api/users'
// import Loading from './Loading'
// import UserAvatar from './UserAvatar'
// // import HorizontalStack from '../../ui/HorizontalStack'
// import UserEntry from './UserEntry'

// const FindUsers = () => {
//   const [loading, setLoading] = useState(true)
//   const [users, setUsers] = useState(null)

//   const fetchUsers = async () => {
//     setLoading(true)
//     const data = await getRandomUsers({ size: 5 })
//     setLoading(false)
//     setUsers(data)
//   }

//   useEffect(() => {
//     fetchUsers()
//   }, [])

//   const handleClick = () => {
//     fetchUsers()
//   }

//   return (
//     <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6'>
//       <div className='flex flex-col space-y-4'>
//         {/* Header */}
//         <div className='flex justify-between items-center'>
//           <div className='flex items-center space-x-2'>
//             <AiOutlineUser className='w-5 h-5 text-gray-600' />
//             <h3 className='text-lg font-semibold text-gray-800'>Find Others</h3>
//           </div>
//           <button
//             onClick={handleClick}
//             disabled={loading}
//             className={`p-2 rounded-full transition-colors ${
//               loading
//                 ? 'text-gray-400 cursor-not-allowed'
//                 : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
//             }`}
//           >
//             <MdRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
//           </button>
//         </div>

//         {/* Divider */}
//         <div className='border-t border-gray-200'></div>

//         {/* Users List */}
//         {/* {loading ? (
//           <Loading />
//         ) : (
//           users &&
//           users.map(user => (
//             <UserEntry
//               username={user.username}
//               key={user.username}
//               userId={user._id}
//               avatar={user.avatar}
//               bio={user.bio}
//             />
//           ))
//         )} */}
//         {loading ? (
//           <Loading />
//         ) : Array.isArray(users) ? ( users.length > 0 ? (
//           users.map(user => (
//             <UserEntry
//           key = {user._id}
//           username = {user.username}
//           userId = {user._id}
//           avatar = {user.avatar}
//           bio = {user.bio}
//         />
//           ))
//         ) : (
//           <div className='text-center py-6 text-gray-500'>
//             No users found. Try refreshing.
//           </div>
//         )) : (
//           <div className='text-center py-6 text-gray-500'>
//             Error fetching users. Please try again later.
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && (!users || users.length === 0) && (
//           <div className='text-center py-4'>
//             <p className='text-gray-500'>No users found</p>
//             <button
//               onClick={handleClick}
//               className='mt-2 text-blue-600 hover:text-blue-800 font-medium'
//             >
//               Try again
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default FindUsers
