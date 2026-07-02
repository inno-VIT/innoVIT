// import React from 'react'
// import HeaderUniCollab from './HeaderUniCollab.jsx'
// import Sidebar from './Sidebar.jsx'
// import RightSidebar from './RightSidebar.jsx'

// const Layout = ({ children }) => {
//   return (
//     <div className='min-h-screen bg-inherit pt-[12vh] '>
//       <HeaderUniCollab />
//       <Sidebar />
//       <main className="lg:pl-80 xl:pr-80">
//         <div className='px-4 py-4 sm:px-6 lg:px-8'>{children}</div>
//       </main>
//       <RightSidebar />
//     </div>
//   )
// }

// export default Layout

import HeaderUniCollab from './HeaderUniCollab'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#080912]">

      {/* UniCollab Header */}
      <HeaderUniCollab />

      {/* Main Grid */}
      <div
        className="
          mx-auto
          max-w-[1700px]
          pt-20
          grid
          grid-cols-12
          gap-6
          px-6
        "
      >

        {/* Left Sidebar */}
        <aside
          className="
            hidden
            lg:block
            lg:col-span-3
            xl:col-span-2
            sticky
            top-24
            h-[calc(100vh-110px)]
          "
        >
          <Sidebar />
        </aside>

        {/* Feed */}
        <main
          className="
            col-span-12
            lg:col-span-9
            xl:col-span-7
            min-h-screen
          "
        >
          {children}
        </main>

        {/* Right Sidebar */}
        <aside
          className="
            hidden
            xl:block
            xl:col-span-3
            sticky
            top-24
            h-[calc(100vh-110px)]
          "
        >
          <RightSidebar />
        </aside>

      </div>
    </div>
  )
}

export default Layout