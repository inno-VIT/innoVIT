import React, { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage } from '../api/messages'
import { useAuth } from '../../../utils/AuthContext'

const Messages = ({
  conservant,
  conversations,
  setConservant,
  setConversations,
  getConversation,
  mobile,
}) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conservant || !user) return

      setLoading(true)
      try {
        const conversation = getConversation(conversations, conservant._id)
        if (conversation && !conversation.new) {
          const messagesData = await getMessages(user, conversation._id)
          setMessages(messagesData.messages || [])
        } else {
          setMessages([])
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [conservant, conversations, user])

  const handleSendMessage = async e => {
    e.preventDefault()
    if (!newMessage.trim() || !conservant || !user) return

    const messageToSend = {
      content: newMessage.trim(),
      recipientId: conservant._id,
    }

    try {
      await sendMessage(user, messageToSend, conservant._id)
      setNewMessage('')
      // Refresh conversations to update last message
      // You might want to implement real-time updates with sockets later
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (!conservant) {
    return (
      <div className='h-full flex items-center justify-center text-gray-500 dark:text-gray-400'>
        Select a conversation to start messaging
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='p-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          {mobile && (
            <button
              onClick={() => setConservant(null)}
              className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            >
              ← Back
            </button>
          )}
          <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
            {conservant.firstName?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              {conservant.firstName} {conservant.lastName}
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {conservant.university || 'Student'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {loading ? (
          <div className='text-center text-gray-500 dark:text-gray-400'>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className='text-center text-gray-500 dark:text-gray-400 py-8'>
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message._id}
              className={`flex ${
                message.sender._id === user?._id
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender._id === user?._id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className='text-sm'>{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender._id === user?._id
                      ? 'text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className='p-4 border-t border-gray-200 dark:border-gray-600'
      >
        <div className='flex space-x-2'>
          <input
            type='text'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder='Type a message...'
            className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
          />
          <button
            type='submit'
            disabled={!newMessage.trim()}
            className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default Messages
