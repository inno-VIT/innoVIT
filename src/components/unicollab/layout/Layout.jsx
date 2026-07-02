import React from 'react'
import HeaderUniCollab from './HeaderUniCollab.jsx'
import Sidebar from './Sidebar.jsx'
import RightSidebar from './RightSidebar.jsx'

const Layout = ({ children }) => {
  return (
    <div className='min-h-screen bg-inherit pt-[12vh] '>
      <HeaderUniCollab />
      <Sidebar />
      <main className="lg:pl-80 xl:pr-80">
        <div className='px-4 py-4 sm:px-6 lg:px-8'>{children}</div>
      </main>
      <RightSidebar />
    </div>
  )
}

export default Layout
