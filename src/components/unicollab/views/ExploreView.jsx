import React from 'react'
// import Layout from '../layout/Layout'
import PostBrowser from '../components/feed/PostBrowser'
// import { isLoggedIn } from '../../../utils/AuthContext'

const ExploreView = () => {
  return (
    <>
      <PostBrowser createPost contentType='posts' />
    </>
  )
}

export default ExploreView
