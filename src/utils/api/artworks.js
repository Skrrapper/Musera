/**
 * 艺术品模块 API
 * 包含：艺术品列表、详情、创建、更新、删除、点赞、收藏
 */

import { get, post, patch, del } from '../request'
import { normalizeArtworkAssets, normalizeArtworkCollection } from '../assets'

/**
 * 获取艺术品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.page_size - 每页数量，默认20
 * @param {number} params.category_id - 分类ID
 * @param {number} params.artist_id - 艺术家ID
 * @param {string} params.tag - 标签名称
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.sort - 排序: latest/popular/price_asc/price_desc
 * @param {number} params.min_price - 最低价格
 * @param {number} params.max_price - 最高价格
 * @param {string} params.status - 状态: active/sold
 * @returns {Promise}
 */
export const getArtworks = async (params = {}) => {
  const result = await get('/artworks', params)
  return {
    ...result,
    data: normalizeArtworkCollection(result.data)
  }
}

/**
 * 获取精选艺术品
 * @param {number} limit - 数量限制，默认10
 * @returns {Promise}
 */
export const getFeaturedArtworks = async (limit = 10) => {
  const result = await get('/artworks/featured', { limit })
  return {
    ...result,
    data: normalizeArtworkCollection(result.data)
  }
}

/**
 * 获取艺术品详情
 * @param {number} artworkId - 艺术品ID
 * @returns {Promise}
 */
export const getArtworkById = async (artworkId) => {
  const result = await get(`/artworks/${artworkId}`)
  return {
    ...result,
    data: normalizeArtworkAssets(result.data)
  }
}

/**
 * 创建艺术品（艺术家）
 * @param {Object} data - 艺术品数据
 * @param {string} data.title - 标题（必填）
 * @param {string} data.description - 描述
 * @param {string} data.cover_image - 封面图片URL（必填）
 * @param {string[]} data.images - 图片URL数组
 * @param {number} data.price - 价格（必填）
 * @param {number} data.original_price - 原价
 * @param {number} data.category_id - 分类ID（必填）
 * @param {string} data.medium - 材质/媒介
 * @param {string} data.dimensions - 尺寸
 * @param {number} data.year - 创作年份
 * @param {number} data.stock - 库存，默认1
 * @param {number[]} data.tag_ids - 标签ID数组
 * @returns {Promise}
 */
export const createArtwork = async (data) => {
  const result = await post('/artworks', data)
  return {
    ...result,
    data: normalizeArtworkAssets(result.data)
  }
}

/**
 * 更新艺术品
 * @param {number} artworkId - 艺术品ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateArtwork = async (artworkId, data) => {
  const result = await patch(`/artworks/${artworkId}`, data)
  return {
    ...result,
    data: normalizeArtworkAssets(result.data)
  }
}

/**
 * 删除艺术品
 * @param {number} artworkId - 艺术品ID
 * @returns {Promise}
 */
export const deleteArtwork = (artworkId) => {
  return del(`/artworks/${artworkId}`)
}

/**
 * 点赞艺术品
 * @param {number} artworkId - 艺术品ID
 * @returns {Promise<{is_liked: boolean, like_count: number}>}
 */
export const likeArtwork = (artworkId) => {
  return post(`/artworks/${artworkId}/like`)
}

/**
 * 取消点赞艺术品
 * @param {number} artworkId - 艺术品ID
 * @returns {Promise}
 */
export const unlikeArtwork = (artworkId) => {
  return del(`/artworks/${artworkId}/like`)
}

/**
 * 收藏艺术品
 * @param {number} artworkId - 艺术品ID
 * @returns {Promise}
 */
export const collectArtwork = (artworkId) => {
  return post(`/artworks/${artworkId}/collect`)
}

/**
 * 取消收藏艺术品
 * @param {number} artworkId - 艺术品ID
 * @returns {Promise}
 */
export const uncollectArtwork = (artworkId) => {
  return del(`/artworks/${artworkId}/collect`)
}

export default {
  getArtworks,
  getFeaturedArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  likeArtwork,
  unlikeArtwork,
  collectArtwork,
  uncollectArtwork
}

