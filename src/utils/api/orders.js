/**
 * 订单模块 API
 */

import { get, post } from '../request'

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @param {number} data.address_id - 收货地址ID（必填）
 * @param {Array} data.artworks - 艺术品列表
 * @param {number} data.artworks[].artwork_id - 艺术品ID
 * @param {number} data.artworks[].quantity - 数量
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export const createOrder = (data) => {
  return post('/orders', data)
}

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @param {string} params.status - 状态筛选: pending/paid/shipped/completed/cancelled/refunded
 * @returns {Promise}
 */
export const getOrders = (params = {}) => {
  return get('/orders', params)
}

/**
 * 获取订单详情
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const getOrderById = (orderId) => {
  return get(`/orders/${orderId}`)
}

/**
 * 支付订单
 * @param {number} orderId - 订单ID
 * @param {string} paymentMethod - 支付方式: wechat/alipay
 * @returns {Promise<{payment_url: string, order_no: string}>}
 */
export const payOrder = (orderId, paymentMethod) => {
  return post(`/orders/${orderId}/pay`, { payment_method: paymentMethod })
}

/**
 * 取消订单
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const cancelOrder = (orderId) => {
  return post(`/orders/${orderId}/cancel`)
}

/**
 * 确认收货
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const confirmOrder = (orderId) => {
  return post(`/orders/${orderId}/confirm`)
}

export default {
  createOrder,
  getOrders,
  getOrderById,
  payOrder,
  cancelOrder,
  confirmOrder
}
