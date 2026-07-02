import React from 'react';
import { Link } from 'react-router-dom';

const ContentDetails = ({ userId,username, createdAt, edited, preview, className = "" }) => {
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* User Avatar */}
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
        {username?.charAt(0)?.toUpperCase() || 'U'}
      </div>

      {/* User info and timestamp */}
      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
        <Link
           to={`/unicollab/profile/${userId}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          u/{username}
        </Link>

        {!preview && (
          <>
            <span>·</span>
            <span>{formatTimeAgo(createdAt)}</span>
            {edited && (
              <span className="text-gray-400 dark:text-gray-500">
                (edited)
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentDetails;
