<template>
  <view class="artworks-page">
    <view class="topbar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="topbar-title">我的作品</text>
      <view class="topbar-action" @click="goToCreate">
        <text class="topbar-action-text">新建</text>
      </view>
    </view>

    <view class="hero">
      <text class="hero-kicker">艺术家工作台</text>
      <text class="hero-title">已发布的作品</text>
      <text class="hero-subtitle">在这里发布、编辑和下架作品。</text>
    </view>

    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-value">{{ artworks.length }}</text>
        <text class="summary-label">作品</text>
      </view>
      <view class="summary-divider" />
      <view class="summary-item">
        <text class="summary-value">{{ activeCount }}</text>
        <text class="summary-label">上架中</text>
      </view>
      <view class="summary-divider" />
      <view class="summary-item">
        <text class="summary-value">{{ soldCount }}</text>
        <text class="summary-label">已售出</text>
      </view>
    </view>

    <view class="status-card" v-if="loadError">
      <text class="status-title">无法载入作品</text>
      <text class="status-desc">{{ loadError }}</text>
      <button class="status-btn" @click="loadArtworks">重试</button>
    </view>

    <view class="status-card muted" v-else-if="loading && artworks.length === 0">
      <text class="status-title">正在载入工作台</text>
      <text class="status-desc">正在获取你已发布的作品。</text>
    </view>

    <view class="artwork-list" v-if="artworks.length > 0">
      <view class="artwork-card" v-for="artwork in artworks" :key="artwork.id">
        <view class="card-main" @click="openArtwork(artwork)">
          <image class="artwork-cover" :src="artwork.cover_image" mode="aspectFill" />
          <view class="artwork-copy">
            <view class="copy-top">
              <text class="artwork-title">{{ artwork.title }}</text>
              <text class="status-chip" :class="artwork.status">{{ formatStatus(artwork.status) }}</text>
            </view>
            <text class="artwork-meta">{{ artwork.category_name || '未分类' }} · {{ artwork.medium || '综合媒材' }}</text>
            <text class="artwork-price">￥{{ formatPrice(artwork.price) }}</text>
            <view class="artwork-stats">
              <text class="artwork-stat">库存 {{ artwork.stock }}</text>
              <text class="artwork-stat">点赞 {{ artwork.like_count }}</text>
              <text class="artwork-stat">浏览 {{ artwork.view_count }}</text>
            </view>
          </view>
        </view>

        <view class="card-actions">
          <button class="ghost-btn" @click="editArtwork(artwork)">编辑</button>
          <button class="danger-btn" @click="confirmDelete(artwork)">删除</button>
        </view>
      </view>
    </view>

    <view class="status-card muted" v-else-if="!loading">
      <text class="status-title">还没有作品</text>
      <text class="status-desc">点击“新建”或个人页右下角“+”发布第一件作品。</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAppStore } from '../../store/index'

const store = useAppStore()

const artworks = ref([])
const loading = ref(false)
const loadError = ref('')

const activeCount = computed(() => artworks.value.filter(item => item.status === 'active').length)
const soldCount = computed(() => artworks.value.filter(item => item.status === 'sold').length)

const normalizeArtwork = (item = {}) => ({
  id: item.id,
  title: item.title || '未命名作品',
  cover_image: item.cover_image || item.images?.[0] || 'https://picsum.photos/300/360?random=artwork',
  price: Number(item.price || 0),
  category_name: item.category?.name || item.category_name || '',
  medium: item.medium || '',
  stock: Number(item.stock || 0),
  like_count: Number(item.like_count || 0),
  view_count: Number(item.view_count || 0),
  status: item.status || 'active'
})

const ensureArtistAccess = async () => {
  if (!store.token) {
    throw new Error('请先登录')
  }

  if (!store.user?.id) {
    await store.getCurrentUser()
  }

  if (!store.user?.is_verified) {
    throw new Error('需要认证艺术家身份')
  }
}

const loadArtworks = async () => {
  loading.value = true
  loadError.value = ''

  try {
    await ensureArtistAccess()
    const result = await store.fetchUserArtworks(store.user.id, {
      page: 1,
      page_size: 50
    })

    const items = result?.data?.items || result?.data || []
    artworks.value = Array.isArray(items) ? items.map(normalizeArtwork) : []
  } catch (error) {
    console.error('Failed to load my artworks:', error)
    loadError.value = error.message || '请稍后再试'
  } finally {
    loading.value = false
  }
}

onShow(loadArtworks)

const goBack = () => {
  uni.navigateBack()
}

