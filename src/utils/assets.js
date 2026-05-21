import { API_BASE_URL } from './request'

const ABSOLUTE_URL_RE = /^(https?:)?\/\//i
const CUSTOM_SCHEME_RE = /^[a-z][a-z\d+\-.]*:/i
const LOCAL_ASSET_RE = /^\/?static\//i
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/i, '')
const DEFAULT_PROTOCOL = API_BASE_URL.startsWith('https://') ? 'https:' : 'http:'
export const DEFAULT_USER_AVATAR = '/static/images/tabbar/profile-active.png'

export const resolveAssetUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return ''
  }

  if (LOCAL_ASSET_RE.test(trimmedValue)) {
    return trimmedValue.startsWith('/') ? trimmedValue : '/' + trimmedValue
  }

  if (ABSOLUTE_URL_RE.test(trimmedValue)) {
    return trimmedValue.startsWith('//') ? DEFAULT_PROTOCOL + trimmedValue : trimmedValue
  }

  if (CUSTOM_SCHEME_RE.test(trimmedValue)) {
    return trimmedValue
  }

  if (trimmedValue.startsWith('/')) {
    return API_ORIGIN + trimmedValue
  }

  return API_ORIGIN + '/' + trimmedValue.replace(/^\.?\//, '')
}

export const resolveAssetList = (list = []) => {
  if (!Array.isArray(list)) {
    return []
  }

  return list.map(resolveAssetUrl).filter(Boolean)
}

export const resolveUserAvatar = (value) => {
  return resolveAssetUrl(value) || DEFAULT_USER_AVATAR
}

export const withAvatarVersion = (url, version) => {
  if (!url || !version) {
    return url
  }

  if (LOCAL_ASSET_RE.test(url) || CUSTOM_SCHEME_RE.test(url) && !ABSOLUTE_URL_RE.test(url)) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return url + separator + '_v=' + encodeURIComponent(version)
}

export const normalizeUserAssets = (user) => {
  if (!user || typeof user !== 'object') {
    return user
  }

  return {
    ...user,
    avatar: resolveUserAvatar(user.avatar)
  }
}

export const normalizeArtworkAssets = (artwork) => {
  if (!artwork || typeof artwork !== 'object') {
    return artwork
  }

  return {
    ...artwork,
    cover_image: resolveAssetUrl(artwork.cover_image) || artwork.cover_image || '',
    images: resolveAssetList(artwork.images),
    artist: normalizeUserAssets(artwork.artist)
  }
}

export const normalizeArtworkCollection = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalizeArtworkAssets)
  }

  if (data && Array.isArray(data.items)) {
    return {
      ...data,
      items: data.items.map(normalizeArtworkAssets)
    }
  }

  return normalizeArtworkAssets(data)
}

export default {
  resolveAssetUrl,
  resolveAssetList,
  resolveUserAvatar,
  withAvatarVersion,
  DEFAULT_USER_AVATAR,
  normalizeUserAssets,
  normalizeArtworkAssets,
  normalizeArtworkCollection
}
