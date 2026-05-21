/**
 * API 兼容层
 * 保持与旧代码的兼容性，同时使用新的 API 模块
 */

// 从新 API 模块导出
import * as authApi from './api/auth'
import * as usersApi from './api/users'
import * as artworksApi from './api/artworks'
import * as categoriesApi from './api/categories'
import * as ordersApi from './api/orders'
import * as addressesApi from './api/addresses'
import * as chatApi from './api/chat'
import * as forumApi from './api/forum'

// Token 管理工具
import { getToken, setToken, getRefreshToken, setRefreshToken, clearTokens, isLoggedIn } from './request'

// ==================== 兼容旧 API 格式 ====================

/**
 * 获取产品列表（兼容旧版）
 */
export const getProducts = async () => {
  const result = await artworksApi.getArtworks()
  return result.data.items || result.data
}

/**
 * 获取分类列表（兼容旧版）
 */
export const getCategories = async () => {
  const result = await categoriesApi.getCategories()
  return result.data.map(c => c.name)
}

/**
 * 获取论坛帖子（兼容旧版）
 */
export const getForumPosts = async () => {
  const result = await forumApi.getPosts()
  return result.data.items || result.data
}

/**
 * 用户登录（兼容旧版）
 */
export const login = async (phone, code) => {
  const result = await authApi.login({ phone, code })
  return {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  }
}

/**
 * 获取产品详情（兼容旧版）
 */
export const getProductById = async (id) => {
  const result = await artworksApi.getArtworkById(id)
  return result.data
}

// ==================== 导出所有模块 ====================

export const api = {
  // 兼容旧版方法
  getProducts,
  getCategories,
  getForumPosts,
  login,
  getProductById,
  
  // 认证模块
  auth: authApi,
  
  // 用户模块
  users: usersApi,
  
  // 艺术品模块
  artworks: artworksApi,
  
  // 分类标签模块
  categories: categoriesApi,
  
  // 订单模块
  orders: ordersApi,
  
  // 地址模块
  addresses: addressesApi,
  
  // 聊天模块
  chat: chatApi,
  
  // 论坛模块
  forum: forumApi,
  
  // Token 管理
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  isLoggedIn
}

export default api

