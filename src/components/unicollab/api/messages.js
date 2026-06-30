import { axiosConfig } from '../../../axiosConfig'

const getConversations = async user => {
  try {
    const res = await axiosConfig.get('/api/messages', {
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

const getMessages = async (user, conversationId) => {
  try {
    const res = await axiosConfig.get(`/api/messages/${conversationId}`, {
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

const sendMessage = async (user, message, recipientId) => {
  try {
    const res = await axiosConfig.post(
      `/api/messages/${recipientId}`,
      message,
      {
        headers: {
          'x-access-token': user.token,
        },
      },
    )
    return res.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

export { getConversations, getMessages, sendMessage }
