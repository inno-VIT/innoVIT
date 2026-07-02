import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMessages, sendMessage } from '../../api/messages';
import { useAuth } from '../../../../utils/AuthContext';
import Loading from '../shared/Loading';
import Message from './Message';
import MessageInput from './MessageInput';
import { ArrowLeft, MessageCircle } from 'lucide-react';

const MessagesList = ({
  conservant,
  conversations,
  setConservant,
  setConversations,
  getConversation,
  mobile = false
}) => {
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(true);

  const conversation = conservant && getConversation(conversations, conservant._id);

  const fetchMessages = async () => {
    if (!conservant || !user) return;

    if (conversation?.new) {
      setLoading(false);
      setMessages(conversation.messages || []);
      return;
    }

    setLoading(true);
    try {
      const data = await getMessages(user, conversation?._id || conservant._id);
      if (data && !data.error) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conservant, user]);

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || !conservant || !user) return;

    const newMessage = {
      content: content.trim(),
      sender: user,
      recipient: conservant,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    // Optimistically update UI
    const newMessages = [newMessage, ...(messages || [])];
    setMessages(newMessages);

    // Update conversations list
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        lastMessage: content,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0
      };

      const newConversations = conversations.filter(
        conv => conv._id !== conversation._id
      );
      newConversations.unshift(updatedConversation);
      setConversations(newConversations);
    }

    try {
      // Send to API
      await sendMessage(user, { content }, conservant._id);

      // Update message status
      setMessages(prev => prev.map(msg =>
        msg === newMessage ? { ...msg, status: 'delivered' } : msg
      ));

      // You can add socket.io integration here later
      // socket.emit('send-message', conservant._id, user.username, content);

    } catch (error) {
      console.error('Error sending message:', error);
      // Revert on error
      setMessages(prev => prev.filter(msg => msg !== newMessage));
    }
  };

  if (!conservant) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          UniCollab Messenger
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Privately message other users on UniCollab. Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        {mobile && (
          <button
            onClick={() => setConservant(null)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {conservant.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            to={`/unicollab/profile/${conservant._id}`}
            className="block font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
          >
            {conservant.firstName} {conservant.lastName}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{conservant.username}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col-reverse min-h-full p-4">
              <div ref={messagesEndRef} />

              {messages && messages.length > 0 ? (
                messages.map((message, index) => (
                  <Message
                    key={message._id || index}
                    message={message}
                    conservant={conservant}
                    currentUser={user}
                  />
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default MessagesList;
