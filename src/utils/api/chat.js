/**
 * 聊天模块 API
 * 包含：会话管理、消息发送、WebSocket连接
 */

import { get, post } from '../request'
import { getToken } from '../request'
import { normalizeArtworkAssets, normalizeUserAssets, resolveAssetList } from '../assets'

// WebSocket 连接实例
let userWebSocket = null
let chatRoomWebSocket = null

// WebSocket 消息回调
const messageCallbacks = new Set()

/**
 * 添加消息回调
 * @param {Function} callback - 回调函数
 */
export const addMessageCallback = (callback) => {
  messageCallbacks.add(callback)
}

/**
 * 移除消息回调
 * @param {Function} callback - 回调函数
 */
export const removeMessageCallback = (callback) => {
  messageCallbacks.delete(callback)
}

/**
 * 触发消息回调
 * @param {Object} message - 消息对象
 */
const triggerCallbacks = (message) => {
  messageCallbacks.forEach(callback => {
    try {
      callback(message)
    } catch (e) {
      console.error('WebSocket callback error:', e)
    }
  })
}

const normalizeConversation = (conversation) => {
  if (!conversation || typeof conversation !== 'object') {
    return conversation
  }

  return {
    ...conversation,
    user: normalizeUserAssets(conversation.user)
  }
}

const normalizeMessage = (message) => {
  if (!message || typeof message !== 'object') {
    return message
  }

  return {
    ...message,
    user: normalizeUserAssets(message.user),
    artwork: normalizeArtworkAssets(message.artwork),
    images: resolveAssetList(message.images)
  }
}

const normalizeCollection = (data, mapper) => {
  if (Array.isArray(data)) {
    return data.map(mapper)
  }

  if (data && Array.isArray(data.items)) {
    return {
      ...data,
      items: data.items.map(mapper)
    }
  }

  return mapper(data)
}

// ==================== 会话管理 ====================

/**
 * 获取会话列表
 * @returns {Promise}
 */
export const getConversations = async () => {
  const result = await get('/conversations')
  return {
    ...result,
    data: normalizeCollection(result.data, normalizeConversation)
  }
}

/**
 * 获取聊天记录
 * @param {number} conversationId - 会话ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @param {number} params.before_id - 获取此ID之前的消息（用于加载更多）
 * @returns {Promise}
 */
export const getMessages = async (conversationId, params = {}) => {
  const result = await get(`/conversations/${conversationId}/messages`, params)
  return {
    ...result,
    data: normalizeCollection(result.data, normalizeMessage)
  }
}

/**
 * 发送消息
 * @param {number} conversationId - 会话ID
 * @param {Object} data - 消息数据
 * @param {string} data.content - 消息内容（必填）
 * @param {string} data.message_type - 消息类型，默认text
 * @param {number} data.artwork_id - 艺术品ID（发送艺术品卡片时需要）
 * @returns {Promise}
 */
export const sendMessage = async (conversationId, data) => {
  const result = await post(`/conversations/${conversationId}/messages`, data)
  return {
    ...result,
    data: normalizeMessage(result.data)
  }
}

/**
 * 标记消息已读
 * @param {number} conversationId - 会话ID
 * @returns {Promise}
 */
export const markAsRead = (conversationId) => {
  return post(`/conversations/${conversationId}/read`)
}

/**
 * 获取或创建私人聊天室
 * @param {number} userId - 目标用户ID
 * @returns {Promise}
 */
export const getOrCreatePrivateConversation = (userId) => {
  return get(`/conversations/private/${userId}`)
}

// ==================== WebSocket 连接 ====================

/**
 * 连接用户私聊 WebSocket
 * @param {number} userId - 用户ID
 * @returns {WebSocket}
 */
export const connectUserWebSocket = (userId) => {
  if (userWebSocket) {
    userWebSocket.close()
  }
  
  const token = getToken()
  const wsUrl = `wss://api.muse-app.com/api/v1/ws/user/${userId}?token=${token}`
  
  userWebSocket = uni.connectSocket({
    url: wsUrl,
    success: () => {
      console.log('User WebSocket connecting...')
    },
    fail: (err) => {
      console.error('User WebSocket connection failed:', err)
    }
  })
  
  uni.onSocketOpen(() => {
    console.log('User WebSocket connected')
  })
  
  uni.onSocketMessage((res) => {
    try {
      const message = JSON.parse(res.data)
      triggerCallbacks(message)
    } catch (e) {
      console.error('Parse WebSocket message error:', e)
    }
  })
  
  uni.onSocketError((err) => {
    console.error('User WebSocket error:', err)
  })
  
  uni.onSocketClose(() => {
    console.log('User WebSocket closed')
    userWebSocket = null
  })
  
  return userWebSocket
}

/**
 * 发送私聊消息（通过WebSocket）
 * @param {number} toUserId - 目标用户ID
 * @param {Object} data - 消息数据
 */
export const sendPrivateMessage = (toUserId, data) => {
  const message = {
    type: 'private',
    to: String(toUserId),
    data
  }
  uni.sendSocketMessage({
    data: JSON.stringify(message)
  })
}

/**
 * 发送广播消息（通过WebSocket）
 * @param {Object} data - 消息数据
 */
export const sendBroadcastMessage = (data) => {
  const message = {
    type: 'broadcast',
    data
  }
  uni.sendSocketMessage({
    data: JSON.stringify(message)
  })
}

/**
 * 关闭用户 WebSocket 连接
 */
export const closeUserWebSocket = () => {
  if (userWebSocket) {
    uni.closeSocket()
    userWebSocket = null
  }
}

/**
 * 连接聊天室 WebSocket
 * @param {string} roomId - 聊天室ID
 * @returns {WebSocket}
 */
export const connectChatRoom = (roomId) => {
  if (chatRoomWebSocket) {
    chatRoomWebSocket.close()
  }
  
  const wsUrl = `wss://api.muse-app.com/api/v1/ws/chat/${roomId}`
  
  chatRoomWebSocket = uni.connectSocket({
    url: wsUrl,
    success: () => {
      console.log('Chat Room WebSocket connecting...')
    },
    fail: (err) => {
      console.error('Chat Room WebSocket connection failed:', err)
    }
  })
  
  uni.onSocketOpen(() => {
    console.log('Chat Room WebSocket connected')
  })
  
  uni.onSocketMessage((res) => {
    try {
      const message = JSON.parse(res.data)
      triggerCallbacks(message)
    } catch (e) {
      console.error('Parse WebSocket message error:', e)
    }
  })
  
  return chatRoomWebSocket
}

/**
 * 发送聊天室消息
 * @param {string} content - 消息内容
 */
export const sendChatRoomMessage = (content) => {
  uni.sendSocketMessage({
    data: JSON.stringify({ content })
  })
}

/**
 * 关闭聊天室 WebSocket 连接
 */
export const closeChatRoom = () => {
  if (chatRoomWebSocket) {
    uni.closeSocket()
    chatRoomWebSocket = null
  }
}

export default {
  // 会话管理
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getOrCreatePrivateConversation,
  
  // WebSocket
  connectUserWebSocket,
  sendPrivateMessage,
  sendBroadcastMessage,
  closeUserWebSocket,
  connectChatRoom,
  sendChatRoomMessage,
  closeChatRoom,
  
  // 回调
  addMessageCallback,
  removeMessageCallback
}

