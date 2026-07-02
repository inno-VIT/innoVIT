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



// // Enhanced Version
// import React, { useState } from 'react'
// import { ThumbsUp, ThumbsUp as ThumbsUpFilled, Loader2 } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../../../utils/AuthContext'

// const LikeBox = ({
//   likeCount,
//   onLike,
//   liked: initialLiked,
//   className = '',
//   size = 'md', // sm, md, lg
//   showCount = true,
//   disabled = false,
// }) => {
//   const [liked, setLiked] = useState(initialLiked || false)
//   const [isAnimating, setIsAnimating] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const { user } = useAuth()
//   const navigate = useNavigate()

//   const sizeConfig = {
//     sm: { icon: 'h-4 w-4', button: 'p-1', text: 'text-xs' },
//     md: { icon: 'h-5 w-5', button: 'p-2', text: 'text-sm' },
//     lg: { icon: 'h-6 w-6', button: 'p-3', text: 'text-base' },
//   }

//   const {
//     icon: iconSize,
//     button: buttonSize,
//     text: textSize,
//   } = sizeConfig[size]

//   const handleLike = async e => {
//     e.stopPropagation()

//     if (!user || disabled || isLoading) {
//       if (!user) navigate('/login')
//       return
//     }

//     const newLikedValue = !liked

//     setIsLoading(true)
//     setIsAnimating(true)
//     setLiked(newLikedValue)

//     try {
//       if (onLike) {
//         await onLike(newLikedValue)
//       }
//     } catch (error) {
//       // Revert if there's an error
//       setLiked(!newLikedValue)
//       console.error('Error liking:', error)
//     } finally {
//       setIsLoading(false)
//       setTimeout(() => setIsAnimating(false), 300)
//     }
//   }

//   const IconComponent = liked ? ThumbsUpFilled : ThumbsUp
//   const iconColor = liked
//     ? 'text-blue-600 dark:text-blue-400'
//     : 'text-gray-500 dark:text-gray-400'
//   const countColor = liked
//     ? 'text-blue-600 dark:text-blue-400 font-semibold'
//     : 'text-gray-700 dark:text-gray-300'

//   return (
//     <div className={`flex flex-col items-center ${className}`}>
//       <button
//         onClick={handleLike}
//         disabled={disabled || isLoading}
//         className={`${buttonSize} rounded-full transition-all duration-200 ${
//           liked
//             ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50'
//             : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
//         } ${isAnimating ? 'scale-110' : 'scale-100'} ${
//           disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
//         }`}
//         title={liked ? 'Unlike' : 'Like'}
//       >
//         {isLoading ? (
//           <Loader2 className={`${iconSize} text-gray-400 animate-spin`} />
//         ) : (
//           <IconComponent
//             className={`${iconSize} transition-colors ${iconColor} ${
//               isAnimating ? 'animate-pulse' : ''
//             }`}
//           />
//         )}
//       </button>
//       {showCount && (
//         <span className={`${textSize} mt-1 transition-colors ${countColor}`}>
//           {likeCount || 0}
//         </span>
//       )}
//     </div>
//   )
// }

// export default LikeBox

// Basic Version
// import React, { useState } from 'react';
// import { ThumbsUp, ThumbsUp as ThumbsUpFilled } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../utils/AuthContext';

// const LikeBox = ({ likeCount, onLike, liked: initialLiked, className = "" }) => {
//   const [liked, setLiked] = useState(initialLiked || false);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const handleLike = async (e) => {
//     e.stopPropagation(); // Prevent event bubbling

//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     const newLikedValue = !liked;

//     // Animation
//     setIsAnimating(true);
//     setLiked(newLikedValue);

//     // Call the parent's onLike function
//     if (onLike) {
//       await onLike(newLikedValue);
//     }

//     // Reset animation after a short delay
//     setTimeout(() => setIsAnimating(false), 300);
//   };

//   const IconComponent = liked ? ThumbsUpFilled : ThumbsUp;
//   const iconColor = liked
//     ? 'text-blue-600 dark:text-blue-400'
//     : 'text-gray-500 dark:text-gray-400';
//   const countColor = liked
//     ? 'text-blue-600 dark:text-blue-400 font-semibold'
//     : 'text-gray-700 dark:text-gray-300';

//   return (
//     <div className={`flex flex-col items-center ${className}`}>
//       <button
//         onClick={handleLike}
//         className={`p-2 rounded-full transition-all duration-200 ${
//           liked
//             ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50'
//             : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
//         } ${
//           isAnimating ? 'scale-110' : 'scale-100'
//         }`}
//         title={liked ? 'Unlike' : 'Like'}
//       >
//         <IconComponent
//           className={`h-5 w-5 transition-colors ${iconColor} ${
//             isAnimating ? 'animate-pulse' : ''
//           }`}
//         />
//       </button>
//       <span className={`text-sm mt-1 transition-colors ${countColor}`}>
//         {likeCount || 0}
//       </span>
//     </div>
//   );
// };

// export default LikeBox;
