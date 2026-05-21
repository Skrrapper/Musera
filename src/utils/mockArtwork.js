const STORAGE_PREFIX = 'mockArtworkDetail:'

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

const normalizeTags = (tags = [], options = {}) => {
  const normalizedTags = Array.isArray(tags) ? tags : []
  const mappedTags = normalizedTags.map((tag, index) => {
    if (typeof tag === 'string') {
      return {
        id: `mock-tag-${index}-${tag}`,
        name: tag,
        color: tag === '常驻' ? '#efe8dc' : '#f4efe7'
      }
    }

    return {
      id: tag.id || `mock-tag-${index}`,
      name: tag.name || `标签 ${index + 1}`,
      color: tag.color || '#f4efe7'
    }
  })

  if (options.resident && !mappedTags.some(tag => tag.name === '常驻')) {
    mappedTags.unshift({
      id: 'mock-tag-resident',
      name: '常驻',
      color: '#efe8dc'
    })
  }

  return mappedTags
}

export const normalizeMockArtwork = (item = {}, options = {}) => {
  const normalizedArtist = item.artist && typeof item.artist === 'object'
    ? item.artist
    : { username: item.artist || '测试艺术家' }

  const coverImage = item.cover_image || ''
  const category = item.category && typeof item.category === 'object'
    ? item.category
    : null

  return {
    id: item.id,
    title: item.title || '测试作品',
    description: item.description || item.medium || '当前为测试作品详情展示。',
    cover_image: coverImage,
    images: Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (coverImage ? [coverImage] : []),
    price: toNumber(item.price, 0),
    original_price: toNumber(item.original_price, 0) || null,
    medium: item.medium || '综合媒材',
    dimensions: item.dimensions || '待补充',
    year: item.year || '2026',
    stock: Math.max(1, toNumber(item.stock, 1)),
    view_count: toNumber(item.view_count, 0),
    like_count: toNumber(item.like_count, 0),
    collection_count: toNumber(item.collection_count, 0),
    is_featured: !!item.is_featured,
    is_liked: !!item.is_liked,
    is_collected: !!item.is_collected,
    authenticity: item.authenticity || 'verified',
    category,
    tags: normalizeTags(item.tags, options),
    artist: {
      id: normalizedArtist.id || 0,
      username: normalizedArtist.username || '测试艺术家',
      avatar: normalizedArtist.avatar || '',
      bio: normalizedArtist.bio || '当前为测试作品详情展示。',
      is_verified: !!normalizedArtist.is_verified,
      followers_count: toNumber(normalizedArtist.followers_count, 0),
      artworks_count: toNumber(normalizedArtist.artworks_count, 0),
      is_following: !!normalizedArtist.is_following
    },
    _isMock: true
  }
}

export const persistMockArtwork = (item = {}, options = {}) => {
  const normalizedArtwork = normalizeMockArtwork(item, options)
  uni.setStorageSync(`${STORAGE_PREFIX}${normalizedArtwork.id}`, normalizedArtwork)
  return normalizedArtwork
}

export const getStoredMockArtwork = (id) => {
  if (!id) return null
  return uni.getStorageSync(`${STORAGE_PREFIX}${id}`) || null
}

export const clearStoredMockArtwork = (id) => {
  if (!id) return
  uni.removeStorageSync(`${STORAGE_PREFIX}${id}`)
}
