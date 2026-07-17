import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { motion } from 'framer-motion'

import Loading from '../components/shared/Loading'
import UserCard from '../components/users/UserCard'
import { getRandomUsers } from '../api/users'

const UsersView = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getRandomUsers({
          size: 100,
        })

        if (Array.isArray(response)) {
          setUsers(response)
        } else if (Array.isArray(response?.users)) {
          setUsers(response.users)
        } else if (Array.isArray(response?.data)) {
          setUsers(response.data)
        } else {
          setUsers([])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="py-20">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-blue-600 p-3">
            <Users className="h-7 w-7 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Discover Students
            </h1>

            <p className="text-slate-400">
              Connect with students from your university.
            </p>
          </div>

        </div>
      </motion.div>

      <div
        className="
          grid
          gap-6
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {users.map(user => (
          <UserCard
            key={user._id}
            user={user}
          />
        ))}
      </div>

    </div>
  )
}

export default UsersView