import React, { useState } from 'react'
import { Button } from '../../ui/Button'
import { Textarea } from '../../ui/TextArea'

const ContentUpdateEditor = ({
  originalContent,
  handleSubmit,
  validate,
  onCancel,
  placeholder = 'Update your content...',
  className = '',
  maxLength = 10000,
  showCharacterCount = true,
}) => {
  const [content, setContent] = useState(originalContent)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = e => {
    setContent(e.target.value)
    if (error) setError('')
  }

  const handleFormSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    let error = null

    if (validate) {
      error = validate(content)
    }

    if (error && error.length !== 0) {
      setError(error)
      setIsSubmitting(false)
    } else {
      try {
        await handleSubmit(e, content)
      } catch (err) {
        setError('Failed to update content')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleCancel = () => {
    setContent(originalContent)
    setError('')
    if (onCancel) {
      onCancel()
    }
  }

  const isAtLimit = content.length >= maxLength
  const hasChanges = content.trim() !== originalContent.trim()

  return (
    <form onSubmit={handleFormSubmit} className={`space-y-3 ${className}`}>
      <div>
        <Textarea
          value={content}
          name='content'
          onChange={handleChange}
          placeholder={placeholder}
          className={`min-h-[120px] resize-none ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : ''
          } ${isAtLimit ? 'border-orange-300' : ''}`}
          disabled={isSubmitting}
        />

        <div className='flex justify-between items-center mt-1'>
          {error && (
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          )}

          {showCharacterCount && (
            <div
              className={`text-xs ml-auto ${
                isAtLimit ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              {content.length}/{maxLength}
            </div>
          )}
        </div>
      </div>

      <div className='flex gap-2 justify-end'>
        {onCancel && (
          <Button
            type='button'
            variant='outline'
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type='submit'
          disabled={isSubmitting || !hasChanges || isAtLimit}
        >
          {isSubmitting ? 'Updating...' : 'Update'}
        </Button>
      </div>
    </form>
  )
}

export default ContentUpdateEditor
