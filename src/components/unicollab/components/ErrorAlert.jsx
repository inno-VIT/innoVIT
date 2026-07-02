import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react'

const variants = {
  error: {
    icon: AlertCircle,
    container:
      'border-red-500/30 bg-red-500/10',
    iconColor: 'text-red-400',
    title: 'text-red-300',
    text: 'text-red-200',
  },

  warning: {
    icon: AlertTriangle,
    container:
      'border-yellow-500/30 bg-yellow-500/10',
    iconColor: 'text-yellow-400',
    title: 'text-yellow-300',
    text: 'text-yellow-200',
  },

  success: {
    icon: CheckCircle2,
    container:
      'border-emerald-500/30 bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    title: 'text-emerald-300',
    text: 'text-emerald-200',
  },

  info: {
    icon: Info,
    container:
      'border-blue-500/30 bg-blue-500/10',
    iconColor: 'text-blue-400',
    title: 'text-blue-300',
    text: 'text-blue-200',
  },
}

const ErrorAlert = ({
  error,
  type = 'error',
  title,
  onClose,
  className = '',
}) => {
  if (!error) return null

  const config = variants[type] || variants.error

  const Icon = config.icon

  return (
    <div
      className={`
        flex
        items-start
        gap-4
        rounded-2xl
        border
        p-4
        ${config.container}
        ${className}
      `}
    >
      <Icon
        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.iconColor}`}
      />

      <div className="flex-1">
        <h3
          className={`font-semibold ${config.title}`}
        >
          {title ||
            type.charAt(0).toUpperCase() +
              type.slice(1)}
        </h3>

        <p
          className={`mt-1 text-sm leading-relaxed ${config.text}`}
        >
          {error}
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="
            rounded-lg
            p-1
            text-slate-400
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default ErrorAlert

// import React from 'react';
// import { X } from 'lucide-react';

// const ErrorAlert = ({ error, onClose, type = 'error', title, className = "" }) => {
//   if (!error) return null;

//   const alertConfig = {
//     error: {
//       bg: 'bg-red-50 dark:bg-red-900/20',
//       border: 'border-red-200 dark:border-red-800',
//       titleColor: 'text-red-800 dark:text-red-200',
//       textColor: 'text-red-700 dark:text-red-300',
//       icon: (
//         <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
//         </svg>
//       )
//     },
//     warning: {
//       bg: 'bg-yellow-50 dark:bg-yellow-900/20',
//       border: 'border-yellow-200 dark:border-yellow-800',
//       titleColor: 'text-yellow-800 dark:text-yellow-200',
//       textColor: 'text-yellow-700 dark:text-yellow-300',
//       icon: (
//         <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//           <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//         </svg>
//       )
//     },
//     success: {
//       bg: 'bg-green-50 dark:bg-green-900/20',
//       border: 'border-green-200 dark:border-green-800',
//       titleColor: 'text-green-800 dark:text-green-200',
//       textColor: 'text-green-700 dark:text-green-300',
//       icon: (
//         <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
//           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L6.53 10.47a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.154-.114l4-5.5z" clipRule="evenodd" />
//         </svg>
//       )
//     },
//     info: {
//       bg: 'bg-blue-50 dark:bg-blue-900/20',
//       border: 'border-blue-200 dark:border-blue-800',
//       titleColor: 'text-blue-800 dark:text-blue-200',
//       textColor: 'text-blue-700 dark:text-blue-300',
//       icon: (
//         <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
//           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
//         </svg>
//       )
//     }
//   };

//   const config = alertConfig[type];
//   const displayTitle = title || (type === 'error' ? 'Error' : type.charAt(0).toUpperCase() + type.slice(1));

//   return (
//     <div className={`${config.bg} ${config.border} rounded-lg p-4 ${className}`}>
//       <div className="flex items-start">
//         <div className="flex-shrink-0">
//           {config.icon}
//         </div>
//         <div className={`ml-3 flex-1 ${onClose ? 'mr-2' : ''}`}>
//           <h3 className={`text-sm font-medium ${config.titleColor}`}>
//             {displayTitle}
//           </h3>
//           <div className={`mt-1 text-sm ${config.textColor}`}>
//             {error}
//           </div>
//         </div>
//         {onClose && (
//           <button
//             type="button"
//             onClick={onClose}
//             className={`ml-auto flex-shrink-0 rounded-md ${config.bg} inline-flex ${config.textColor} hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
//             aria-label="Dismiss"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ErrorAlert;
