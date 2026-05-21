<template>
  <view class="concept-detail-page">
    <scroll-view class="scroll-container" scroll-y :scroll-top="scrollTop" @scroll="onScroll">
      <view class="concept-cover">
        <image class="cover-image" :src="coverImage" mode="aspectFill" />
        <view class="cover-overlay"></view>
        <view class="back-btn" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
      </view>

      <view class="concept-content">
        <view class="concept-header">
          <text class="concept-title">{{ concept.title }}</text>
          <text class="concept-artist" @click="openArtist">{{ concept.artist?.name }}</text>
          <view class="concept-theme-row">
            <text class="concept-theme-text">第 0{{ themeVol }} 期 · {{ themeTitle }}</text>
          </view>

          <view class="stats-row">
            <view class="stat-item">
              <text class="stat-icon">浏览</text>
              <text class="stat-num">{{ viewCount }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">点赞</text>
              <text class="stat-num">{{ likeCount }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">收藏</text>
              <text class="stat-num">{{ collectionCount }}</text>
            </view>
          </view>
        </view>

        <view class="tab-nav" :class="{ 'is-fixed': tabFixed }" :style="{ top: tabFixed ? '0' : 'auto' }">
          <view class="tab-item" :class="{ active: activeTab === 'artwork' }" @click="switchTab('artwork')">
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

        <view class="tab-content" v-if="activeTab === 'artwork'">
          <text class="desc-text">{{ concept.summary }}</text>

          <view class="artworks-grid">
            <view
              class="artwork-card"
              v-for="artwork in concept.artworks || []"
              :key="artwork.id"
              @click="previewArtwork(artwork)"
            >
              <image class="artwork-image" :src="artwork.image" mode="aspectFill" />
              <text class="artwork-title">{{ artwork.title }}</text>
            </view>
          </view>
        </view>

        <view class="tab-content" v-else-if="activeTab === 'detail'">
          <view class="detail-block">
            <text class="detail-label">概念理解</text>
            <text
              class="detail-value detail-value--paragraph"
              v-for="(paragraph, index) in concept.detail || []"
              :key="`${concept.id}-detail-${index}`"
            >
              {{ paragraph }}
            </text>
          </view>
        </view>

        <view class="tab-content" v-else-if="activeTab === 'artist'">
          <view class="artist-card">
            <AppAvatar class="artist-avatar" :src="concept.artist?.avatar" @click="openArtist" />
            <view class="artist-info">
              <view class="artist-name-row">
                <text class="artist-name" @click="openArtist">{{ concept.artist?.name }}</text>
                <text class="verified-badge" v-if="concept.artist?.verified">认证</text>
              </view>
              <text class="artist-bio">{{ concept.artist?.bio }}</text>
              <view class="artist-stats">
                <text class="artist-stat">{{ concept.artist?.followers || '0' }} 关注者</text>
                <text class="artist-stat">{{ concept.artist?.worksCount || 0 }} 件作品</text>
              </view>
            </view>
          </view>

          <view class="detail-block">
            <text class="detail-label">艺术家介绍</text>
            <text class="detail-value detail-value--paragraph">{{ concept.artist?.intro }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <button class="action-btn" @click="toggleCollect">
        <text class="action-icon">{{ isCollected ? '已收藏' : '收藏' }}</text>
      </button>
      <button class="action-btn" @click="toggleLike">
        <text class="action-icon">{{ isLiked ? '已赞' : '点赞' }}</text>
      </button>
      <button class="action-btn" @click="openChat">
        <text class="action-icon">私信</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppAvatar from '../../components/AppAvatar.vue'
import { getThemeConceptById, getThemePeriodByVol } from '../../utils/themeConcepts'

const STORAGE_KEY = 'muse_theme_concept_actions'

const activeTab = ref('artwork')
const tabFixed = ref(false)
const scrollTop = ref(0)
const themeVol = ref(1)
const themeTitle = ref('')
const concept = ref({
  id: '',
  title: '',
  summary: '',
  image: '',
  detail: [],
  artworks: [],
  artist: {}
})

const isLiked = ref(false)
const isCollected = ref(false)
const likeCount = ref(0)
const collectionCount = ref(0)
const viewCount = ref(0)

const coverImage = computed(() => {
  if (concept.value.image) {
    return concept.value.image
  }

  if (concept.value.artist?.cover) {
    return concept.value.artist.cover
  }

  return ''
})

const tabIndicatorLeft = computed(() => {
  const tabs = ['artwork', 'detail', 'artist']
  const index = tabs.indexOf(activeTab.value)
  return `${(index / 3) * 100}%`
})

const readActionStore = () => {
  try {
    return uni.getStorageSync(STORAGE_KEY) || {}
  } catch (error) {
    return {}
  }
}

const writeActionStore = (value) => {
  try {
    uni.setStorageSync(STORAGE_KEY, value)
  } catch (error) {
    console.warn('Theme concept actions sync skipped:', error)
  }
}

const syncActionState = () => {
  const bucket = readActionStore()
  bucket[concept.value.id] = {
    isLiked: isLiked.value,
    isCollected: isCollected.value,
    likeCount: likeCount.value,
    collectionCount: collectionCount.value,
    viewCount: viewCount.value
  }
  writeActionStore(bucket)
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  themeVol.value = Number(options.vol) || 1
  const period = getThemePeriodByVol(themeVol.value)
  themeTitle.value = period.title
  concept.value = getThemeConceptById(themeVol.value, decodeURIComponent(options.concept || ''))

  const actionStore = readActionStore()
  const localState = actionStore[concept.value.id]
  const baseStats = concept.value.stats || {}

  isLiked.value = !!localState?.isLiked
  isCollected.value = !!localState?.isCollected
  likeCount.value = typeof localState?.likeCount === 'number' ? localState.likeCount : Number(baseStats.likes || 0)
  collectionCount.value = typeof localState?.collectionCount === 'number' ? localState.collectionCount : Number(baseStats.collections || 0)
  viewCount.value = typeof localState?.viewCount === 'number' ? localState.viewCount + 1 : Number(baseStats.views || 0) + 1
  syncActionState()
})

const onScroll = (event) => {
  tabFixed.value = (event.detail.scrollTop || 0) > 300
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value = Math.max(0, likeCount.value + (isLiked.value ? 1 : -1))
  syncActionState()
}

const toggleCollect = () => {
  isCollected.value = !isCollected.value
  collectionCount.value = Math.max(0, collectionCount.value + (isCollected.value ? 1 : -1))
  syncActionState()
}

const openChat = () => {
  uni.navigateTo({
    url: `/pages/chat/index?artist=${encodeURIComponent(concept.value.artist?.name || '艺术家')}`
  })
}

const openArtist = () => {
  const artistName = concept.value.artist?.name
  if (!artistName) {
    return
  }

  uni.navigateTo({
    url: `/pages/artist/index?name=${encodeURIComponent(artistName)}`
  })
}

const previewArtwork = (artwork) => {
  const urls = (concept.value.artworks || []).map(item => item.image).filter(Boolean)
  if (!urls.length) {
    return
  }

  uni.previewImage({
    urls,
    current: artwork.image
  })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.concept-detail-page {
  min-height: 100vh;
  background: #f7f4ef;
}

.scroll-container {
  height: calc(100vh - 112rpx);
}

.concept-cover {
  position: relative;
  height: 520rpx;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.46) 62%, rgba(0, 0, 0, 0.68) 100%);
}

.back-btn {
  position: absolute;
  top: 40rpx;
  left: 32rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12rpx);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  color: #ffffff;
  font-size: 34rpx;
  line-height: 1;
}

