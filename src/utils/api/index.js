/**
 * API 统一导出模块
 * 所有 API 模块的统一入口
 */

// 请求工具
export * from '../request'

// 各模块 API
export * as authApi from './auth'
export * as usersApi from './users'
export * as artworksApi from './artworks'
export * as categoriesApi from './categories'
export * as ordersApi from './orders'
export * as addressesApi from './addresses'
export * as chatApi from './chat'
export * as forumApi from './forum'
export * as likesApi from './likes'
export * as uploadApi from './upload'

// 具名导出各模块方法
export * from './auth'
export * from './users'
export * from './artworks'
export * from './categories'
export * from './orders'
export * from './addresses'
export * from './chat'
export * from './forum'
export * from './likes'
export * from './upload'

