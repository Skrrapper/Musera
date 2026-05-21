/**
 * 分类与标签模块 API
 */

import { get } from '../request'

/**
 * 获取分类列表
 * @returns {Promise}
 */
export const getCategories = () => {
  return get('/categories')
}

/**
 * 获取热门标签
 * @param {number} limit - 数量限制，默认20
 * @returns {Promise}
 */
export const getHotTags = (limit = 20) => {
  return get('/tags/hot', { limit })
}

export default {
  getCategories,
  getHotTags
}
