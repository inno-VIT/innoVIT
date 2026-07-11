import { motion } from 'framer-motion'
import {
  TrendingUp,
  Users,
  Calendar,
  Flame,
  Trophy,
  ArrowUpRight,
} from 'lucide-react'
import FindUsers from '../components/FindUsers'
import TopPosts from '../components/TopPosts'

export default function RightSidebar() {
  return (
    <div className="h-full overflow-y-auto pr-2 space-y-6">

      {/* Suggested Users */}
      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FindUsers />
      </motion.div>

      {/* Trending Posts */}
      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <TopPosts />
      </motion.div>

      {/* Community Stats */}

      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="
          rounded-2xl
          border
          border-white/10
          bg-[#10131d]
          p-5
          shadow-xl
        "
      >
        <div className="flex items-center gap-2 mb-5">

          <TrendingUp className="w-5 h-5 text-blue-500" />

          <h2 className="font-semibold text-lg text-white">
            Community Stats
          </h2>

        </div>

        <div className="space-y-5">

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-2">

              <Users className="w-4 h-4 text-green-400" />

              <span className="text-gray-400">
                Members
              </span>

            </div>

            <span className="font-semibold text-white">
              12,540
            </span>

          </div>

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-2">

              <Flame className="w-4 h-4 text-orange-400" />

              <span className="text-gray-400">
                Posts Today
              </span>

            </div>

            <span className="font-semibold text-white">
              274
            </span>

          </div>

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-2">

              <Trophy className="w-4 h-4 text-yellow-400" />

              <span className="text-gray-400">
                Active Challenges
              </span>

            </div>

            <span className="font-semibold text-white">
              8
            </span>

          </div>

        </div>
      </motion.div>

      {/* Events */}

      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="
          rounded-2xl
          border
          border-white/10
          bg-[#10131d]
          p-5
          shadow-xl
        "
      >
        <div className="flex items-center gap-2 mb-5">

          <Calendar className="w-5 h-5 text-purple-500" />

          <h2 className="font-semibold text-lg text-white">
            Upcoming Events
          </h2>

        </div>

        <div className="space-y-4">

          <div className="rounded-xl bg-[#171b28] p-4">

            <div className="flex justify-between items-start">

              <div>

                <h3 className="font-semibold text-white">
                  AI Hackathon
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  June 30 • Online
                </p>

              </div>

              <ArrowUpRight className="w-4 h-4 text-gray-500" />

            </div>

          </div>

          <div className="rounded-xl bg-[#171b28] p-4">

            <div className="flex justify-between items-start">

              <div>

                <h3 className="font-semibold text-white">
                  Placement Drive
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  July 3 • Auditorium
                </p>

              </div>

              <ArrowUpRight className="w-4 h-4 text-gray-500" />

            </div>

          </div>

          <div className="rounded-xl bg-[#171b28] p-4">

            <div className="flex justify-between items-start">

              <div>

                <h3 className="font-semibold text-white">
                  Web Dev Workshop
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  July 5 • Lab 402
                </p>

              </div>

              <ArrowUpRight className="w-4 h-4 text-gray-500" />

            </div>

          </div>

        </div>
      </motion.div>

      {/* Footer */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="
          rounded-2xl
          border
          border-white/10
          bg-[#10131d]
          p-5
          text-center
        "
      >
        <h3 className="font-semibold text-white">
          UniCollab
        </h3>

        <p className="text-sm text-gray-400 mt-2 leading-6">
          Connect. Collaborate. Create.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-gray-500">

          <a href="/about" className="hover:text-blue-400">
            About
          </a>

          <a href="/privacy" className="hover:text-blue-400">
            Privacy
          </a>

          <a href="/terms" className="hover:text-blue-400">
            Terms
          </a>

          <a href="/code-of-conduct" className="hover:text-blue-400">
            Code
          </a>

        </div>

        <p className="text-xs text-gray-600 mt-6">
          © 2026 innoVIT
        </p>
      </motion.div>

    </div>
  )
}

