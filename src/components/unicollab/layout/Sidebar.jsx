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

/