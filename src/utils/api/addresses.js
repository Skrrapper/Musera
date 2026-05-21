/**
 * 收货地址模块 API
 */

import { get, post, patch, del } from '../request'

/**
 * 获取地址列表
 * @returns {Promise}
 */
export const getAddresses = () => {
  return get('/addresses')
}

/**
 * 添加地址
 * @param {Object} data - 地址数据
 * @param {string} data.name - 收货人姓名（必填）
 * @param {string} data.phone - 手机号（必填）
 * @param {string} data.province - 省（必填）
 * @param {string} data.city - 市（必填）
 * @param {string} data.district - 区（必填）
 * @param {string} data.address - 详细地址（必填）
 * @param {boolean} data.is_default - 是否默认，默认false
 * @returns {Promise}
 */
export const createAddress = (data) => {
  return post('/addresses', data)
}

/**
 * 更新地址
 * @param {number} addressId - 地址ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateAddress = (addressId, data) => {
  return patch(`/addresses/${addressId}`, data)
}

/**
 * 删除地址
 * @param {number} addressId - 地址ID
 * @returns {Promise}
 */
export const deleteAddress = (addressId) => {
  return del(`/addresses/${addressId}`)
}

/**
 * 设置默认地址
 * @param {number} addressId - 地址ID
 * @returns {Promise}
 */
export const setDefaultAddress = (addressId) => {
  return post(`/addresses/${addressId}/default`)
}

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
}
