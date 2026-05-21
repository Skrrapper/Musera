<template>
  <view class="artist-page">
    <view class="artist-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-bg-wrapper">
        <image class="header-bg" :src="artistCover" mode="aspectFill" />
        <view class="header-overlay"></view>
      </view>
      <view class="artist-avatar-wrapper">
        <AppAvatar class="artist-avatar" :src="artistAvatar" />
      </view>
    </view>

    <view class="artist-info">
      <text class="artist-name">{{ artistName }}</text>
      <text class="artist-tag">视觉艺术家</text>

      <view class="artist-stats">
        <view class="stat-item">
          <text class="stat-num">{{ worksCount }}</text>
          <text class="stat-label">作品</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ followers }}</text>
          <text class="stat-label">关注者</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ likes }}</text>
          <text class="stat-label">获赞</text>
        </view>
      </view>

      <view class="action-btns">
        <view class="follow-btn" :class="{ following: isFollowing }" @click="handleFollow">
          <text>{{ isFollowing ? '已关注' : '关注' }}</text>
        </view>
        <view class="message-btn" @click="handleMessage">
          <text>私信</text>
        </view>
      </view>
    </view>

    <view class="works-section">
      <text class="section-title">作品</text>

      <view class="works-grid">
        <view
          class="work-item"
          v-for="(item, index) in works"
          :key="item.id"
          :style="{ animationDelay: (index * 0.05) + 's' }"
          @click="openProduct(item)"
        >
          <view class="work-image-wrapper" :style="getWorkMediaStyle(index)">
            <image class="work-image" :src="item.image" mode="aspectFill" />
          </view>
          <view class="work-info">
            <text class="work-title">{{ item.title }}</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="works.length === 0">
        <text class="empty-icon">◇</text>
        <text class="empty-text">暂无作品</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../../store/index'
import { DEFAULT_USER_AVATAR, resolveUserAvatar } from '../../utils/assets'
import AppAvatar from '../../components/AppAvatar.vue'

const store = useAppStore()

const artistName = ref('艺术家')
const artistAvatar = ref(DEFAULT_USER_AVATAR)
const artistCover = ref('https://picsum.photos/800/400?random=cover')
const worksCount = ref(0)
const followers = ref('0')
const likes = ref('0')
const isFollowing = ref(false)
const works = ref([])

const artistData = {
  DESIGNPRO: { followers: '5.2k', likes: '342' },
  YORUSHIKA: { followers: '8.1k', likes: '1.2k' },
  'SARAH ART': { followers: '3.4k', likes: '256' },
  'Emily Brown': { followers: '2.1k', likes: '189' },
  'Michael Chan': { followers: '4.5k', likes: '412' },
  'Sarah Kendall': { followers: '6.7k', likes: '534' },
  'Daved Stark': { followers: '9.2k', likes: '876' }
}

const allWorks = [
  { id: 1, title: '抽象意识', artist: 'DESIGNPRO', image: 'https://picsum.photos/400/500?random=w1', price: '2,500' },
  { id: 2, title: '虚空', artist: 'YORUSHIKA', image: 'https://picsum.photos/400/500?random=w2', price: '1,800' },
  { id: 3, title: '金色时刻', artist: 'SARAH ART', image: 'https://picsum.photos/400/500?random=w3', price: '3,200' },
  { id: 4, title: '蓝色之中', artist: 'YORUSHIKA', image: 'https://picsum.photos/400/500?random=w4', price: '4,500' },
  { id: 5, title: '自然低语', artist: 'Emily Brown', image: 'https://picsum.photos/400/500?random=w5', price: '2,100' },
  { id: 6, title: '晨光', artist: 'Michael Chan', image: 'https://picsum.photos/400/500?random=w6', price: '1,500' },
  { id: 7, title: '城市形态', artist: 'Sarah Kendall', image: 'https://picsum.photos/400/500?random=w7', price: '3,800' },
  { id: 8, title: '宇宙之舞', artist: 'Daved Stark', image: 'https://picsum.photos/400/500?random=w8', price: '5,000' }
]

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id
  const name = currentPage.options?.name

  if (id) {
    try {
      const artistId = parseInt(id)
      const profile = await store.fetchUserProfile(artistId)
      const artworksResult = await store.fetchUserArtworks(artistId, { page: 1, page_size: 20 })
      const items = artworksResult?.data?.items || artworksResult?.data || []

      if (profile) {
        artistName.value = profile.username || artistName.value
        artistAvatar.value = resolveUserAvatar(profile.avatar)
        followers.value = String(profile.followers_count || 0)
        likes.value = String(profile.likes_count || 0)
        isFollowing.value = !!profile.is_following
      }

      works.value = items.map(item => ({
        ...item,
        image: item.cover_image || item.image
      }))
      worksCount.value = works.value.length

      if (works.value.length > 0 && works.value[0].image) {
        artistCover.value = works.value[0].image
      }
      return
    } catch (error) {
      console.warn('Failed to load artist profile:', error)
    }
  }

  if (name) {
    artistName.value = decodeURIComponent(name)
    works.value = allWorks.filter(w => w.artist === artistName.value)
    worksCount.value = works.value.length

    const data = artistData[artistName.value] || { followers: '1.2k', likes: '100' }
    followers.value = data.followers
    likes.value = data.likes

    if (works.value.length > 0) {
      artistCover.value = works.value[0].image
    }
  }
})

