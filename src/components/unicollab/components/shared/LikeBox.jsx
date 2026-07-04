import { useState } from 'react'
import {
  ThumbsUp,
  Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../utils/AuthContext'

const LikeBox = ({
  likeCount = 0,
  liked = false,
  onLike,
  size = 'md',
  showCount = true,
  disabled = false,
  className = '',
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(liked)
  const [animate, setAnimate] = useState(false)

  const sizes = {
    sm: {
      button: 'h-9 w-9',
      icon: 'h-4 w-4',
      text: 'text-xs',
    },
    md: {
      button: 'h-10 w-10',
      icon: 'h-5 w-5',
      text: 'text-sm',
    },
    lg: {
      button: 'h-12 w-12',
      icon: 'h-6 w-6',
      text: 'text-base',
    },
  }

  const config = sizes[size]

  const handleLike = async e => {
    e.stopPropagation()

    if (!user) {
      navigate('/login')
      return
    }

    if (loading || disabled) return

    const next = !isLiked

    setLoading(true)
    setIsLiked(next)
    setAnimate(true)

    try {
      if (onLike) {
        await onLike(next)
      }
    } catch (err) {
      setIsLiked(!next)
      console.error(err)
    } finally {
      setLoading(false)

      setTimeout(() => {
        setAnimate(false)
      }, 250)
    }
  }

  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
    >
      <button
        onClick={handleLike}
        disabled={disabled || loading}
        className={`
          ${config.button}
          flex
          items-center
          justify-center
          rounded-xl
          transition-all
          duration-200

          ${
            isLiked
              ? 'bg-blue-600 text-white'
              : 'bg-[#151722] text-slate-400 hover:bg-slate-700 hover:text-white'
          }

          ${
            animate
              ? 'scale-110'
              : 'scale-100'
          }

          disabled:opacity-40
          disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <Loader2
            className={`${config.icon} animate-spin`}
          />
        ) : (
          <ThumbsUp className={config.icon} />
        )}
      </button>

      {showCount && (
        <span
          className={`
            ${config.text}
            font-semibold

            ${
              isLiked
                ? 'text-blue-400'
                : 'text-slate-400'
            }
          `}
        >
          {likeCount}
        </span>
      )}
    </div>
  )
}

export default LikeBox



