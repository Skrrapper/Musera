/**
 * 用户模块 API
 * 包含用户信息、关注、粉丝
 */
import { get, patch, post, del } from '../request'
import { normalizeArtworkCollection, normalizeUserAssets } from '../assets'

const hasArtworkItems = (data) => {
  if (Array.isArray(data)) {
    return data.length > 0
  }

  if (data && Array.isArray(data.items)) {
    return data.items.length > 0
  }

  return false
}

// ==================== 当前用户相关 ====================

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export const getCurrentUser = () => {
  return get('/users/me').then(result => ({
    ...result,
    data: normalizeUserAssets(result.data)
  }))
}

/**
 * 更新当前用户信息
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateCurrentUser = (data) => {
  return patch('/users/me', data).then(result => ({
    ...result,
    data: normalizeUserAssets(result.data)
  }))
}

// 别名导出
export const updateUser = updateCurrentUser

/**
 * 修改密码
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise}
 */
export const changePassword = (oldPassword, newPassword) => {
  return post('/users/me/password', { oldPassword, newPassword })
}

/**
 * 注销账号
 * @returns {Promise}
 */
export const deleteAccount = () => {
  return del('/users/me')
}

// ==================== 用户资料相关 ====================

/**
 * 获取用户主页资料
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export const getUserProfile = (userId) => {
  return get('/users/' + userId).then(result => ({
    ...result,
    data: normalizeUserAssets(result.data)
  }))
}

/**
 * 关注用户
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export const followUser = (userId) => {
  return post('/users/' + userId + '/follow')
}

/**
 * 取消关注用户
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export const unfollowUser = (userId) => {
  return del('/users/' + userId + '/follow')
}

/**
 * 获取用户关注列表
 * @param {number} userId - 用户ID
 * @param {Object} params - 分页参数
 * @returns {Promise}
 */
export const getUserFollowing = (userId, params = {}) => {
  return get('/users/' + userId + '/following', params)
}

/**
 * 获取用户粉丝列表
 * @param {number} userId - 用户ID
 * @param {Object} params - 分页参数
 * @returns {Promise}
 */
export const getUserFollowers = (userId, params = {}) => {
  return get('/users/' + userId + '/followers', params)
}

/**
 * 获取用户发布的艺术品
 * @param {number} userId - 用户ID
 * @param {Object} params - 分页参数
 * @returns {Promise}
 */
export const getUserArtworks = (userId, params = {}) => {
  return get('/users/' + userId + '/artworks', params)
    .then(async (result) => {
      const normalized = {
        ...result,
        data: normalizeArtworkCollection(result.data)
      }

      if (hasArtworkItems(normalized.data)) {
        return normalized
      }

      console.warn('User artworks endpoint returned empty, falling back to /artworks?artist_id=', userId)

      const fallbackResult = await get('/artworks', {
        ...params,
        artist_id: userId
      })

      return {
        ...fallbackResult,
        data: normalizeArtworkCollection(fallbackResult.data)
      }
    })
}

/**
 * 获取我的收藏
 * @param {Object} params - 分页参数
 * @returns {Promise}
 */
export const getMyCollections = (params = {}) => {
  return get('/users/me/collections', params)
}

export default {
  getCurrentUser,
  updateCurrentUser,
  updateUser,
  changePassword,
  deleteAccount,
  getUserProfile,
  followUser,
  unfollowUser,
  getUserFollowing,
  getUserFollowers,
  getUserArtworks,
  getMyCollections
}
