import React from 'react'

const UserAvatar = ({
  user,
  username,
  height = 40,
  width = 40,
  className = '',
}) => {
  // Use provided user object or fallback to username
  const displayUsername = user?.username || username || 'user'

  // Generate consistent color based on username
  const generateColor = name => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
      '#F8C471',
      '#82E0AA',
      '#F1948A',
      '#85C1E9',
      '#D7BDE2',
    ]

    if (!name) return colors[0]

    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    hash = Math.abs(hash)
    return colors[hash % colors.length]
  }

  // Generate initials from username
  const getInitials = name => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  const backgroundColor = generateColor(displayUsername)
  const initials = getInitials(displayUsername)

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{
        height: `${height}px`,
        width: `${width}px`,
        backgroundColor: backgroundColor,
        fontSize: `${Math.max(12, height * 0.4)}px`,
      }}
      title={displayUsername}
    >
      {initials}
    </div>
  )
}

export default UserAvatar
