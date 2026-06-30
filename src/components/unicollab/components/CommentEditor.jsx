import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createComment } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext' // Import useAuth instead
import ErrorAlert from './ErrorAlert'

const CommentEditor = ({ label, comment, addComment, setReplying }) => {
  const [formData, setFormData] = useState({
    content: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth() // Use the hook

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const body = {
      ...formData,
      parentId: comment && comment._id,
    }

    setLoading(true)
    const data = await createComment(body, params, isAuthenticated) // Use isAuthenticated
    setLoading(false)

    if (data.error) {
      setError(data.error)
    } else {
      setFormData({ content: '' })
      setReplying && setReplying(false)
      addComment(data)
    }
  }

  const handleFocus = e => {
    !isAuthenticated && navigate('/login') // Use isAuthenticated
  }

  return (
    <div className='bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4'>
      <div className='flex flex-col space-y-4'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <h3 className='text-xl font-semibold text-gray-800'>
            {comment ? 'Reply' : 'Comment'}
          </h3>
          <a
            href='https://commonmark.org/help/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors'
          >
            Markdown Help
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <textarea
            rows={5}
            required
            name='content'
            value={formData.content}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={label || 'Write your comment...'}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-white text-gray-800 placeholder-gray-500'
            disabled={loading}
          />

          {/* Error Alert */}
          {error && (
            <div className='my-4'>
              <ErrorAlert error={error} />
            </div>
          )}

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading || !isAuthenticated} // Also disable if not authenticated
            className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md'
          >
            {loading ? (
              <div className='flex items-center justify-center space-x-2'>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                <span>Submitting...</span>
              </div>
            ) : !isAuthenticated ? (
              'Please login to comment'
            ) : (
              'Submit Comment'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CommentEditor
