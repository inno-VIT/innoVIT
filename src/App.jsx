// import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './utils/AuthContext'
import { SocketProvider } from './utils/SocketContext'

// Layouts
import WebsiteLayout from './components/innoVIT/WebsiteLayout.jsx'
import UniCollabLayout from './components/unicollab/layout/UniCollabLayout.jsx'

// Pages
import Hero from './components/innoVIT/Hero.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'

import Study from './components/study/Study.jsx'
import Default from './components/study/StudyDefault.jsx'
import SubjectDetails from './components/study/SubjectDetails.jsx'

import Profile from './components/Profile.jsx'

import AboutCommunity from './components/unicollab/about-platform/AboutCommunity.jsx'
import CodeOfConduct from './components/unicollab/about-platform/CodeOfConduct.jsx'
import PrivacyPolicy from './components/unicollab/about-platform/PrivacyPolicy.jsx'
import TermsOfService from './components/unicollab/about-platform/TermsOfService.jsx'

// UniCollab
import UniCollab from './components/unicollab/UniCollab.jsx'
import ExploreView from './components/unicollab/views/ExploreView.jsx'
import UsersView from './components/unicollab/views/UsersView.jsx'
import PostView from './components/unicollab/views/PostView.jsx'
import CreatePostPage from './components/unicollab/views/CreatePostPage.jsx'
import ProfileView from './components/unicollab/views/ProfileView.jsx'
import MessengerView from './components/unicollab/views/MessengerView.jsx'
import SearchView from './components/unicollab/views/SearchView.jsx'

import Protected from './components/Protected.jsx'

const App = () => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080912]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SocketProvider>
      <Routes>

        {/* ---------------- Website ---------------- */}

        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />

          {/* About */}
          <Route path="/about" element={<AboutCommunity />} />
          <Route path="/code-of-conduct" element={<CodeOfConduct />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Study */}
          <Route path="/study" element={<Study />}>
            <Route index element={<Default />} />
            <Route path=":subjectCode" element={<SubjectDetails />} />
          </Route>
        </Route>

        {/* ---------------- Protected UniCollab ---------------- */}

        <Route
          path="/unicollab"
          element={
            <Protected>
              <UniCollabLayout />
            </Protected>
          }
        >
          {/* Feed */}
          <Route index element={<UniCollab />} />

          {/* Explore */}
          <Route path="explore" element={<ExploreView />} />

          {/* All Users */}
          <Route path="users" element={<UsersView />} />

          {/* Search */}
          <Route path="search" element={<SearchView />} />

          {/* Create */}
          <Route path="create-post" element={<CreatePostPage />} />

          {/* Single Post */}
          <Route path="post/:id" element={<PostView />} />

          {/* Messages */}
          <Route path="messages" element={<MessengerView />} />

          {/* User Profile */}
          <Route path="profile">
            <Route index element={<Navigate to="/unicollab" replace />} />
            <Route path=":id" element={<ProfileView />} />
          </Route>
        </Route>

        {/* ---------------- 404 ---------------- */}

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#080912]">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-white">404</h1>
                <p className="mt-3 text-gray-400">Page not found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </SocketProvider>
  )
}

export default App






