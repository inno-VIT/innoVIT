// import React from 'react'
import { Outlet } from 'react-router-dom'

import HeaderUniCollab from './HeaderUniCollab'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'

const UniCollabLayout = () => {
  return (
    <div className="min-h-screen bg-[#080912]">
      {/* UniCollab Navbar */}
      <HeaderUniCollab />

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Feed */}
        <main className="flex-1 lg:ml-72 xl:mr-80">
          <div className="mx-auto max-w-4xl px-6 py-6">
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