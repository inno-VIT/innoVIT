import React from 'react'
import HorizontalStack from '../../ui/HorizontalStack'

const SortBySelect = ({ onSortBy, sortBy, sorts, label = true }) => {
  // Default sort options if none provided
  const defaultSorts = {
    latest: 'Latest',
    popular: 'Popular',
    most_liked: 'Most Liked',
    most_commented: 'Most Discussed',
  }

  const sortOptions = sorts || defaultSorts

  return (
    <HorizontalStack spacing={2}>
      {label && (
        <span className='text-gray-600 text-sm hidden sm:block'>Sort by:</span>
      )}
      <select
        value={sortBy}
        onChange={e => onSortBy(e.target.value)}
        className='border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white min-w-[150px]'
      >
        {Object.keys(sortOptions).map(sortKey => (
          <option key={sortKey} value={sortKey}>
            {sortOptions[sortKey]}
          </option>
        ))}
      </select>
    </HorizontalStack>
  )
}

export default SortBySelect
