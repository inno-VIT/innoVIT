// import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'

const WebsiteLayout = () => {
  return (
    <div className="relative min-h-screen bg-[#080912]">
      {/* Global innoVIT Header */}
      <Header />

      {/* Website Content */}
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}

export default WebsiteLayout