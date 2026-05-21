/**
 * HTTP Request Module
 * Based on uni.request, supports JWT auth, error handling, request interceptors
 */

// API Base Config
export const API_BASE_URL = 'http://mc.yqst.top:11601/api/v1'

// Token storage keys
const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'

/**
 * Get stored Token
 */
export const getToken = () => {
  return uni.getStorageSync(TOKEN_KEY) || null
}

/**
 * Get stored Refresh Token
 */
export const getRefreshToken = () => {
  return uni.getStorageSync(REFRESH_TOKEN_KEY) || null
}

/**
 * Set Token
 */
export const setToken = (token) => {
  uni.setStorageSync(TOKEN_KEY, token)
}

/**
 * Set Refresh Token
 */
export const setRefreshToken = (token) => {
  uni.setStorageSync(REFRESH_TOKEN_KEY, token)
}

/**
 * Clear all Tokens
 */
export const clearTokens = () => {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(REFRESH_TOKEN_KEY)
}

/**
 * Check if logged in
 */
export const isLoggedIn = () => {
  return !!getToken()
}

/**
 * Handle unified response format
 */
const handleResponse = (response) => {
  const { statusCode, data } = response
  
  if (statusCode >= 200 && statusCode < 300) {
    if (data.code === 200 || data.code === 201) {
      return data
    } else {
      const error = new Error(data.message || '请求失败')
      error.code = data.code
      error.data = data.data
      throw error
    }
  } else if (statusCode === 401) {
    clearTokens()
    uni.switchTab({ url: '/pages/profile/index' })
    throw new Error('登录状态已失效，请重新登录')
  } else if (statusCode === 403) {
    throw new Error('暂无权限访问')
  } else if (statusCode === 404) {
    throw new Error('资源不存在')
  } else if (statusCode === 422) {
    throw new Error('请求参数无效')
  } else if (statusCode === 429) {
    throw new Error('请求过于频繁，请稍后再试')
  } else if (statusCode >= 500) {
    throw new Error('服务暂时不可用，请稍后再试')
  } else {
    throw new Error(data.message || '请求失败（' + statusCode + '）')
  }
}

/**
 * Handle request error
 */
const handleError = (error) => {
  console.error('API Error:', error)
  
  if (error.errMsg && error.errMsg.includes('request:fail')) {
    throw new Error('网络连接失败，请检查网络')
  }
  
  throw error
}

/**
 * Refresh Token
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('暂无刷新令牌')
  }
  
  try {
    const response = await uni.request({
      url: API_BASE_URL + '/auth/refresh',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: { refresh_token: refreshToken }
    })
    
    const result = handleResponse(response)
    setToken(result.data.access_token)
    return result.data.access_token
  } catch (error) {
    clearTokens()
    throw new Error('登录状态刷新失败，请重新登录')
  }
}

/**
 * Core request method
 */
export const request = async (options) => {
  const {
    url,
    method = 'GET',
    data = null,
    header = {},
    auth = true,
    showLoading = false,
    loadingText = '加载中...'
  } = options
  
  if (showLoading) {
    uni.showLoading({ title: loadingText, mask: true })
  }
  
  try {
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    }
    
    if (auth) {
      const token = getToken()
      if (token) {
        requestHeader['Authorization'] = 'Bearer ' + token
      }
    }
    
    const requestOptions = {
      url: API_BASE_URL + url,
      method,
      header: requestHeader,
      timeout: 30000
    }
    
    if (method === 'GET' && data) {
      const queryString = Object.entries(data)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&')
      if (queryString) {
        requestOptions.url += '?' + queryString
      }
    } else if (data) {
      requestOptions.data = data
    }
    
    let response = await uni.request(requestOptions)
    
    if (response.statusCode === 401 && auth) {
      try {
        await refreshAccessToken()
        requestHeader['Authorization'] = 'Bearer ' + getToken()
        response = await uni.request(requestOptions)
      } catch (refreshError) {
        clearTokens()
        uni.switchTab({ url: '/pages/profile/index' })
        throw new Error('登录状态已失效，请重新登录')
      }
    }
    
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  } finally {
    if (showLoading) {
      uni.hideLoading()
    }
  }
}

/**
 * GET request
 */
export const get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

/**
 * POST request
 */
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PATCH request
 */
export const patch = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PATCH',
    data,
    ...options
  })
}

/**
 * DELETE request
 */
export const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * PUT request
 */
export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

export default {
  request,
  get,
  post,
  patch,
  del,
  put,
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  isLoggedIn
}
