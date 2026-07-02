// import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Compass,
  Hash,
  Users,
  Trophy,
  BookOpen,
  MessageSquare,
  Settings,
  Info,
  Shield,
  FileText,
  User,
} from 'lucide-react'
import { useAuth } from '../../../utils/AuthContext'

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  const isActive = path => {
    if (path === '/unicollab') {
      return location.pathname === '/unicollab'
    }

    return location.pathname.startsWith(path)
  }

  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      path: '/unicollab',
    },
    {
      title: 'Explore',
      icon: Compass,
      path: '/unicollab/explore',
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      path: '/unicollab/messages',
    },
    {
      title: 'Community',
      icon: Users,
      path: '/unicollab/community',
    },
    {
      title: 'Tags',
      icon: Hash,
      path: '/unicollab/tags',
    },
    {
      title: 'Challenges',
      icon: Trophy,
      path: '/unicollab/challenges',
    },
    {
      title: 'Blog',
      icon: BookOpen,
      path: '/unicollab/blog',
    },
  ]

  const aboutItems = [
    {
      title: 'About',
      icon: Info,
      path: '/about',
    },
    {
      title: 'Code of Conduct',
      icon: Shield,
      path: '/code-of-conduct',
    },
    {
      title: 'Privacy Policy',
      icon: FileText,
      path: '/privacy',
    },
    {
      title: 'Terms',
      icon: FileText,
      path: '/terms',
    },
  ]

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-72 border-r border-slate-800 bg-[#080912]">
      <div className="flex h-full w-full flex-col overflow-y-auto px-5 py-6">

        {/* Profile */}

        <div className="mb-8 flex items-center gap-3 rounded-xl border border-slate-800 bg-[#10141d] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {user?.username?.charAt(0)?.toUpperCase() || <User size={20} />}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {user?.firstName || user?.username || 'Guest User'}
            </h3>

            <p className="truncate text-xs text-slate-400">
              {user?.email || 'Not signed in'}
            </p>
          </div>
        </div>

        {/* Navigation */}

        <div className="space-y-1">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </p>

          {menuItems.map(item => {
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />

                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>

        <div className="my-8 border-t border-slate-800" />

        {/* About */}

        <div className="space-y-1">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            About
          </p>

          {aboutItems.map(item => {
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />

                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
                <div className="mt-auto">

          <div className="rounded-xl border border-slate-800 bg-[#10141d] p-4">
            {isAuthenticated ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h4 className="truncate font-semibold text-white">
                      {user?.firstName || user?.username}
                    </h4>

                    <p className="truncate text-sm text-slate-400">
                      @{user?.username}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/unicollab/profile/${user?.id}`}
                  className="mb-2 flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
                >
                  View Profile
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Link>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Sign in to participate in discussions and connect with your
                  university community.
                </p>

                <Link
                  to="/login"
                  className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="block rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} UniCollab</p>
            <p className="mt-1">
              Built for the VIT student community.
            </p>
          </div>

        </div>

      </div>
    </aside>
  )
}

export default Sidebar

// < ---------------------- Works completely fine ---------------------- >
// import React, { useState, useEffect } from 'react'
// import { Link, useLocation } from 'react-router-dom'
// import {
//   Home,
//   Users,
//   Tag,
//   HelpCircle,
//   Trophy,
//   BookOpen,
//   Info,
//   Shield,
//   FileText,
//   TrendingUp,
//   User,
// } from 'lucide-react'
// import { useAuth } from '../../../utils/AuthContext'

// const Sidebar = () => {
//   const location = useLocation()
//   const { user, isAuthenticated } = useAuth()
//   const [profilePicture, setProfilePicture] = useState('')

//   // Check if a link is active
//   const isActiveLink = path => {
//     return location.pathname === path
//   }

//   // Generate random avatar similar to Profile.jsx
//   useEffect(() => {
//     if (user?.username) {
//       generateRandomAvatar()
//     }
//   }, [user?.username])

//   const generateRandomAvatar = () => {
//     const colors = [
//       '#FF6B6B',
//       '#4ECDC4',
//       '#45B7D1',
//       '#96CEB4',
//       '#FFEAA7',
//       '#DDA0DD',
//       '#98D8C8',
//       '#F7DC6F',
//       '#BB8FCE',
//       '#85C1E9',
//       '#F8C471',
//       '#82E0AA',
//       '#F1948A',
//       '#85C1E9',
//       '#D7BDE2',
//     ]
//     const randomColor = colors[Math.floor(Math.random() * colors.length)]
//     const initials = user?.username
//       ? user.username.charAt(0).toUpperCase()
//       : 'U'

//     // Create SVG avatar
//     const svg = `
//       <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
//         <rect width="48" height="48" fill="${randomColor}" rx="24"/>
//         <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
//               fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
//           ${initials}
//         </text>
//       </svg>
//     `
//     setProfilePicture(`data:image/svg+xml;base64,${btoa(svg)}`)
//   }

//   return (
//     <div className='lg:fixed lg:top-[12vh] lg:bottom-0 lg:z-20 lg:flex lg:w-72 lg:flex-col bg-secondary m-2 rounded-2xl flex flex-col h-[calc(100vh-14vh)] dark:bg-secondary dark:text-gray-50'>
//       {/* Scrollable Content Area */}
//       <div className='flex-1 flex flex-col overflow-hidden p-3'>
//         <div className='space-y-3 flex-1 overflow-y-auto'>
//           <div className='flex items-center justify-between'>
//             <h2 className='text-lg font-semibold'>Dashboard</h2>
//           </div>

//           {/* Community Stats */}
//           <div className='bg-background rounded-lg p-4 space-y-3'>
//             <h3 className='font-semibold text-sm flex items-center gap-2'>
//               <TrendingUp className='w-4 h-4' />
//               Community Stats
//             </h3>
//             <div className='space-y-2'>
//               <div className='flex items-center justify-between text-xs'>
//                 <span className='text-muted-foreground'>Total Posts</span>
//                 <span className='font-bold text-white'>0</span>
//               </div>
//               <div className='flex items-center justify-between text-xs'>
//                 <span className='text-muted-foreground'>Active Users</span>
//                 <span className='font-bold text-green-500'>0</span>
//               </div>
//               <div className='flex items-center justify-between text-xs'>
//                 <span className='text-muted-foreground'>Total Comments</span>
//                 <span className='font-bold text-blue-500'>0</span>
//               </div>
//             </div>
//           </div>

//           <div className='flex-1'>
//             <ul className='space-y-1 text-sm'>
//               <span className='font-semibold text-lg'>UniCollab++</span>

//               {/* Home Section */}
//               <li
//                 className={`rounded-sm transition-all duration-200 ${
//                   isActiveLink('/unicollab') ? 'bg-primary/10' : ''
//                 }`}
//               >
//                 <Link
//                   to='/unicollab'
//                   className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                 >
//                   <Home
//                     className={`w-5 h-5 transition-all duration-200 ${
//                       isActiveLink('/unicollab')
//                         ? ''
//                         : 'text-gray-300 group-hover:text-gray-700'
//                     }`}
//                   />
//                   <span
//                     className={`transition-all duration-200 ${
//                       isActiveLink('/unicollab')
//                         ? 'text-white font-semibold'
//                         : 'group-hover:text-blue-400'
//                     }`}
//                   >
//                     Home
//                   </span>
//                 </Link>
//               </li>

//               {/* UniCollab++ Section */}
//               <li
//                 className={`rounded-sm transition-all duration-200 ${
//                   isActiveLink('/unicollab-plus') ? 'bg-primary/10' : ''
//                 }`}
//               >
//                 <Link
//                   to='/unicollab-plus'
//                   className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                 >
//                   <Users
//                     className={`w-5 h-5 transition-all duration-200 ${
//                       isActiveLink('/unicollab-plus')
//                         ? ''
//                         : 'text-gray-300 group-hover:text-gray-700'
//                     }`}
//                   />
//                   <span
//                     className={`transition-all duration-200 ${
//                       isActiveLink('/unicollab-plus')
//                         ? 'text-white font-semibold'
//                         : 'group-hover:text-blue-400'
//                     }`}
//                   >
//                     UniCollab++
//                   </span>
//                 </Link>
//               </li>

//               {/* Tags Section */}
//               <li
//                 className={`rounded-sm transition-all duration-200 ${
//                   isActiveLink('/tags') ? 'bg-primary/10' : ''
//                 }`}
//               >
//                 <Link
//                   to='/tags'
//                   className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                 >
//                   <Tag
//                     className={`w-5 h-5 transition-all duration-200 ${
//                       isActiveLink('/tags')
//                         ? ''
//                         : 'text-gray-300 group-hover:text-gray-700'
//                     }`}
//                   />
//                   <span
//                     className={`transition-all duration-200 ${
//                       isActiveLink('/tags')
//                         ? 'text-white font-semibold'
//                         : 'group-hover:text-blue-400'
//                     }`}
//                   >
//                     Tags
//                   </span>
//                 </Link>
//               </li>

//               {/* UniCollab Help Section */}
//               <li
//                 className={`rounded-sm transition-all duration-200 ${
//                   isActiveLink('/help') ? 'bg-primary/10' : ''
//                 }`}
//               >
//                 <Link
//                   to='/help'
//                   className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                 >
//                   <HelpCircle
//                     className={`w-5 h-5 transition-all duration-200 ${
//                       isActiveLink('/help')
//                         ? ''
//                         : 'text-gray-300 group-hover:text-gray-700'
//                     }`}
//                   />
//                   <span
//                     className={`transition-all duration-200 ${
//                       isActiveLink('/help')
//                         ? 'text-white font-semibold'
//                         : 'group-hover:text-blue-400'
//                     }`}
//                   >
//                     UniCollab Help
//                   </span>
//                 </Link>
//               </li>

//               {/* Challenges Section */}
//               <li
//                 className={`rounded-sm transition-all duration-200 ${
//                   isActiveLink('/challenges') ? 'bg-primary/10' : ''
//                 }`}
//               >
//                 <Link
//                   to='/challenges'
//                   className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                 >
//                   <Trophy
//                     className={`w-5 h-5 transition-all duration-200 ${
//                       isActiveLink('/challenges')
//                         ? ''
//                         : 'text-gray-300 group-hover:text-gray-700'
//                     }`}
//                   />
//                   <span
//                     className={`transition-all duration-200 ${
//                       isActiveLink('/challenges')
//                         ? 'text-white font-semibold'
//                         : 'group-hover:text-blue-400'
//                     }`}
//                   >
//                     Challenges
//                   </span>
//                 </Link>
//               </li>

//               {/* UniCollab Blog Section */}
//               <li
//                 className={`rounded-sm transition-all duration-200 ${
//                   isActiveLink('/blog') ? 'bg-primary/10' : ''
//                 }`}
//               >
//                 <Link
//                   to='/blog'
//                   className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                 >
//                   <BookOpen
//                     className={`w-5 h-5 transition-all duration-200 ${
//                       isActiveLink('/blog')
//                         ? ''
//                         : 'text-gray-300 group-hover:text-gray-700'
//                     }`}
//                   />
//                   <span
//                     className={`transition-all duration-200 ${
//                       isActiveLink('/blog')
//                         ? 'text-white font-semibold'
//                         : 'group-hover:text-blue-400'
//                     }`}
//                   >
//                     UniCollab Blog
//                   </span>
//                 </Link>
//               </li>
//             </ul>

//             {/* About Section */}
//             <div className='mt-6'>
//               <h3 className='font-semibold text-lg'>About the Platform</h3>
//               <ul className='space-y-1 text-sm'>
//                 <li
//                   className={`rounded-sm transition-all duration-200 ${
//                     isActiveLink('/about') ? 'bg-primary/10' : ''
//                   }`}
//                 >
//                   <Link
//                     to='/about'
//                     className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                   >
//                     <Info
//                       className={`w-4 h-4 transition-all duration-200 ${
//                         isActiveLink('/about')
//                           ? ''
//                           : 'text-gray-300 group-hover:text-gray-700'
//                       }`}
//                     />
//                     <span
//                       className={`transition-all duration-200 ${
//                         isActiveLink('/about')
//                           ? 'text-white font-semibold'
//                           : 'group-hover:text-blue-400'
//                       }`}
//                     >
//                       About
//                     </span>
//                   </Link>
//                 </li>

//                 <li
//                   className={`rounded-sm transition-all duration-200 ${
//                     isActiveLink('/code-of-conduct') ? 'bg-primary/10' : ''
//                   }`}
//                 >
//                   <Link
//                     to='/code-of-conduct'
//                     className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                   >
//                     <Shield
//                       className={`w-4 h-4 transition-all duration-200 ${
//                         isActiveLink('/code-of-conduct')
//                           ? ''
//                           : 'text-gray-300 group-hover:text-gray-700'
//                       }`}
//                     />
//                     <span
//                       className={`transition-all duration-200 ${
//                         isActiveLink('/code-of-conduct')
//                           ? 'text-white font-semibold'
//                           : 'group-hover:text-blue-400'
//                       }`}
//                     >
//                       Code Of Conduct
//                     </span>
//                   </Link>
//                 </li>

//                 <li
//                   className={`rounded-sm transition-all duration-200 ${
//                     isActiveLink('/privacy') ? 'bg-primary/10' : ''
//                   }`}
//                 >
//                   <Link
//                     to='/privacy'
//                     className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                   >
//                     <FileText
//                       className={`w-4 h-4 transition-all duration-200 ${
//                         isActiveLink('/privacy')
//                           ? ''
//                           : 'text-gray-300 group-hover:text-gray-700'
//                       }`}
//                     />
//                     <span
//                       className={`transition-all duration-200 ${
//                         isActiveLink('/privacy')
//                           ? 'text-white font-semibold'
//                           : 'group-hover:text-blue-400'
//                       }`}
//                     >
//                       Privacy Policy
//                     </span>
//                   </Link>
//                 </li>

//                 <li
//                   className={`rounded-sm transition-all duration-200 ${
//                     isActiveLink('/terms') ? 'bg-primary/10' : ''
//                   }`}
//                 >
//                   <Link
//                     to='/terms'
//                     className='flex items-center p-2 space-x-3 rounded-md transition-all duration-200 group'
//                   >
//                     <FileText
//                       className={`w-4 h-4 transition-all duration-200 ${
//                         isActiveLink('/terms')
//                           ? ''
//                           : 'text-gray-300 group-hover:text-gray-700'
//                       }`}
//                     />
//                     <span
//                       className={`transition-all duration-200 ${
//                         isActiveLink('/terms')
//                           ? 'text-white font-semibold'
//                           : 'group-hover:text-blue-400'
//                       }`}
//                     >
//                       Terms of Service
//                     </span>
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Fixed Profile Section - Always at bottom */}
//         <div className='flex-shrink-0 border-t border-gray-200 dark:border-gray-700 mt-auto pt-4'>
//           <div className='flex items-center space-x-4'>
//             <div className='w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold overflow-hidden'>
//               {profilePicture ? (
//                 <img
//                   src={profilePicture}
//                   alt='Profile'
//                   className='w-full h-full object-cover'
//                 />
//               ) : user?.username ? (
//                 <span className='text-sm font-bold'>
//                   {user.username.charAt(0).toUpperCase()}
//                 </span>
//               ) : (
//                 <User className='w-6 h-6' />
//               )}
//             </div>
//             <div className='flex-1 min-w-0'>
//               <h2 className='text-lg font-semibold truncate'>
//                 {isAuthenticated && user?.username
//                   ? user.username
//                   : 'Guest User'}
//               </h2>
//               <span className='flex items-center space-x-1'>
//                 {isAuthenticated ? (
//                   <Link
//                     to='/profile'
//                     className='text-xs hover:underline dark:text-gray-600 truncate transition-all duration-200 hover:text-white'
//                   >
//                     View profile
//                   </Link>
//                 ) : (
//                   <Link
//                     to='/login'
//                     className='text-xs hover:underline dark:text-gray-600 truncate transition-all duration-200 hover:text-primary'
//                   >
//                     Sign in
//                   </Link>
//                 )}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Sidebar
