import { FileText, MessageSquare, Heart } from 'lucide-react'

const ProfileTabs = ({
  tab,
  setTab,
  isOwnProfile,
}) => {
  const tabs = [
    {
      key: 'posts',
      label: 'Posts',
      icon: FileText,
    },
    {
      key: 'comments',
      label: 'Comments',
      icon: MessageSquare,
    },
  ]

  if (isOwnProfile) {
    tabs.push({
      key: 'liked',
      label: 'Liked',
      icon: Heart,
    })
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-[#10141d]
        p-2
      "
    >
      <div className="flex flex-wrap gap-2">

        {tabs.map(item => {
          const Icon = item.icon

          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`
                flex
                items-center
                gap-2
                rounded-xl
                px-5
                py-3
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  tab === item.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon size={18} />

              {item.label}
            </button>
          )
        })}

      </div>
    </div>
  )
}

export default ProfileTabs



// <--------- works fine --------------->
// import React from 'react';

// const ProfileTabs = ({ tab, setTab, isOwnProfile }) => {
//   const tabs = [
//     { key: 'posts', label: 'Posts' },
//     { key: 'comments', label: 'Comments' },
//   ];

//   // Only show "Liked" tab for own profile
//   if (isOwnProfile) {
//     tabs.push({ key: 'liked', label: 'Liked Posts' });
//   }

//   return (
//     <div className="border-b border-gray-200 dark:border-gray-700">
//       <nav className="flex space-x-8">
//         {tabs.map((tabItem) => (
//           <button
//             key={tabItem.key}
//             onClick={() => setTab(tabItem.key)}
//             className={`py-2 px-1 border-b-2 font-medium text-sm ${
//               tab === tabItem.key
//                 ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
//             }`}
//           >
//             {tabItem.label}
//           </button>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default ProfileTabs;
