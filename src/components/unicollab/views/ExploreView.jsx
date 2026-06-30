import React from 'react'
import Layout from '../layout/Layout'
import PostBrowser from '../components/PostBrowser'
// import { isLoggedIn } from '../../../utils/AuthContext'

const ExploreView = () => {
  return (
    <Layout>
      <PostBrowser createPost contentType='posts' />
    </Layout>
  )
}

export default ExploreView
