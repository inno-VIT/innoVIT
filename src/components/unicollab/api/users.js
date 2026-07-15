import { axiosConfig } from '../../../axiosConfig'

// Social features - user profiles, random users, etc.
const getUser = async userId => {
  try {
    const res = await axiosConfig.get(`/api/users/${userId}`)
    return res.data.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

const getRandomUsers = async query => {
  try {
    const res = await axiosConfig.get('/api/users/random', {
      params: query,
    })
    return res.data.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

const updateUser = async (user, data) => {
  try {
    const res = await axiosConfig.patch(`/api/users/${user._id}`, data, {
      headers: {
        'x-access-token': user.token,
      },
    })
    return res.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

// Follow/unfollow functionality
const followUser = async (userId, currentUser) => {
  try {
    const res = await axiosConfig.post(
      `/api/users/${userId}/follow`,
      {},
      {
        headers: {
          'x-access-token': currentUser.token,
        },
      },
    )

    return res.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

const unfollowUser = async (userId, currentUser) => {
  try {
    const res = await axiosConfig.delete(
      `/api/users/${userId}/follow`,
      {
        headers: {
          'x-access-token': currentUser.token,
        },
      },
    )

    return res.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

export { getUser, getRandomUsers, updateUser, followUser, unfollowUser }
