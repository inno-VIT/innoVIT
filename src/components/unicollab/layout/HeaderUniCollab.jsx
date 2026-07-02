'use client'

import {
  Search,
  MessageCircle,
  Home,
  Users,
  Plus,
  User,
  LogOut,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../ui/Button.jsx'
import { Input } from '../../ui/Input.jsx'
import { useAuth } from '../../../utils/AuthContext.jsx'
import { useState } from 'react'

export default function HeaderUniCollab() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = e => {
    e.preventDefault()
    if (search.trim()) {
      navigate(
        `/unicollab/search?${new URLSearchParams({ query: search.trim() })}`,
      )
      setSearch('')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/unicollab/create-post')
  }

  return (
    // <header className='sticky top-0 z-20 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-200 dark:border-gray-800'>
    <header className='sticky top-[80px] z-20 w-full bg-background border-b border-gray-200 dark:border-gray-800'>
      {/* <div className='container flex h-16 items-center justify-between'> */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      {/* <div className="flex h-16 items-center justify-between px-8"> */}
        {/* Left Section - Logo and Navigation */}
        <div className='flex items-center gap-6 md:gap-8'>
          <Link to='/unicollab' className='flex items-center space-x-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600'>
              <span className='font-bold text-white text-sm'>UC</span>
            </div>
            <span className='hidden sm:inline-block font-bold text-gray-900 dark:text-white'>
              UniCollab
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className='hidden md:flex items-center gap-6'>
            <Link
              to='/unicollab'
              className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
            >
              <Home className='h-4 w-4' />
              Home
            </Link>
            <Link
              to='/unicollab/users'
              className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
            >
              <Users className='h-4 w-4' />
              Discover
            </Link>
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className='flex-1 max-w-2xl mx-8'>
          <form onSubmit={handleSearch} className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search posts, users...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white'
            />
          </form>
        </div>

        {/* Right Section - User Actions */}
        <div className='flex items-center gap-3'>
          {/* Create Post Button */}
          <Button
            onClick={handleCreatePost}
            className='hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white'
            size='sm'
          >
            <Plus className='h-4 w-4' />
            <span className='hidden lg:inline'>Create Post</span>
          </Button>

          {/* Messages */}
          {isAuthenticated && (
            <Link
              to='/unicollab/messages'
              className='p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
              title='Messages'
            >
              <MessageCircle className='h-5 w-5' />
            </Link>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className='flex items-center gap-3'>
              {/* User Profile */}
              <Link
                to={`/unicollab/profile/${user?._id}`}
                className='flex items-center gap-2 p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
              >
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className='hidden lg:inline text-sm font-medium'>
                  {user?.firstName || user?.username}
                </span>
              </Link>

              {/* Logout */}
              <Button
                onClick={handleLogout}
                variant='ghost'
                size='sm'
                className='hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              >
                <LogOut className='h-4 w-4' />
                <span className='hidden lg:inline'>Logout</span>
              </Button>
            </div>
          ) : (
            /* Auth Buttons */
            <div className='flex items-center gap-2'>
              <Link to='/login'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-gray-700 dark:text-gray-300'
                >
                  Login
                </Button>
              </Link>
              <Link to='/signup'>
                <Button
                  size='sm'
                  className='bg-blue-600 hover:bg-blue-700 text-white'
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search (hidden on desktop) */}
      <div className='md:hidden border-t border-gray-200 dark:border-gray-800'>
        <form onSubmit={handleSearch} className='p-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search posts, users...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white'
            />
          </div>
        </form>
      </div>
    </header>
  )
}

// 'use client'

// import { Search } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import { Button } from '../../ui/Button.jsx'
// import { Input } from '../../ui/Input.jsx'

// export default function HeaderUniCollab() {
//   return (
//     <header className='sticky top-0 z-20 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60'>
//       <div className='container flex h-20 items-center justify-center '>
//         <div className='flex items-center gap-4 md:gap-8'>
//           <Link to='/' className='flex items-center space-x-2'>
//             <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-inherit'>
//               <span className='font-bold text-white'>UC</span>
//             </div>
//           </Link>
//           <div className='hidden md:flex'>
//             <div className='relative w-full'>
//               <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground text-textColor' />
//               <Input
//                 placeholder='Search...'
//                 className='w-[500px] pl-9 text-black bg-secondary border-0'
//               />
//             </div>
//           </div>
//         </div>
//         <div className='flex flex-1 items-center justify-end space-x-4'></div>
//       </div>
//     </header>
//   )
// }
