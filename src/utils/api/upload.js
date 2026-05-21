/**
 * 鏂囦欢涓婁紶妯″潡 API
 */

import { API_BASE_URL, getToken } from '../request'
import { resolveAssetUrl } from '../assets'

const parseUploadPayload = (rawData) => {
  if (typeof rawData !== 'string') {
    return rawData
  }

  const text = rawData.trim()
  if (!text) {
    throw new Error('上传接口未返回数据')
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    const preview = text.replace(/\s+/g, ' ').slice(0, 120)
    console.error('Upload API returned non-JSON payload:', preview)

    if (text.startsWith('<')) {
      throw new Error('上传接口返回了页面内容，请检查上传地址或网关配置')
    }

    throw new Error('上传接口返回格式不正确')
  }
}

const parseUploadResponse = (uploadResult) => {
  const data = parseUploadPayload(uploadResult.data)

  if (uploadResult.statusCode >= 200 && uploadResult.statusCode < 300 && (data.code === 200 || data.code === 201)) {
    const normalized = {
      ...(data.data || {})
    }

    if (normalized.url) {
      normalized.raw_url = normalized.url
      normalized.url = resolveAssetUrl(normalized.url)

      if (normalized.raw_url !== normalized.url) {
        console.warn('Upload API returned relative asset URL:', normalized.raw_url, 'normalized to:', normalized.url)
      }
    }

    return normalized
  }

  console.error('Upload API request failed:', {
    statusCode: uploadResult.statusCode,
    data
  })
  throw new Error(data?.message || '图片上传失败')
}

export const uploadImage = async (filePath, type = 'post') => {
  const token = getToken()

  const uploadResult = await uni.uploadFile({
    url: API_BASE_URL + '/upload/images',
    filePath,
    name: 'file',
    header: token ? {
      Authorization: 'Bearer ' + token
    } : {},
    formData: {
      type
    }
  })

  return parseUploadResponse(uploadResult)
}

export default {
  uploadImage
}

