import React, { useEffect, useState } from 'react'
import Layout from '../layout/Layout'
import UserMessengerEntries from '../components/UserMessengerEntries'
import Messages from '../components/Messages'
import { getConversations } from '../api/messages'
import { useAuth } from '../../../utils/AuthContext'
import { useLocation } from 'react-router-dom'

const MessengerView = () => {
  const [conservant, setConservant] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [width, setWindowWidth] = useState(0)
  const mobile = width < 800
  const { user } = useAuth()
  const { state } = useLocation()
  const newConservant = state && state.user

  const getConversation = (conversations, conservantId) => {
    for (let i = 0; i < conversations.length; i++) {
      const conversation = conversations[i]
      if (conversation.recipient._id === conservantId) {
        return conversation
      }
    }
  }

  const fetchConversations = async () => {
    if (!user) return

    try {
      let conversations = await getConversations(user)
      if (newConservant) {
        setConservant(newConservant)
        if (!getConversation(conversations, newConservant._id)) {
          const newConversation = {
            _id: newConservant._id,
            recipient: newConservant,
            new: true,
            messages: [],
          }
          conversations = [newConversation, ...conversations]
        }
      }
      setConversations(conversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [user])

  useEffect(() => {
    const updateDimensions = () => {
      setWindowWidth(window.innerWidth)
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return (
    <Layout>
      <div className='h-[calc(100vh-140px)] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='flex h-full'>
          {!mobile ? (
            <>
              {/* Conversations List - Desktop */}
              <div className='w-1/3 border-r border-gray-200 dark:border-gray-600 h-full'>
                <UserMessengerEntries
                  conservant={conservant}
                  conversations={conversations}
                  setConservant={setConservant}
                  loading={loading}
                />
              </div>

              {/* Messages Area - Desktop */}
              <div className='w-2/3 h-full'>
                <MessagesList
                  conservant={conservant}
                  conversations={conversations}
                  setConservant={setConservant}
                  setConversations={setConversations}
                  getConversation={getConversation}
                  mobile={mobile}
                />
              </div>
            </>
          ) : !conservant ? (
            /* Conversations List - Mobile (no conservant selected) */
            <div className='w-full h-full'>
              <UserMessengerEntries
                conservant={conservant}
                conversations={conversations}
                setConservant={setConservant}
                loading={loading}
              />
            </div>
          ) : (
            /* Messages Area - Mobile (conservant selected) */
            <div className='w-full h-full'>
              <MessagesList
                conservant={conservant}
                conversations={conversations}
                setConservant={setConservant}
                setConversations={setConversations}
                getConversation={getConversation}
                mobile={mobile}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default MessengerView
