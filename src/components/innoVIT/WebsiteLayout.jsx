// import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'

const WebsiteLayout = () => {
  const location = useLocation()

  const hideWebsiteHeader = location.pathname.startsWith('/unicollab')

  return (
    <div className="relative min-h-screen bg-[#080912]">
      {!hideWebsiteHeader && <Header />}

      <main
        className={`relative z-10 ${
          hideWebsiteHeader ? '' : 'pt-[72px]'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default WebsiteLayout