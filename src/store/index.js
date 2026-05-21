import { defineStore } from 'pinia'
import { ref } from 'vue'

// API 模块
import * as authApi from '../utils/api/auth'
import * as usersApi from '../utils/api/users'
import * as artworksApi from '../utils/api/artworks'
import * as categoriesApi from '../utils/api/categories'
import * as ordersApi from '../utils/api/orders'
import * as addressesApi from '../utils/api/addresses'
import * as chatApi from '../utils/api/chat'
import * as forumApi from '../utils/api/forum'

export const useAppStore = defineStore('app', () => {
  // ==================== 状态 ====================
  
  // 用户状态
  const user = ref(null)
  const token = ref(uni.getStorageSync('token') || '')
  const refreshToken = ref(uni.getStorageSync('refreshToken') || '')
  const avatarVersion = ref(Date.now())
  
  // UI 状态
  const loading = ref(false)
  const toast = ref(null)
  const matchModal = ref(null)
  const themeIntro = ref(null)
  
  // 数据状态
  const artworks = ref([])
  const featuredArtworks = ref([])
  const categories = ref([])
  const hotTags = ref([])
  const conversations = ref([])
  const currentMessages = ref([])
  const currentArtwork = ref(null)
  const unreadCount = ref(0)

  const syncAuthState = ({ accessToken = '', refreshToken: nextRefreshToken = '', user: nextUser = null } = {}) => {
    token.value = accessToken || ''
    refreshToken.value = nextRefreshToken || ''
    user.value = nextUser
    if (nextUser?.avatar) {
      avatarVersion.value = Date.now()
    }

    if (token.value) {
      uni.setStorageSync('token', token.value)
    } else {
      uni.removeStorageSync('token')
    }

    if (refreshToken.value) {
      uni.setStorageSync('refreshToken', refreshToken.value)
    } else {
      uni.removeStorageSync('refreshToken')
    }
  }
  
  // ==================== 用户相关方法 ====================
  
  const sendSmsCode = async (phone, type = 'login') => {
    const result = await authApi.sendSmsCode(phone, type)
    return result
  }
  
  const register = async (data) => {
    const result = await authApi.register(data)
    if (result) {
      user.value = result
    }
    return result
  }
  
  const login = async (data) => {
    const result = await authApi.login(data)
    if (result?.accessToken) {
      syncAuthState({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      })
    }
    return result
  }
  
  const refreshAccessToken = async () => {
    if (!refreshToken.value) return false
    const result = await authApi.refreshToken(refreshToken.value)
    if (result?.access_token) {
      token.value = result.access_token
      uni.setStorageSync('token', result.access_token)
      if (result.refresh_token) {
        refreshToken.value = result.refresh_token
        uni.setStorageSync('refreshToken', result.refresh_token)
      }
      return true
    }
    return false
  }
  
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {}
    token.value = ''
    refreshToken.value = ''
    user.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
  }
  
  const getCurrentUser = async () => {
    const result = await usersApi.getCurrentUser()
    if (result.code === 200 && result.data) {
      user.value = result.data
    }
    return result
  }
  
  const updateUser = async (data) => {
    const result = await usersApi.updateUser(data)
    if (result.code === 200 && result.data) {
      user.value = result.data
      if (Object.prototype.hasOwnProperty.call(data, 'avatar')) {
        avatarVersion.value = Date.now()
      }
    }
    return result
  }
  
  // ==================== 艺术品相关方法 ====================
  
  const fetchArtworks = async (params = {}) => {
    const result = await artworksApi.getArtworks(params)
    if (result.code === 200 && result.data) {
      if (params.page === 1) {
        artworks.value = result.data.items || result.data
      } else {
        artworks.value = [...artworks.value, ...(result.data.items || result.data)]
      }
    }
    return result
  }
  
  const fetchFeaturedArtworks = async () => {
    const result = await artworksApi.getFeaturedArtworks()
    if (result.code === 200 && result.data) {
      featuredArtworks.value = result.data.items || result.data
    }
    return result
  }
  
  const fetchArtworkById = async (id) => {
    const result = await artworksApi.getArtworkById(id)
    if (result.code === 200 && result.data) {
      currentArtwork.value = result.data
    }
    return result.data
  }
  
  const createArtwork = async (data) => {
    return await artworksApi.createArtwork(data)
  }
  
  const updateArtwork = async (id, data) => {
    return await artworksApi.updateArtwork(id, data)
  }
  
  const deleteArtwork = async (id) => {
    const result = await artworksApi.deleteArtwork(id)
    if (result.code === 200) {
      artworks.value = artworks.value.filter(a => a.id !== id)
    }
    return result
  }
  
  const likeArtwork = async (id) => {
    return await artworksApi.likeArtwork(id)
  }
  
  const unlikeArtwork = async (id) => {
    return await artworksApi.unlikeArtwork(id)
  }
  
  const collectArtwork = async (id) => {
    return await artworksApi.collectArtwork(id)
  }
  
  const uncollectArtwork = async (id) => {
    return await artworksApi.uncollectArtwork(id)
  }
  
  // ==================== 分类相关方法 ====================
  
  const fetchCategories = async () => {
    const result = await categoriesApi.getCategories()
    if (result.code === 200 && result.data) {
      categories.value = result.data.items || result.data
    }
    return result
  }
  
  const fetchHotTags = async () => {
    const result = await categoriesApi.getHotTags()
    if (result.code === 200 && result.data) {
      hotTags.value = result.data.items || result.data
    }
    return result
  }
  
  // ==================== 订单相关方法 ====================
  
  const createOrder = async (data) => {
    return await ordersApi.createOrder(data)
  }
  
  const fetchOrders = async (params = {}) => {
    return await ordersApi.getOrders(params)
  }
  
  const fetchOrderById = async (id) => {
    return await ordersApi.getOrderById(id)
  }
  
  const payOrder = async (id) => {
    return await ordersApi.payOrder(id)
  }
  
  const cancelOrder = async (id) => {
    return await ordersApi.cancelOrder(id)
  }
  
  const confirmOrder = async (id) => {
    return await ordersApi.confirmOrder(id)
  }
  
  // ==================== 地址相关方法 ====================
  
  const fetchAddresses = async () => {
    return await addressesApi.getAddresses()
  }
  
  const createAddress = async (data) => {
    return await addressesApi.createAddress(data)
  }
  
  const updateAddress = async (id, data) => {
    return await addressesApi.updateAddress(id, data)
  }
  
  const deleteAddress = async (id) => {
    return await addressesApi.deleteAddress(id)
  }
  
  const setDefaultAddress = async (id) => {
    return await addressesApi.setDefaultAddress(id)
  }
  
  // ==================== 聊天相关方法 ====================
  
  const fetchConversations = async () => {
    const result = await chatApi.getConversations()
    if (result.code === 200 && result.data) {
      conversations.value = result.data.items || result.data
    }
    return result
  }
  
  const fetchMessages = async (conversationId, params = {}) => {
    const result = await chatApi.getMessages(conversationId, params)
    if (result.code === 200 && result.data) {
      currentMessages.value = result.data.items || result.data
    }
    return result
  }
  
  const sendMessage = async (conversationId, data) => {
    return await chatApi.sendMessage(conversationId, data)
  }
  
  const markMessagesAsRead = async (conversationId) => {
    return await chatApi.markAsRead(conversationId)
  }
  
  const getOrCreatePrivateConversation = async (userId) => {
    const result = await chatApi.getOrCreatePrivateConversation(userId)
    return result.data
  }
  
  // ==================== 论坛相关方法 ====================
  
  const fetchPosts = async (params = {}) => {
    return await forumApi.getPosts(params)
  }
  
  const createPost = async (data) => {
    return await forumApi.createPost(data)
  }
  
  const fetchPostById = async (id) => {
    return await forumApi.getPostById(id)
  }
  
  const deletePost = async (id) => {
    return await forumApi.deletePost(id)
  }
  
  const likePost = async (id) => {
    return await forumApi.likePost(id)
  }
  
  const unlikePost = async (id) => {
    return await forumApi.unlikePost(id)
  }
  
  const fetchComments = async (postId, params = {}) => {
    return await forumApi.getComments(postId, params)
  }
  
  const createComment = async (postId, data) => {
    return await forumApi.createComment(postId, data)
  }
  
  const likeComment = async (postId, commentId) => {
    return await forumApi.likeComment(postId, commentId)
  }
  
  const unlikeComment = async (postId, commentId) => {
    return await forumApi.unlikeComment(postId, commentId)
  }
  
  // ==================== 用户关系相关方法 ====================
  
  const followUser = async (userId) => {
    if (user.value?.id && Number(user.value.id) === Number(userId)) {
      throw new Error('不能关注自己')
    }
    return await usersApi.followUser(userId)
  }
  
  const unfollowUser = async (userId) => {
    return await usersApi.unfollowUser(userId)
  }
  
  const fetchUserProfile = async (userId) => {
    const result = await usersApi.getUserProfile(userId)
    return result.data
  }

  const fetchUserArtworks = async (userId, params = {}) => {
    return await usersApi.getUserArtworks(userId, params)
  }
  
  // ==================== UI 方法 ====================
  
  const showToast = (options) => {
    toast.value = {
      title: typeof options === 'string' ? options : options.title,
      icon: options.icon || 'none',
      duration: options.duration || 2000,
      ...options
    }
    uni.showToast(toast.value)
  }
  
  const clearToast = () => {
    toast.value = null
    uni.hideToast()
  }
  
  const showMatchModal = (data) => {
    matchModal.value = data
  }
  
  const closeMatchModal = () => {
    matchModal.value = null
  }
  
  const showThemeIntro = (data) => {
    themeIntro.value = data
  }
  
  const closeThemeIntro = () => {
    themeIntro.value = null
  }
  
  const setLoading = (state) => {
    loading.value = state
  }
  
  // ==================== 初始化 ====================
  
  const initApp = async () => {
    if (token.value) {
      try {
        await getCurrentUser()
        await Promise.all([
          fetchCategories(),
          fetchHotTags(),
          fetchFeaturedArtworks()
        ])
      } catch (error) {
        console.error('初始化失败:', error)
      }
    }
  }
  
  // ==================== 导出 ====================
  return {
    // 状态
    user,
    token,
    refreshToken,
    avatarVersion,
    loading,
    toast,
    matchModal,
    themeIntro,
    artworks,
    featuredArtworks,
    categories,
    hotTags,
    conversations,
    currentMessages,
    currentArtwork,
    unreadCount,
    
    // 用户相关
    sendSmsCode,
    register,
    login,
    refreshAccessToken,
    logout,
    getCurrentUser,
    updateUser,
    
    // 艺术品相关
    fetchArtworks,
    fetchFeaturedArtworks,
    fetchArtworkById,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    likeArtwork,
    unlikeArtwork,
    collectArtwork,
    uncollectArtwork,
    
    // 分类相关
    fetchCategories,
    fetchHotTags,
    
    // 订单相关
    createOrder,
    fetchOrders,
    fetchOrderById,
    payOrder,
    cancelOrder,
    confirmOrder,
    
    // 地址相关
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    
    // 聊天相关
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    getOrCreatePrivateConversation,
    
    // 论坛相关
    fetchPosts,
    createPost,
    fetchPostById,
    deletePost,
    likePost,
    unlikePost,
    fetchComments,
    createComment,
    likeComment,
    unlikeComment,
    
    // 用户关系
    followUser,
    unfollowUser,
    fetchUserProfile,
    fetchUserArtworks,
    
    // UI
    showToast,
    clearToast,
    showMatchModal,
    closeMatchModal,
    showThemeIntro,
    closeThemeIntro,
    setLoading,
    
    // 初始化
    initApp
  }
})
