/**
 * 互动模块 API - 通用点赞接口
 */

import { post, del } from '../request'

/**
 * 点赞（通用）
 * @param {string} targetType - 目标类型: artwork/forum_post/comment
 * @param {number} targetId - 目标ID
 * @returns {Promise<{is_liked: boolean, like_count: number}>}
 */
export const like = (targetType, targetId) => {
  return post('/likes', {
    target_type: targetType,
    target_id: targetId
  })
}

/**
 * 取消点赞（通用）
 * @param {string} targetType - 目标类型: artwork/forum_post/comment
 * @param {number} targetId - 目标ID
 * @returns {Promise}
 */
export const unlike = (targetType, targetId) => {
  return del('/likes', {
    target_type: targetType,
    target_id: targetId
  })
}

export default {
  like,
  unlike
}
