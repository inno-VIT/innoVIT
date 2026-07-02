import { useRef, useState } from 'react'
import {
  Send,
  Smile,
  Paperclip,
} from 'lucide-react'

const MessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  className = '',
}) => {
  const [message, setMessage] = useState('')

  const textareaRef = useRef(null)

  const resize = () => {
    const textarea = textareaRef.current

    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const send = () => {
    const text = message.trim()

    if (!text || disabled) return

    onSendMessage(text)

    setMessage('')

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px'
      }
    })
  }

  const handleChange = e => {
    setMessage(e.target.value)
    resize()
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div
      className={`
        border-t
        border-slate-800
        bg-[#10141d]
        p-4
        ${className}
      `}
    >
      <div
        className="
          flex
          items-end
          gap-3
          rounded-2xl
          border
          border-slate-700
          bg-[#151722]
          px-4
          py-3
          transition
          focus-within:border-blue-500
        "
      >
        <button
          type="button"
          className="
            text-slate-400
            transition
            hover:text-white
          "
        >
          <Smile className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="
            text-slate-400
            transition
            hover:text-white
          "
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="
            max-h-40
            min-h-[48px]
            flex-1
            resize-none
            overflow-y-auto
            bg-transparent
            text-sm
            text-white
            placeholder:text-slate-500
            focus:outline-none
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        />

        <button
          onClick={send}
          disabled={!message.trim() || disabled}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-blue-600
            text-white
            transition

            hover:bg-blue-700

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-2 flex justify-end">
        <span className="text-xs text-slate-500">
          {message.length}/1000
        </span>
      </div>
    </div>
  )
}

export default MessageInput




// import React, { useState } from 'react'
// import { Send, Smile } from 'lucide-react'

// const MessageInput = ({
//   onSendMessage,
//   disabled = false,
//   placeholder = 'Type a message...',
//   className = '',
// }) => {
//   const [content, setContent] = useState('')

//   const handleSend = () => {
//     if (content.trim() && !disabled) {
//       onSendMessage(content.trim())
//       setContent('')
//     }
//   }

//   const handleKeyPress = e => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSend()
//     }
//   }

//   const handleChange = e => {
//     setContent(e.target.value)
//   }

//   return (
//     <div
//       className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 ${className}`}
//     >
//       <div className='flex items-end gap-2'>
//         {/* Emoji Button (optional future feature) */}
//         <button
//           type='button'
//           className='p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors'
//           title='Add emoji'
//         >
//           <Smile className='h-5 w-5' />
//         </button>

//         {/* Message Input */}
//         <div className='flex-1'>
//           <textarea
//             value={content}
//             onChange={handleChange}
//             onKeyPress={handleKeyPress}
//             placeholder={placeholder}
//             disabled={disabled}
//             rows={1}
//             className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none min-h-[40px] max-h-32 disabled:opacity-50 disabled:cursor-not-allowed'
//             style={{
//               height: 'auto',
//               minHeight: '40px',
//             }}
//             onInput={e => {
//               e.target.style.height = 'auto'
//               e.target.style.height = e.target.scrollHeight + 'px'
//             }}
//           />
//         </div>

//         {/* Send Button */}
//         <button
//           onClick={handleSend}
//           disabled={!content.trim() || disabled}
//           className='p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0'
//           title='Send message'
//         >
//           <Send className='h-5 w-5' />
//         </button>
//       </div>

//       {/* Character count (optional) */}
//       <div className='text-xs text-gray-500 dark:text-gray-400 mt-1 text-right'>
//         {content.length}/1000
//       </div>
//     </div>
//   )
// }

// export default MessageInput
