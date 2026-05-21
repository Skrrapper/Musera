/**
 * 用户认证模块 API
 * 包含：发送验证码、注册、登录、刷新Token、登出
 */

import { post, setToken, setRefreshToken, clearTokens } from '../request'
import { normalizeUserAssets } from '../assets'

/**
 * 发送短信验证码
 * @param {string} phone - 手机号
 * @param {string} type - 类型: register(注册) / login(登录) / reset(重置密码)
 * @returns {Promise}
 */
export const sendSmsCode = (phone, type) => {
  return post('/auth/sms/send', { phone, type }, { auth: false })
}

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 短信验证码
 * @returns {Promise}
 */
export const register = async (data) => {
  const result = await post('/auth/register', data, { auth: false })
  return normalizeUserAssets(result.data)
}

/**
 * 用户登录
 * 支持两种方式：
 * 1. 手机号 + 验证码: { phone, code }
 * 2. 用户名 + 密码: { username, password }
 * @param {Object} credentials - 登录凭证
 * @returns {Promise}
 */
export const login = async (credentials) => {
  const result = await post('/auth/login', credentials, { auth: false })
  const { access_token, refresh_token, user } = result.data
  
  // 存储 Token
  setToken(access_token)
  if (refresh_token) {
    setRefreshToken(refresh_token)
  }
  
  return {
    user: normalizeUserAssets(user),
    accessToken: access_token,
    refreshToken: refresh_token
  }
}

/**
 * 刷新 Token
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise}
 */
export const refreshToken = async (refreshToken) => {
  const result = await post('/auth/refresh', { refresh_token: refreshToken }, { auth: false })
  const { access_token } = result.data
  setToken(access_token)
  return result.data
}

/**
 * 用户登出
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    await post('/auth/logout')
  } finally {
    clearTokens()
  }
}

export default {
  sendSmsCode,
  register,
  login,
  refreshToken,
  logout
}