.concept-content {
  margin-top: -36rpx;
  border-radius: 32rpx 32rpx 0 0;
  background: #f7f4ef;
  overflow: hidden;
}

.concept-header {
  padding: 34rpx 28rpx 28rpx;
}

.concept-title {
  display: block;
  font-size: 46rpx;
  font-weight: 600;
  line-height: 1.18;
  color: #171310;
}

.concept-artist {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #6d6155;
}

.concept-theme-row {
  margin-top: 18rpx;
}

.concept-theme-text {
  font-size: 22rpx;
  color: #948779;
}

.stats-row {
  display: flex;
  gap: 18rpx;
  margin-top: 26rpx;
}

.stat-item {
  flex: 1;
  min-width: 0;
  padding: 18rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.72);
}

.stat-icon {
  display: block;
  font-size: 20rpx;
  color: #8a7d70;
}

.stat-num {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #1e1915;
}

.tab-nav {
  position: relative;
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 0 24rpx;
  background: rgba(247, 244, 239, 0.96);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 4;
}

.tab-nav.is-fixed {
  position: sticky;
  z-index: 6;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #807567;
  font-weight: 500;
}

.tab-item.active {
  color: #181411;
}

.tab-indicator {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 33.3333%;
  height: 4rpx;
  background: #181411;
  transition: left 0.24s ease;
}

.tab-content {
  padding: 28rpx 24rpx 150rpx;
}

.desc-text {
  display: block;
  margin-bottom: 24rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: #55493e;
}

.artworks-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx 18rpx;
}

.artwork-card {
  overflow: hidden;
  border-radius: 18rpx;
  background: #ffffff;
}

.artwork-image {
  width: 100%;
  height: 360rpx;
  background: #ebe4da;
}

.artwork-title {
  display: block;
  padding: 14rpx 12rpx 18rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #181411;
}

.detail-block {
  padding: 22rpx 18rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.74);
}

.detail-block + .detail-block {
  margin-top: 18rpx;
}

.detail-label {
  display: block;
  font-size: 22rpx;
  font-weight: 600;
  color: #7b6f63;
  letter-spacing: 1rpx;
}

.detail-value {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: #241f1a;
}

.detail-value--paragraph + .detail-value--paragraph {
  margin-top: 18rpx;
}

.artist-card {
  display: flex;
  padding: 24rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.74);
}

.artist-avatar {
  width: 112rpx;
  height: 112rpx;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
}

.artist-info {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.artist-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.artist-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #181411;
}

.verified-badge {
  height: 34rpx;
  padding: 0 12rpx;
  border-radius: 999rpx;
  background: rgba(17, 15, 13, 0.08);
  font-size: 20rpx;
  line-height: 34rpx;
  color: #6f6356;
}

.artist-bio {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #5b5046;
}

.artist-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 16rpx;
}

.artist-stat {
  font-size: 20rpx;
  color: #8d8174;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 14rpx;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(18rpx);
  box-shadow: 0 -12rpx 32rpx rgba(23, 18, 14, 0.06);
}

.action-btn {
  flex: 1;
  height: 76rpx;
  border-radius: 20rpx;
  border: none;
  background: rgba(17, 15, 13, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  font-size: 24rpx;
  color: #1b1714;
}
</style>
