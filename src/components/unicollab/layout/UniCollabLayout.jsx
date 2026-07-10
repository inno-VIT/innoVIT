// import React from 'react'
import { Outlet } from 'react-router-dom'

import HeaderUniCollab from './HeaderUniCollab'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'

const UniCollabLayout = () => {
  return (
    <div className="h-screen overflow-hidden bg-[#080912] text-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16">
        <HeaderUniCollab />
      </div>

      {/* Main Layout */}
      <div className="flex h-full pt-16">

        {/* Left Sidebar */}
        <Sidebar />

        {/* Feed */}
        <main
          className="
            flex-1
            min-w-0
            overflow-y-auto
            px-4
            py-8
            lg:ml-72
            mr-0
          "
        >
          <div className="w-full">
            <Outlet />
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>
    </div>
  )
}

export default UniCollabLayout






