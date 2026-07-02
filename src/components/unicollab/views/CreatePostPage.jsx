import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../api/posts'
import { useAuth } from '../../../utils/AuthContext'
// import Layout from '../layout/Layout'
import ErrorAlert from '../components/shared/ErrorAlert'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Link } from 'react-router-dom'

const CreatePostPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isAnonymous: false,
  })

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      setServerError('Title and content are required')
      return
    }

    setLoading(true)
    setServerError('')

    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        isAnonymous: formData.isAnonymous,
      }

      const newPost = await createPost(postData, user)
      navigate(`/unicollab/posts/${newPost._id}`)
    } catch (error) {
      console.error('Error creating post:', error)
      setServerError(error.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center py-12'>
            <h2 className='text-xl font-semibold mb-4'>
              Please log in to create a post
            </h2>
            <Link to='/login'>
              <Button>Log In</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <Link
            to='/unicollab'
            className='p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          >
            <ArrowLeft className='h-5 w-5' />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Create a New Post
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Share your thoughts, questions, or projects with the community
            </p>
          </div>
        </div>

        {/* Post Form */}
        <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Title */}
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Title *
              </label>
              <input
                type='text'
                id='title'
                name='title'
                value={formData.title}
                onChange={handleChange}
                placeholder='Enter a compelling title...'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                required
              />
            </div>

            {/* Content */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label
                  htmlFor='content'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Content *
                </label>
                <a
                  href='https://commonmark.org/help/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  <HelpCircle className='h-4 w-4' />
                  Markdown Help
                </a>
              </div>
              <textarea
                id='content'
                name='content'
                value={formData.content}
                onChange={handleChange}
                placeholder='Write your post content here... (Markdown supported)'
                rows={12}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-vertical'
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor='tags'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Tags (comma separated)
              </label>
              <input
                type='text'
                id='tags'
                name='tags'
                value={formData.tags}
                onChange={handleChange}
                placeholder='e.g., programming, design, research'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
              />
            </div>

            {/* Anonymous Option */}
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='isAnonymous'
                name='isAnonymous'
                checked={formData.isAnonymous}
                onChange={handleChange}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label
                htmlFor='isAnonymous'
                className='ml-2 block text-sm text-gray-700 dark:text-gray-300'
              >
                Post anonymously
              </label>
            </div>

            {/* Error Alert */}
            {serverError && <ErrorAlert error={serverError} />}

            {/* Submit Button */}
            <div className='flex gap-3 justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/unicollab')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={
                  loading || !formData.title.trim() || !formData.content.trim()
                }
              >
                {loading ? 'Creating Post...' : 'Create Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreatePostPage
