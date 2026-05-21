<template>
  <view class="product-detail-page">
    <scroll-view class="scroll-container" scroll-y :scroll-top="scrollTop" @scroll="onScroll">
      <view class="product-cover">
        <image class="cover-image" :src="product.cover_image" mode="aspectFill" />
        <view class="cover-overlay"></view>
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>

        <view class="image-indicator" v-if="product.images && product.images.length > 1">
          <text class="indicator-text">1 / {{ product.images.length }}</text>
        </view>
      </view>

      <view class="product-content">
        <view class="product-header">
          <text class="product-title">{{ product.title }}</text>
          <text class="product-artist" @click="openArtist">{{ artistName }}</text>
          <view class="product-price-row">
            <text class="product-price">￥{{ formatPrice(product.price) }}</text>
            <text class="original-price" v-if="product.original_price">￥{{ formatPrice(product.original_price) }}</text>
            <view class="product-tag" v-if="product.is_featured">
              <text class="tag-text">精选</text>
            </view>
          </view>

          <view class="stats-row">
            <view class="stat-item">
              <text class="stat-icon">浏览</text>
              <text class="stat-num">{{ product.view_count || 0 }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">点赞</text>
              <text class="stat-num">{{ product.like_count || 0 }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">收藏</text>
              <text class="stat-num">{{ product.collection_count || 0 }}</text>
            </view>
          </view>
        </view>

        <view class="tab-nav" :class="{ 'is-fixed': tabFixed }" :style="{ top: tabFixed ? '0' : 'auto' }">
          <view class="tab-item" :class="{ active: activeTab === 'product' }" @click="switchTab('product')">
            <text>作品</text>
          </view>
          <view class="tab-item" :class="{ active: activeTab === 'detail' }" @click="switchTab('detail')">
            <text>详情</text>
          </view>
          <view class="tab-item" :class="{ active: activeTab === 'artist' }" @click="switchTab('artist')">
            <text>艺术家</text>
          </view>
          <view class="tab-indicator" :style="{ left: tabIndicatorLeft }"></view>
        </view>

        <view class="tab-content" v-if="activeTab === 'product'">
          <text class="desc-text">{{ product.description || '一件独具气质的当代艺术作品。' }}</text>

          <view class="tags-row" v-if="product.tags && product.tags.length > 0">
            <view class="tag-item" v-for="tag in product.tags" :key="tag.id" :style="{ background: tag.color || '#f5f5f5' }">
              <text class="tag-name">{{ tag.name }}</text>
            </view>
          </view>
        </view>

        <view class="tab-content" v-else-if="activeTab === 'detail'">
          <view class="detail-item">
            <text class="detail-label">材质</text>
            <text class="detail-value">{{ product.medium || '综合媒材' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">尺寸</text>
            <text class="detail-value">{{ product.dimensions || '120 × 90 cm' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">年份</text>
            <text class="detail-value">{{ product.year || '2024' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">分类</text>
            <text class="detail-value">{{ categoryName }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">认证</text>
            <text class="detail-value">{{ product.authenticity === 'verified' ? '已认证' : '未认证' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">库存</text>
            <text class="detail-value">{{ product.stock || 1 }} 件在售</text>
          </view>
        </view>

        <view class="tab-content" v-else-if="activeTab === 'artist'">
          <view class="artist-card" @click="openArtist">
            <AppAvatar class="artist-avatar" :src="artistAvatar" @click="openArtist" />
            <view class="artist-info">
              <view class="artist-name-row">
                <text class="artist-name">{{ artistName }}</text>
                <text class="verified-badge" v-if="artistVerified">认证</text>
              </view>
              <text class="artist-bio">{{ artistBio }}</text>
              <view class="artist-stats">
                <text class="artist-stat">{{ artistFollowers }} 人关注</text>
                <text class="artist-stat">{{ artistWorks }} 件作品</text>
              </view>
            </view>
          </view>

          <button
            v-if="!isOwnArtwork"
            class="follow-btn"
            :class="{ following: isFollowing }"
            @click="toggleFollow"
          >
            {{ isFollowing ? '已关注' : '关注' }}
          </button>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <button class="action-btn" @click="toggleCollect">
        <text class="action-icon">{{ isCollected ? '已藏' : '收藏' }}</text>
      </button>
      <button class="action-btn" @click="toggleLike">
        <text class="action-icon">{{ isLiked ? '已赞' : '点赞' }}</text>
      </button>
      <button class="action-btn" @click="openChat">
        <text class="action-icon">私信</text>
      </button>
      <button class="buy-btn" @click="handleBuy" :disabled="product.stock === 0">
        {{ product.stock === 0 ? '已售罄' : '立即购买' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../../store/index'
import { DEFAULT_USER_AVATAR, resolveUserAvatar } from '../../utils/assets'
import { getStoredMockArtwork } from '../../utils/mockArtwork'
import AppAvatar from '../../components/AppAvatar.vue'

const store = useAppStore()

const activeTab = ref('product')
const tabFixed = ref(false)
const scrollTop = ref(0)
const isLiked = ref(false)
const isCollected = ref(false)
const isFollowing = ref(false)
const isMockArtwork = ref(false)
const defaultAvatar = DEFAULT_USER_AVATAR

const product = computed(() => store.currentArtwork || {})
const resolvedArtist = computed(() => {
  const p = product.value || {}
  const nestedArtist = p.artist && typeof p.artist === 'object' ? p.artist : null
  const fallbackName = typeof p.artist === 'string' ? p.artist : ''

  return {
    id: nestedArtist?.id || p.artist_id || p.user_id || p.creator_id || p.author_id || null,
    name: nestedArtist?.username || nestedArtist?.name || fallbackName || '未知艺术家',
    avatar: nestedArtist?.avatar || '',
    bio: nestedArtist?.bio || '',
    isVerified: !!nestedArtist?.is_verified,
    followersCount: nestedArtist?.followers_count || 0,
    artworksCount: nestedArtist?.artworks_count || 0,
    isFollowing: !!nestedArtist?.is_following
  }
})
const artistName = computed(() => resolvedArtist.value.name)
const artistAvatar = computed(() => {
  return resolveUserAvatar(resolvedArtist.value.avatar || defaultAvatar)
})
const artistVerified = computed(() => resolvedArtist.value.isVerified)
const artistBio = computed(() => resolvedArtist.value.bio || '当代艺术创作者')
const artistFollowers = computed(() => resolvedArtist.value.followersCount)
const artistWorks = computed(() => resolvedArtist.value.artworksCount)
const artistId = computed(() => {
  const candidate = resolvedArtist.value.id
  return candidate ? Number(candidate) : null
})
const isOwnArtwork = computed(() => {
  return !!(store.user?.id && artistId.value && Number(store.user.id) === artistId.value)
})
const categoryName = computed(() => {
  const p = product.value
  if (p.category && p.category.name) {
    return p.category.name
  }
  return '绘画'
})

const tabIndicatorLeft = computed(() => {
  const tabs = ['product', 'detail', 'artist']
  const index = tabs.indexOf(activeTab.value)
  return (index / 3 * 100) + '%'
})

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const routeOptions = currentPage.options || {}
  const productId = routeOptions.id
  const mockMode = routeOptions.mock === '1'

  if (store.token && !store.user?.id) {
    try {
      await store.getCurrentUser()
    } catch (error) {
      console.warn('Failed to preload current user:', error)
    }
  }

  if (productId) {
    if (mockMode) {
      const mockArtwork = getStoredMockArtwork(productId)
      if (!mockArtwork) {
        store.showToast('测试作品详情不存在')
        return
      }

      store.currentArtwork = mockArtwork
      isMockArtwork.value = true
      isLiked.value = !!mockArtwork.is_liked
      isCollected.value = !!mockArtwork.is_collected
      isFollowing.value = !!mockArtwork.artist?.is_following
      return
    }

    try {
      const result = await store.fetchArtworkById(parseInt(productId))
      isMockArtwork.value = false
      isLiked.value = result.is_liked || false
      isCollected.value = result.is_collected || false
      const artist = result.artist
      if (artist) {
        isFollowing.value = artist.is_following || false
      }
    } catch (error) {
      store.showToast('载入作品失败')
    }
  }
})

const guardMockAction = () => {
  if (!isMockArtwork.value) {
    return false
  }

  store.showToast('当前为测试作品详情')
  return true
}

const onScroll = (e) => {
  tabFixed.value = e.detail.scrollTop > 300
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const goBack = () => uni.navigateBack()

const openArtist = () => {
  if (guardMockAction()) return
  if (artistId.value) {
    uni.navigateTo({ url: '/pages/artist/index?id=' + artistId.value })
    return
  }

  if (artistName.value && artistName.value !== '未知艺术家') {
    uni.navigateTo({ url: '/pages/artist/index?name=' + encodeURIComponent(artistName.value) })
  }
}

const toggleLike = async () => {
  if (guardMockAction()) return
  if (!store.token) {
    store.showToast('请先登录')
    return
  }

  try {
    if (isLiked.value) {
      await store.unlikeArtwork(product.value.id)
    } else {
      await store.likeArtwork(product.value.id)
    }
    isLiked.value = !isLiked.value
  } catch (error) {
    store.showToast(error.message || '点赞失败')
  }
}

const toggleCollect = async () => {
  if (guardMockAction()) return
  if (!store.token) {
    store.showToast('请先登录')
    return
  }

  try {
    if (isCollected.value) {
      await store.uncollectArtwork(product.value.id)
    } else {
      await store.collectArtwork(product.value.id)
    }
    isCollected.value = !isCollected.value
    store.showToast(isCollected.value ? '已加入收藏' : '已取消收藏')
  } catch (error) {
    store.showToast(error.message || '收藏操作失败')
  }
}

const toggleFollow = async () => {
  if (guardMockAction()) return
  if (!store.token) {
    store.showToast('请先登录')
    return
  }

  const artist = product.value.artist
  if (!artist || !artist.id) return
  if (isOwnArtwork.value) {
    store.showToast('这是你的作品')
    return
  }

  try {
    if (isFollowing.value) {
      await store.unfollowUser(artist.id)
    } else {
      const result = await store.followUser(artist.id)
      if (result && result.is_mutual) {
        store.showMatchModal({ userName: artistName.value })
      }
    }
    isFollowing.value = !isFollowing.value
  } catch (error) {
    store.showToast(error.message || '关注失败')
  }
}

const openChat = async () => {
  if (guardMockAction()) return
  if (!store.token) {
    store.showToast('请先登录')
    return
  }

  if (isOwnArtwork.value) {
    store.showToast('这是你的作品')
    return
  }

  if (!isFollowing.value) {
    store.showToast('关注艺术家后即可发起聊天')
    return
  }

  const artist = product.value.artist
  if (!artist || !artist.id) return

  try {
    const conversation = await store.getOrCreatePrivateConversation(artist.id)
    uni.navigateTo({ url: '/pages/chat/index?id=' + conversation.id })
  } catch (error) {
    store.showToast('打开会话失败')
  }
}

const handleBuy = () => {
  if (guardMockAction()) return
  if (product.value.stock === 0) {
    store.showToast('该作品已售罄')
    return
  }

  uni.navigateTo({
    url: '/pages/order/create?artwork_id=' + product.value.id
  })
}

const formatPrice = (price) => {
  if (!price) return '0'
  return typeof price === 'number' ? price.toLocaleString() : price
}
</script>

<style lang="scss" scoped>
.product-detail-page { display: flex; flex-direction: column; height: 100vh; background-color: #f9f9f7; }
.scroll-container { flex: 1; height: 0; }
.product-cover { position: relative; height: 600rpx; }
.cover-image { width: 100%; height: 100%; }
.cover-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2), transparent 30%, rgba(0,0,0,0.3)); }
.back-btn { position: absolute; top: 64rpx; left: 32rpx; width: 64rpx; height: 64rpx; background: rgba(255,255,255,0.2); backdrop-filter: blur(20rpx); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 32rpx; color: #fff; }
.image-indicator { position: absolute; bottom: 24rpx; right: 24rpx; background: rgba(0,0,0,0.5); padding: 8rpx 16rpx; border-radius: 16rpx; }
.indicator-text { font-size: 22rpx; color: #fff; }
.product-content { padding: 32rpx; }
.product-header { margin-bottom: 32rpx; }
.product-title { display: block; font-family: 'Playfair Display', serif; font-size: 44rpx; font-weight: bold; color: #1a1a1a; }
.product-artist { display: block; font-size: 24rpx; color: #8c8c8c; margin-top: 8rpx; margin-bottom: 16rpx; }
.product-price-row { display: flex; align-items: center; gap: 16rpx; }
.product-price { font-family: 'Playfair Display', serif; font-size: 36rpx; font-weight: bold; color: #c5a47e; }
.original-price { font-size: 26rpx; color: #999; text-decoration: line-through; }
.product-tag { background: #f0f0f0; padding: 8rpx 16rpx; border-radius: 16rpx; }
.tag-text { font-size: 20rpx; color: #8c8c8c; font-weight: bold; }
.stats-row { display: flex; gap: 32rpx; margin-top: 20rpx; }
.stat-item { display: flex; align-items: center; gap: 8rpx; }
.stat-icon { font-size: 22rpx; color: #8c8c8c; }
.stat-num { font-size: 24rpx; color: #666; }
.tab-nav { display: flex; position: relative; background: #fff; border-radius: 24rpx; padding: 8rpx; margin-bottom: 24rpx; transition: all 0.3s; }
.tab-nav.is-fixed { position: fixed; top: 0; left: 32rpx; right: 32rpx; z-index: 10; box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08); }
.tab-item { flex: 1; text-align: center; padding: 20rpx 0; font-size: 26rpx; font-weight: bold; color: #8c8c8c; position: relative; z-index: 2; transition: color 0.3s; }
.tab-item.active { color: #1a1a1a; }
.tab-indicator { position: absolute; bottom: 8rpx; top: 8rpx; width: 33.33%; background: #f5f5f5; border-radius: 20rpx; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.tab-content { background: #fff; border-radius: 24rpx; padding: 32rpx; min-height: 200rpx; }
.desc-text { font-size: 28rpx; color: #333; line-height: 1.8; }
.tags-row { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 24rpx; }
.tag-item { padding: 8rpx 20rpx; border-radius: 16rpx; }
.tag-name { font-size: 22rpx; color: #fff; }
.detail-item { display: flex; justify-content: space-between; padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.detail-item:last-child { border-bottom: none; }
.detail-label { font-size: 26rpx; color: #8c8c8c; }
.detail-value { font-size: 26rpx; color: #1a1a1a; font-weight: bold; }
.artist-card { display: flex; align-items: center; }
.artist-avatar { width: 100rpx; height: 100rpx; border-radius: 50%; margin-right: 24rpx; }
.artist-info { flex: 1; }
.artist-name-row { display: flex; align-items: center; gap: 8rpx; }
.artist-name { font-size: 30rpx; font-weight: bold; color: #1a1a1a; }
.verified-badge { font-size: 20rpx; color: #c5a47e; }
.artist-bio { display: block; font-size: 24rpx; color: #666; margin-top: 8rpx; }
.artist-stats { display: flex; gap: 24rpx; margin-top: 8rpx; }
.artist-stat { font-size: 22rpx; color: #999; }
.follow-btn { margin-top: 24rpx; background: #1a1a1a; color: #fff; border-radius: 32rpx; padding: 24rpx; font-size: 28rpx; font-weight: bold; }
.follow-btn.following { background: #f5f5f5; color: #666; }
.bottom-bar { display: flex; align-items: center; padding: 24rpx 32rpx; padding-bottom: calc(24rpx + env(safe-area-inset-bottom)); background: #fff; border-top: 1rpx solid #f0f0f0; }
.action-btn { min-width: 94rpx; height: 80rpx; background: #f5f5f5; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; margin-right: 16rpx; padding: 0 16rpx; }
.action-icon { font-size: 24rpx; }
.buy-btn { flex: 1; background: #c5a47e; color: #fff; border-radius: 32rpx; padding: 28rpx; font-size: 28rpx; font-weight: bold; }
.buy-btn[disabled] { background: #ccc; }
</style>