const handleFollow = () => {
  isFollowing.value = !isFollowing.value
  store.showToast(isFollowing.value ? '已关注' : '已取消关注')
}

const handleMessage = () => {
  uni.navigateTo({ url: '/pages/chat/index?name=' + encodeURIComponent(artistName.value) })
}

const openProduct = (item) => {
  uni.navigateTo({ url: '/pages/product-detail/index?id=' + item.id })
}

const goBack = () => {
  uni.navigateBack()
}

const getWorkMediaStyle = (index) => {
  const heights = [424, 340, 472, 386, 446, 358]
  return {
    height: `${heights[index % heights.length]}rpx`
  }
}
</script>

<style lang="scss" scoped>
$color-primary: #000000;
$color-surface: #FFFFFF;
$color-text-primary: #000000;
$color-text-secondary: #666666;
$color-text-tertiary: #999999;
$color-border: #F5F5F5;
$font-display: 'Playfair Display', 'Times New Roman', serif;
$font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

.artist-page {
  min-height: 100vh;
  background-color: $color-surface;
  padding-bottom: 100rpx;
}

.artist-header {
  position: relative;
  height: 280rpx;
}

.header-bg-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.header-bg {
  width: 100%;
  height: 100%;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.1) 0%,
    rgba(0,0,0,0.3) 100%
  );
}

.back-btn {
  position: absolute;
  top: 32rpx;
  left: 32rpx;
  width: 64rpx;
  height: 64rpx;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(12rpx);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.back-btn:active {
  transform: scale(0.92);
}

.back-icon {
  color: #FFFFFF;
  font-size: 28rpx;
}

.artist-avatar-wrapper {
  position: absolute;
  bottom: -60rpx;
  left: 40rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid $color-surface;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
  z-index: 5;
}

.artist-avatar {
  width: 100%;
  height: 100%;
}

.artist-info {
  padding: 80rpx 40rpx 32rpx;
}

.artist-name {
  display: block;
  font-family: $font-display;
  font-size: 44rpx;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: 8rpx;
}

.artist-tag {
  display: block;
  font-family: $font-body;
  font-size: 24rpx;
  color: $color-text-tertiary;
  margin-bottom: 28rpx;
}

.artist-stats {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 28rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-family: $font-body;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.stat-label {
  font-family: $font-body;
  font-size: 22rpx;
  color: $color-text-tertiary;
  margin-top: 4rpx;
}

.stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: $color-border;
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.follow-btn {
  flex: 1;
  height: 80rpx;
  background: $color-primary;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.follow-btn text {
  font-family: $font-body;
  font-size: 26rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.follow-btn.following {
  background: $color-border;
}

.follow-btn.following text {
  color: $color-text-primary;
}

.follow-btn:active {
  transform: scale(0.98);
}

.message-btn {
  flex: 1;
  height: 80rpx;
  background: $color-border;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-btn text {
  font-family: $font-body;
  font-size: 26rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.message-btn:active {
  transform: scale(0.98);
}

.works-section {
  padding: 32rpx 40rpx;
}

.section-title {
  display: block;
  font-family: $font-body;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: 24rpx;
}

.works-grid {
  column-count: 2;
  column-gap: 20rpx;
}

.work-item {
  display: inline-block;
  width: 100%;
  margin-bottom: 20rpx;
  background: $color-surface;
  border-radius: 16rpx;
  overflow: hidden;
  animation: cardFadeIn 0.5s ease-out forwards;
  opacity: 0;
  break-inside: avoid;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.work-image-wrapper {
  position: relative;
  width: 100%;
  background: $color-border;
}

.work-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.work-info {
  padding: 16rpx 12rpx 20rpx;
  background: $color-surface;
}

.work-title {
  display: block;
  font-family: $font-display;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text-primary;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 64rpx;
  color: $color-border;
  margin-bottom: 24rpx;
}

.empty-text {
  font-family: $font-body;
  font-size: 28rpx;
  color: $color-text-tertiary;
}
</style>
