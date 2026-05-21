/**
 * 社区论坛模块 API
 */

import { get, post, del } from '../request'
import { normalizeArtworkAssets, normalizeArtworkCollection, normalizeUserAssets, resolveAssetList } from '../assets'

const normalizePost = (post) => {
  if (!post || typeof post !== 'object') {
    return post
  }

  return {
    ...post,
    user: normalizeUserAssets(post.user),
    artwork: normalizeArtworkAssets(post.artwork),
    images: resolveAssetList(post.images)
  }
}

const normalizePostCollection = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalizePost)
  }

  if (data && Array.isArray(data.items)) {
    return {
      ...data,
      items: data.items.map(normalizePost)
    }
  }

  return normalizePost(data)
}

/**
 * 获取帖子列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @param {string} params.sort - 排序: latest/popular
 * @param {number} params.artwork_id - 关联艺术品ID
 * @returns {Promise}
 */
export const getPosts = async (params = {}) => {
  const result = await get('/forum/posts', params)
  return {
    ...result,
    data: normalizePostCollection(result.data)
  }
}

/**
 * 创建帖子
 * @param {Object} data - 帖子数据
 * @param {string} data.title - 标题（可选）
 * @param {string} data.content - 内容（必填）
 * @param {string[]} data.images - 图片URL数组（最多9张）
 * @param {number} data.artwork_id - 关联艺术品ID（可选）
 * @returns {Promise}
 */
export const createPost = async (data) => {
  const result = await post('/forum/posts', data)
  return {
    ...result,
    data: normalizePost(result.data)
  }
}

/**
 * 获取帖子详情
 * @param {number} postId - 帖子ID
 * @returns {Promise}
 */
export const getPostById = async (postId) => {
  const result = await get(`/forum/posts/${postId}`)
  return {
    ...result,
    data: normalizePost(result.data)
  }
}

/**
 * 删除帖子
 * @param {number} postId - 帖子ID
 * @returns {Promise}
 */
export const deletePost = (postId) => {
  return del(`/forum/posts/${postId}`)
}

/**
 * 点赞帖子
 * @param {number} postId - 帖子ID
 * @returns {Promise}
 */
export const likePost = (postId) => {
  return post(`/forum/posts/${postId}/like`)
}

/**
 * 取消点赞帖子
 * @param {number} postId - 帖子ID
 * @returns {Promise}
 */
export const unlikePost = (postId) => {
  return del(`/forum/posts/${postId}/like`)
}

/**
 * 获取帖子评论
 * @param {number} postId - 帖子ID
 * @returns {Promise}
 */
export const getComments = async (postId) => {
  const result = await get(`/forum/posts/${postId}/comments`)
  return {
    ...result,
    data: normalizePostCollection(result.data)
  }
}

/**
 * 发表评论
 * @param {number} postId - 帖子ID
 * @param {Object} data - 评论数据
 * @param {string} data.content - 内容（必填）
 * @param {number} data.parent_id - 父评论ID（回复评论时需要）
 * @returns {Promise}
 */
export const createComment = async (postId, data) => {
  const result = await post(`/forum/posts/${postId}/comments`, data)
  return {
    ...result,
    data: normalizePost(result.data)
  }
}

/**
 * 点赞评论
 * @param {number} postId - 帖子ID
 * @param {number} commentId - 评论ID
 * @returns {Promise}
 */
export const likeComment = (postId, commentId) => {
  return post(`/forum/posts/${postId}/comments/${commentId}/like`)
}

/**
 * 取消点赞评论
 * @param {number} postId - 帖子ID
 * @param {number} commentId - 评论ID
 * @returns {Promise}
 */
export const unlikeComment = (postId, commentId) => {
  return del(`/forum/posts/${postId}/comments/${commentId}/like`)
}

export default {
  getPosts,
  createPost,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  getComments,
  createComment,
  likeComment,
  unlikeComment
}

