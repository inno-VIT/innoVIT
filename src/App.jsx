import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './utils/AuthContext'
import { SocketProvider } from './utils/SocketContext'

// innoVIT Components
import Header from './components/innoVIT/Header.jsx'
import Hero from './components/innoVIT/Hero.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Study from './components/study/Study.jsx'
import UniCollab from './components/unicollab/UniCollab.jsx'
import Default from './components/study/StudyDefault.jsx'
import SubjectDetails from './components/study/SubjectDetails.jsx'
import Profile from './components/Profile.jsx'

// About Platform Components
import AboutCommunity from './components/unicollab/about-platform/AboutCommunity.jsx'
import CodeOfConduct from './components/unicollab/about-platform/CodeOfConduct.jsx'
import PrivacyPolicy from './components/unicollab/about-platform/PrivacyPolicy.jsx'
import TermsOfService from './components/unicollab/about-platform/TermsOfService.jsx'

// UniCollab Views (Social Media Features)
import ExploreView from './components/unicollab/views/ExploreView.jsx'
import PostView from './components/unicollab/views/PostView.jsx'
import CreatePostPage from './components/unicollab/views/CreatePostPage.jsx'
import ProfileView from './components/unicollab/views/ProfileView.jsx'
import MessengerView from './components/unicollab/views/MessengerView.jsx'
import SearchView from './components/unicollab/views/SearchView.jsx'
import Protected from './components/Protected.jsx'
import Layout from './components/unicollab/layout/Layout.jsx'

const App = () => {
  const { loading } = useAuth()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#080912]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-300'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SocketProvider>
      <div className='relative min-h-screen bg-[#080912]'>
        <Header />

        {/* Main content area */}
        <main className='relative z-10'>
          <Routes>
            {/* Public Routes */}
            <Route path='/' element={<Hero />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/about' element={<AboutCommunity />} />
            <Route path='/code-of-conduct' element={<CodeOfConduct />} />
            <Route path='/privacy' element={<PrivacyPolicy />} />
            <Route path='/terms' element={<TermsOfService />} />

            {/* Study Routes */}
            <Route path='/study' element={<Study />}>
              <Route index element={<Default />} />
              <Route path=':subjectCode' element={<SubjectDetails />} />
            </Route>

            {/* Profile Route */}
            <Route path='/profile' element={<Profile />} />

            {/* UniCollab Social Media Routes */}
            <Route
              path='/unicollab'
              element={
                <Protected>
                  <Layout>
                    <UniCollab />
                  </Layout>
                </Protected>
              }
            />

            <Route
              path='/unicollab/explore'
              element={
                <Protected>
                  <Layout>
                    <ExploreView />
                  </Layout>
                </Protected>
              }
            />

            <Route
              path='/unicollab/create-post'
              element={
                <Protected>
                  <Layout>
                    <CreatePostPage />
                  </Layout>
                </Protected>
              }
            />

            <Route
              path='/unicollab/post/:id'
              element={
                <Protected>
                  <Layout>
                    <PostView />
                  </Layout>
                </Protected>
              }
            />

            <Route
              path='/unicollab/messages'
              element={
                <Protected>
                  <Layout>
                    <MessengerView />
                  </Layout>
                </Protected>
              }
            />

            <Route
              path='/unicollab/profile/:id?'
              element={
                <Protected>
                  <Layout>
                    <ProfileView />
                  </Layout>
                </Protected>
              }
            />

            <Route
              path='/unicollab/search'
              element={
                <Protected>
                  <Layout>
                    <SearchView />
                  </Layout>
                </Protected>
              }
            />

            {/* Catch-all route for 404 */}
            <Route
              path='*'
              element={
                <div className='min-h-screen flex items-center justify-center bg-[#080912]'>
                  <div className='text-center'>
                    <h1 className='text-4xl font-bold text-white mb-4'>404</h1>
                    <p className='text-gray-300'>Page not found</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </SocketProvider>
  )
}

export default App

// import Header from './components/innoVIT/Header.jsx'
// import Hero from './components/innoVIT/Hero.jsx'
// import Login from './components/Login.jsx'
// import Signup from './components/Signup.jsx'
// import Study from './components/study/Study.jsx'
// import UniCollab from './components/unicollab/UniCollab.jsx'
// import Default from './components/study/StudyDefault.jsx'
// import { Routes, Route } from 'react-router-dom'
// import { React } from 'react'
// import { useAuth } from './utils/AuthContext.jsx'

// import SubjectDetails from './components/study/SubjectDetails.jsx'
// import Profile from './components/Profile.jsx'
// import AboutCommunity from './components/unicollab/about-platform/AboutCommunity.jsx'
// import CodeOfConduct from './components/unicollab/about-platform/CodeOfConduct.jsx'
// import PrivacyPolicy from './components/unicollab/about-platform/PrivacyPolicy.jsx'
// import TermsOfService from './components/unicollab/about-platform/TermsOfService.jsx'

// const App = () => {
//   const { loading } = useAuth()

//   // Show loading while checking authentication
//   if (loading) {
//     return (
//       <div className='min-h-screen flex items-center justify-center bg-[#080912]'>
//         <div className='text-center'>
//           <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
//           <p className='mt-4 text-gray-300'>Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className='relative min-h-screen bg-[#080912]'>
//       <Header />

//       {/* Main content area */}
//       <main className='relative z-10'>
//         <Routes>
//           <Route path='/' element={<Hero />} />
//           <Route path='/login' element={<Login />} />
//           <Route path='/signup' element={<Signup />} />
//           <Route path='/unicollab' element={<UniCollab />} />
//           <Route path='/profile' element={<Profile />} />
//           <Route path='/about' element={<AboutCommunity />} />
//           <Route path='/code-of-conduct' element={<CodeOfConduct />} />
//           <Route path='/privacy' element={<PrivacyPolicy />} />
//           <Route path='/terms' element={<TermsOfService />} />
//           <Route path='/study' element={<Study />}>
//             <Route index element={<Default />} />
//             <Route path=':subjectCode' element={<SubjectDetails />} />
//           </Route>
//         </Routes>
//       </main>
//     </div>
//   )
// }

// export default App

// // ? https://innovit-server.onrender.com
