import { useState } from 'react'
import {
  Search,
  Bell,
  MessageCircle,
  Plus,
  LogOut,
  Menu,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { useAuth } from '../../../utils/AuthContext'

export default function HeaderUniCollab() {
  const navigate = useNavigate()

  const { user, logout, isAuthenticated } = useAuth()

  const [search, setSearch] = useState('')

  const handleSearch = e => {
    e.preventDefault()

    if (!search.trim()) return

    navigate(
      `/unicollab/search?query=${encodeURIComponent(search.trim())}`,
    )

    setSearch('')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header
      className="
        
        top-[72px]
        z-40
        border-b
        border-white/10
        bg-[#080912]/80
        backdrop-blur-xl
      "
    >
      <div className="mx-auto ">

        <div
          className="
            h-16
            px-6
            flex
            items-center
            justify-between
            gap-6
          "
        >

          {/* Left */}

          <div className="flex items-center gap-6">

            <Link
              to="/unicollab"
              className="flex items-center gap-3"
            >
              <div
                className="
                  h-10
                  w-10
                  rounded-xl
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  text-white
                  font-bold
                "
              >
                UC
              </div>

              <div className="hidden sm:block">

                <h1 className="font-bold text-lg text-white">
                  UniCollab
                </h1>

                <p className="text-xs text-gray-400">
                  Community
                </p>

              </div>

            </Link>

          </div>

          {/* Search */}

          <div className="flex-1 max-w-3xl">

            <form
              onSubmit={handleSearch}
              className="relative"
            >

              <Search
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  h-4
                  w-4
                  text-gray-400
                "
              />

              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts, users, tags..."
                className="
                  pl-11
                  h-11
                  rounded-xl
                  border-white/10
                  bg-[#151722]
                  text-white
                  placeholder:text-gray-500
                "
              />

            </form>

          </div>

          {/* Right */}

          <div className="flex items-center gap-2">

            <Button
              onClick={() => navigate('/unicollab/create-post')}
              className="
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
              "
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/unicollab/messages')}
              className="rounded-xl"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>

            {isAuthenticated && (

              <>
                <Link to={`/unicollab/profile/${user?._id || user?.id}`}>
                  <div
                    className="
                      h-10
                      w-10
                      rounded-full
                      bg-blue-600
                      flex
                      items-center
                      justify-center
                      text-white
                      font-semibold
                      cursor-pointer
                    "
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                </Button>

              </>

            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

          </div>

        </div>
      </div>
    </header>
  )
}