const goToCreate = () => {
  uni.navigateTo({ url: '/pages/profile/artwork-editor' })
}

const editArtwork = (artwork) => {
  uni.navigateTo({ url: '/pages/profile/artwork-editor?id=' + artwork.id })
}

const openArtwork = (artwork) => {
  uni.navigateTo({ url: '/pages/product-detail/index?id=' + artwork.id })
}

const confirmDelete = async (artwork) => {
  try {
    const modal = await uni.showModal({
      title: '删除作品',
      content: '删除后无法恢复，确认删除这件作品？',
      confirmColor: '#8f5a4a'
    })

    if (!modal.confirm) {
      return
    }

    await store.deleteArtwork(artwork.id)
    artworks.value = artworks.value.filter(item => item.id !== artwork.id)
    store.showToast({ title: '已删除', icon: 'success' })
  } catch (error) {
    store.showToast(error.message || '删除失败')
  }
}

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString()
}

const formatStatus = (status) => {
  const map = {
    active: '上架中',
    sold: '已售出',
    draft: '草稿',
    offline: '已下架'
  }
  return map[status] || '上架中'
}
</script>

<style lang="scss" scoped>
.artworks-page {
  min-height: 100vh;
  padding: calc(84rpx + env(safe-area-inset-top)) 24rpx 48rpx;
  background:
    radial-gradient(circle at top left, rgba(197, 164, 126, 0.16), transparent 28%),
    linear-gradient(180deg, #f7f4ee 0%, #f8f7f3 35%, #f2efe8 100%);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn,
.topbar-action {
  min-width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 28rpx rgba(28, 24, 18, 0.05);
}

.back-icon {
  font-size: 42rpx;
  color: #191713;
  line-height: 1;
}

.topbar-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #191713;
}

.topbar-action-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #191713;
}

.hero {
  margin-top: 40rpx;
}

.hero-kicker {
  display: block;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  color: #8f826d;
}

.hero-title {
  display: block;
  margin-top: 18rpx;
  font-family: 'Playfair Display', serif;
  font-size: 60rpx;
  line-height: 1.08;
  color: #171612;
}

.hero-subtitle {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #726c61;
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
  padding: 28rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18rpx 44rpx rgba(28, 24, 18, 0.05);
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-divider {
  width: 1rpx;
  height: 56rpx;
  background: rgba(23, 22, 18, 0.08);
}

.summary-value {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: 42rpx;
  color: #171612;
}

.summary-label {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #7d7568;
}

.status-card {
  margin-top: 26rpx;
  padding: 30rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 16rpx 40rpx rgba(28, 24, 18, 0.04);
}

.status-card.muted {
  background: rgba(255, 255, 255, 0.72);
}

.status-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #171612;
}

.status-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #7d7568;
}

.status-btn {
  margin-top: 22rpx;
  height: 78rpx;
  line-height: 78rpx;
  border-radius: 999rpx;
  background: #1a1a1a;
  color: #fff;
  font-size: 24rpx;
}

.artwork-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 26rpx;
}

.artwork-card {
  padding: 24rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18rpx 42rpx rgba(28, 24, 18, 0.04);
}

.card-main {
  display: flex;
  gap: 20rpx;
}

.artwork-cover {
  width: 180rpx;
  height: 220rpx;
  border-radius: 24rpx;
  background: #efeae2;
  flex-shrink: 0;
}

.artwork-copy {
  flex: 1;
  min-width: 0;
}

.copy-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.artwork-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #171612;
}

.status-chip {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #6b624f;
  background: rgba(197, 164, 126, 0.18);
}

.status-chip.sold {
  color: #8f5a4a;
  background: rgba(143, 90, 74, 0.14);
}

.status-chip.offline,
.status-chip.draft {
  color: #6f6a61;
  background: rgba(111, 106, 97, 0.12);
}

.artwork-meta,
.artwork-stats {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #7d7568;
}

.artwork-price {
  display: block;
  margin-top: 18rpx;
  font-family: 'Playfair Display', serif;
  font-size: 36rpx;
  color: #171612;
}

.artwork-stats {
  line-height: 1.7;
}

.artwork-stat + .artwork-stat::before {
  content: ' · ';
}

.card-actions {
  display: flex;
  gap: 14rpx;
  margin-top: 22rpx;
}

.ghost-btn,
.danger-btn {
  flex: 1;
  height: 82rpx;
  line-height: 82rpx;
  border-radius: 22rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.ghost-btn {
  background: #f2eee6;
  color: #171612;
}

.danger-btn {
  background: rgba(143, 90, 74, 0.12);
  color: #8f5a4a;
}
</style>
