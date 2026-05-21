<template>
  <view class="home-page">
    <view
      v-if="splashVisible"
      :class="['launch-overlay', { 'launch-overlay--fading': splashFading }]"
      @touchmove.stop.prevent="noop"
    >
      <view class="launch-skip" @tap.stop="skipLaunchSplash">
        <text class="launch-skip__text">跳过</text>
      </view>

      <view class="launch-stage">
        <image
          class="launch-video"
          src="/static/videos/launch-splash.gif"
          mode="aspectFill"
        />
      </view>
    </view>

    <view class="header">
      <text class="logo">MUSE.</text>
      <AppAvatar
        class="avatar"
        :src="currentAvatar"
        :cache-key="store.avatarVersion"
        @click="goToProfile"
      />
    </view>

    <view class="feature-stage">
      <view class="featured-card" @tap="openThemePreview">
        <video
          class="featured-video"
          :src="currentTheme.previewVideo"
          :poster="currentTheme.img"
          object-fit="cover"
          autoplay
          muted
          loop
          :show-center-play-btn="false"
          :show-play-btn="false"
          :controls="false"
          :enable-progress-gesture="false"
        />
        <view class="featured-overlay"></view>
        <view class="featured-content">
          <text class="featured-tag">第 {{ currentTheme.vol }} 期</text>
          <text class="featured-title">{{ currentTheme.title }}</text>
          <text class="featured-hint">轻触展开本季导览</text>
        </view>
      </view>
    </view>

    <view class="home-content">
      <view class="archive-section">
      <view class="archive-header">
        <text class="archive-title">往期精选</text>
      </view>
      <view class="archive-list">
        <view
          v-for="item in archiveItems"
          :key="item.vol"
          class="archive-card"
          @tap="openPeriod(item.vol, item.title)"
        >
          <image class="archive-image" :src="item.img" mode="aspectFill" />
          <view class="archive-overlay"></view>
          <view class="archive-content">
            <text class="archive-tag">第 0{{ item.vol }} 期</text>
            <text class="archive-name">{{ item.title }}</text>
          </view>
        </view>
      </view>
      </view>

      <view v-if="featuredList.length" class="featured-section">
        <view class="archive-header">
          <text class="archive-title">精选作品</text>
        </view>
        <scroll-view class="featured-scroll" scroll-x :show-scrollbar="false">
          <view
            v-for="artwork in featuredList"
            :key="artwork.id"
            class="featured-item"
            @tap="goToDetail(artwork.id)"
          >
            <image class="featured-item-img" :src="getArtworkImage(artwork)" mode="aspectFill" />
            <text class="featured-item-title">{{ artwork.title }}</text>
            <text class="featured-item-artist">{{ resolveArtistName(artwork) }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <view
      v-if="themePreviewVisible"
      class="preview-mask preview-mask--expanded"
      :style="{ background: `rgba(17, 14, 11, ${previewMaskOpacity})` }"
      @tap="handlePreviewMaskTap"
    >
      <view
        class="preview-sheet"
        :class="{ 'preview-sheet--dragging': themePreviewDragging }"
        :style="previewSheetStyle"
        @tap.stop="noop"
      >
        <scroll-view
          scroll-y
          class="preview-scroll"
          :show-scrollbar="false"
          @scroll="handlePreviewScroll"
          @touchstart="handlePreviewTouchStart"
          @touchmove="handlePreviewTouchMove"
          @touchend="handlePreviewTouchEnd"
          @touchcancel="handlePreviewTouchEnd"
        >
          <view class="preview-media">
            <video
              class="preview-video"
              :src="currentTheme.previewVideo"
              :poster="currentTheme.img"
              object-fit="cover"
              autoplay
              muted
              loop
              :show-center-play-btn="false"
              :show-play-btn="false"
              :controls="false"
              :enable-progress-gesture="false"
            />
            <view class="preview-back" @tap.stop="closeThemePreview">
              <text class="preview-back__icon">‹</text>
            </view>
            <view class="video-expand video-expand--preview" @tap.stop="openCurrentThemeVideo">
              <view class="video-expand__frame">
                <view class="video-expand__corner video-expand__corner--lt"></view>
                <view class="video-expand__corner video-expand__corner--rt"></view>
                <view class="video-expand__corner video-expand__corner--lb"></view>
                <view class="video-expand__corner video-expand__corner--rb"></view>
              </view>
            </view>
            <view class="preview-media-overlay"></view>
            <view class="preview-media-copy">
              <text class="preview-media-tag">第 {{ currentTheme.vol }} 期</text>
              <text class="preview-media-title">{{ currentTheme.title }}</text>
            </view>
          </view>

          <view class="preview-guide">
            <view class="preview-guide-entry">
              <text class="preview-guide-entry-title">{{ currentTheme.title }}</text>
              <view class="preview-guide-entry-btn" @tap.stop="openCurrentThemePeriod">
                <text class="preview-guide-entry-btn-text">进入</text>
              </view>
            </view>
            <text class="preview-guide-kicker">{{ currentTheme.guideLabel }}</text>
            <text class="preview-guide-title">{{ currentTheme.guideTitle }}</text>
            <text class="preview-guide-summary">{{ currentTheme.summary }}</text>

            <view
              v-for="section in currentTheme.guideSections"
              :key="section.title"
              class="preview-guide-section"
            >
              <text class="preview-guide-section-title">{{ section.title }}</text>
              <text class="preview-guide-section-text">{{ section.text }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { onHide, onLoad, onUnload } from '@dcloudio/uni-app'
import AppAvatar from '../../components/AppAvatar.vue'
import { useAppStore } from '../../store'

const currentTheme = {
  vol: 3,
  title: '自然与寂静',
  img: 'https://picsum.photos/600/800?random=featured',
  previewVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  guideLabel: '季度导览',
  guideTitle: '从观看进入感知',
  summary: '这一季以自然肌理、留白和安静色温为线索，让观看先慢下来，再进入作品的材料、比例与情绪。',
  guideSections: [
    {
      title: '导览一',
      text: '从雾白、浅土与低饱和绿开始，本季先建立柔和的视觉气候，让视线停在表面与呼吸感上。'
    },
    {
      title: '导览二',
      text: '器物与图像都被放在更克制的陈列关系中，重点不是“陈设完成”，而是感受作品如何与空间发生共振。'
    },
    {
      title: '导览三',
      text: '如果你想继续深入，可以直接进入本季作品页，查看每件作品的细节、材质与完整展示。'
    }
  ]
}

const archiveItems = [
  {
    vol: 2,
    title: '现代主义',
    img: 'https://picsum.photos/400/300?random=vol2'
  },
  {
    vol: 1,
    title: '抽象意识',
    img: 'https://picsum.photos/400/300?random=vol1'
  }
]

const store = useAppStore()
const splashTimers = []
const splashState = reactive({
  visible: false,
  fading: false
})

const splashVisible = computed(() => splashState.visible)
const splashFading = computed(() => splashState.fading)
const themePreviewVisible = ref(false)
const themePreviewActive = ref(false)
const themePreviewDragging = ref(false)
const previewDismissOffset = ref(0)
const previewScrollTop = ref(0)
const previewTouchStartY = ref(0)
const previewTouchStartX = ref(0)
const previewCanDrag = ref(false)
let previewTimer = null

const currentAvatar = computed(() => (store.user && store.user.avatar) || '')
const featuredList = computed(() => store.featuredArtworks || [])
const previewMaskOpacity = computed(() => {
  const baseOpacity = themePreviewActive.value ? 0.76 : 0
  const dragFade = Math.min(previewDismissOffset.value / 360, 0.4)
  return Math.max(0, baseOpacity - dragFade).toFixed(3)
})
const previewSheetStyle = computed(() => {
  const enteringOffset = themePreviewActive.value ? 0 : 72
  const offset = enteringOffset + previewDismissOffset.value
  const scale = themePreviewDragging.value
    ? 1 - Math.min(previewDismissOffset.value / 1400, 0.06)
    : (themePreviewActive.value ? 1 : 0.965)

  return {
    transform: `translate3d(0, ${offset}px, 0) scale(${scale})`,
    opacity: themePreviewActive.value || themePreviewDragging.value ? 1 : 0
  }
})

const noop = () => {}

const resetSplashState = () => {
  splashState.visible = false
  splashState.fading = false
}

const scheduleSplash = (callback, delay) => {
  const timer = setTimeout(callback, delay)
  splashTimers.push(timer)
}

const clearSplashTimers = () => {
  while (splashTimers.length) {
    clearTimeout(splashTimers.pop())
  }
}

const shouldPlayLaunchSplash = () => {
  const app = typeof getApp === 'function' ? getApp() : null
  if (!app) {
    return true
  }

  app.globalData = app.globalData || {}
  if (app.globalData.launchSplashPlayed) {
    return false
  }

  app.globalData.launchSplashPlayed = true
  return true
}

const setTabBarVisible = (visible) => {
  try {
    if (visible) {
      uni.showTabBar({ animation: false })
    } else {
      uni.hideTabBar({ animation: false })
    }
  } catch (error) {
    console.warn('TabBar visibility update skipped:', error)
  }
}

const startLaunchSplash = () => {
  resetSplashState()
  splashState.visible = true
  clearSplashTimers()
  setTabBarVisible(false)

  scheduleSplash(() => {
    finishLaunchSplash(320)
  }, 10000)
}

const finishLaunchSplash = (fadeDuration = 220) => {
  if (!splashVisible.value || splashState.fading) {
    return
  }

  clearSplashTimers()
  splashState.fading = true

  scheduleSplash(() => {
    resetSplashState()
    setTabBarVisible(true)
  }, fadeDuration)
}

const skipLaunchSplash = () => {
  if (!splashVisible.value) {
    return
  }

  finishLaunchSplash()
}

const resolveArtistName = (artwork) => {
  if (artwork && artwork.artist && artwork.artist.username) {
    return artwork.artist.username
  }
  if (artwork && typeof artwork.artist === 'string') {
    return artwork.artist
  }
  return '未知艺术家'
}

const getArtworkImage = (artwork) => {
  if (!artwork) {
    return ''
  }

  if (artwork.cover_image) {
    return artwork.cover_image
  }

  if (Array.isArray(artwork.images) && artwork.images.length) {
    return artwork.images[0]
  }

  return ''
}

const loadHomeData = async () => {
  try {
    if (store.artworks.length === 0) {
      await store.fetchArtworks({ page: 1, page_size: 20 })
    }
    if (store.featuredArtworks.length === 0) {
      await store.fetchFeaturedArtworks()
    }
  } catch (error) {
    console.warn('Failed to load home data:', error)
  }
}

const openPeriod = (vol, title) => {
  uni.navigateTo({
    url: `/pages/theme-detail/index?vol=${vol}&title=${encodeURIComponent(title)}`
  })
}

const resetThemePreviewState = () => {
  themePreviewVisible.value = false
  themePreviewActive.value = false
  themePreviewDragging.value = false
  previewDismissOffset.value = 0
  previewScrollTop.value = 0
  previewCanDrag.value = false
}

const clearThemePreviewTimer = () => {
  if (previewTimer) {
    clearTimeout(previewTimer)
    previewTimer = null
  }
}

const openThemePreview = async () => {
  if (themePreviewVisible.value) {
    return
  }

  clearThemePreviewTimer()
  themePreviewVisible.value = true
  themePreviewActive.value = false
  themePreviewDragging.value = false
  previewDismissOffset.value = 0
  previewScrollTop.value = 0

  await nextTick()
  themePreviewActive.value = true
}

const closeThemePreview = () => {
  if (!themePreviewVisible.value) {
    return
  }

  clearThemePreviewTimer()
  themePreviewDragging.value = false
  previewDismissOffset.value = 0
  themePreviewActive.value = false
  previewCanDrag.value = false

  previewTimer = setTimeout(() => {
    themePreviewVisible.value = false
    previewScrollTop.value = 0
    previewTimer = null
  }, 280)
}

const handlePreviewMaskTap = () => {
  closeThemePreview()
}

const handlePreviewScroll = (event) => {
  previewScrollTop.value = event.detail.scrollTop || 0
}

const handlePreviewTouchStart = (event) => {
  const touch = event.touches && event.touches[0]
  if (!touch) {
    return
  }

  previewTouchStartY.value = touch.clientY
  previewTouchStartX.value = touch.clientX
  previewCanDrag.value = previewScrollTop.value <= 2
}

const handlePreviewTouchMove = (event) => {
  if (!previewCanDrag.value) {
    return
  }

  const touch = event.touches && event.touches[0]
  if (!touch) {
    return
  }

  const deltaY = touch.clientY - previewTouchStartY.value
  const deltaX = Math.abs(touch.clientX - previewTouchStartX.value)

  if (deltaY <= 0 || deltaY <= deltaX || previewScrollTop.value > 2) {
    return
  }

  themePreviewDragging.value = true
  previewDismissOffset.value = Math.min(deltaY * 0.82, 260)
}

const handlePreviewTouchEnd = () => {
  if (!themePreviewDragging.value) {
    previewCanDrag.value = false
    return
  }

  if (previewDismissOffset.value > 132) {
    closeThemePreview()
  } else {
    themePreviewDragging.value = false
    previewDismissOffset.value = 0
  }

  previewCanDrag.value = false
}

const openCurrentThemePeriod = () => {
  closeThemePreview()
  openPeriod(currentTheme.vol, currentTheme.title)
}

const openCurrentThemeVideo = () => {
  uni.navigateTo({
    url: `/pages/video-detail/index?vol=${currentTheme.vol}&title=${encodeURIComponent(currentTheme.title)}&video=${encodeURIComponent(currentTheme.previewVideo)}&poster=${encodeURIComponent(currentTheme.img)}`
  })
}

const goToProfile = () => {
  uni.switchTab({
    url: '/pages/profile/index'
  })
}

const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/product-detail/index?id=${id}`
  })
}

onLoad(() => {
  if (shouldPlayLaunchSplash()) {
    startLaunchSplash()
  } else {
    setTabBarVisible(true)
  }
})

onMounted(() => {
  loadHomeData()
})

onHide(() => {
  clearThemePreviewTimer()
  resetThemePreviewState()

  if (!splashVisible.value) {
    return
  }

  clearSplashTimers()
  resetSplashState()
  setTabBarVisible(true)
})

onUnload(() => {
  clearThemePreviewTimer()
  resetThemePreviewState()
  clearSplashTimers()
  resetSplashState()
  setTabBarVisible(true)
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 32rpx 28rpx calc(env(safe-area-inset-bottom) + 36rpx);
  background: linear-gradient(180deg, #f7f4ee 0%, #f5f1ea 45%, #faf8f3 100%);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.logo {
  font-size: 44rpx;
  font-weight: 600;
  letter-spacing: 6rpx;
  color: #1f1a16;
}

.avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 999rpx;
  box-shadow: 0 14rpx 26rpx rgba(36, 26, 17, 0.08);
}

.feature-stage {
  width: auto;
  min-height: calc(100vh - 168rpx - env(safe-area-inset-bottom));
  display: flex;
  align-items: stretch;
  margin-left: -28rpx;
  margin-right: -28rpx;
  margin-bottom: 36rpx;
}

.featured-card {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 168rpx - env(safe-area-inset-bottom));
  border-radius: 0;
  background: #1f1a16;
  box-shadow: 0 26rpx 60rpx rgba(39, 30, 22, 0.14);
}

.featured-image,
.featured-video {
  width: 100%;
  height: 100%;
}

.featured-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(16, 12, 9, 0.04), rgba(16, 12, 9, 0.56));
}

.video-expand {
  position: absolute;
  top: 26rpx;
  right: 26rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74rpx;
  height: 74rpx;
  border-radius: 999rpx;
  background: rgba(19, 15, 12, 0.22);
  backdrop-filter: blur(12rpx);
}

.video-expand--preview {
  top: calc(env(safe-area-inset-top) + 24rpx);
  right: 24rpx;
}

.video-expand__frame {
  position: relative;
  width: 32rpx;
  height: 32rpx;
}

.video-expand__corner {
  position: absolute;
  width: 11rpx;
  height: 11rpx;
  border-color: #fff8f0;
  opacity: 0.96;
}

.video-expand__corner--lt {
  top: 0;
  left: 0;
  border-top-width: 3rpx;
  border-left-width: 3rpx;
  border-top-style: solid;
  border-left-style: solid;
}

.video-expand__corner--rt {
  top: 0;
  right: 0;
  border-top-width: 3rpx;
  border-right-width: 3rpx;
  border-top-style: solid;
  border-right-style: solid;
}

.video-expand__corner--lb {
  bottom: 0;
  left: 0;
  border-bottom-width: 3rpx;
  border-left-width: 3rpx;
  border-bottom-style: solid;
  border-left-style: solid;
}

.video-expand__corner--rb {
  right: 0;
  bottom: 0;
  border-right-width: 3rpx;
  border-bottom-width: 3rpx;
  border-right-style: solid;
  border-bottom-style: solid;
}

.featured-content {
  position: absolute;
  left: 30rpx;
  right: 160rpx;
  bottom: 46rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  z-index: 1;
}

.featured-tag {
  font-size: 24rpx;
  color: rgba(255, 244, 226, 0.78);
}

.featured-title {
  font-size: 62rpx;
  font-weight: 600;
  line-height: 1.12;
  color: #fff7ee;
}

.featured-hint {
  margin-top: 18rpx;
  font-size: 22rpx;
  color: rgba(255, 247, 238, 0.84);
}

.home-content {
  padding: 36rpx 28rpx calc(env(safe-area-inset-bottom) + 48rpx);
}

.archive-section,
.featured-section {
  margin-bottom: 34rpx;
}

.archive-section {
  margin-left: -28rpx;
  margin-right: -28rpx;
}

.preview-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(17, 14, 11, 0.68);
  transition: background 280ms ease;
}

.preview-mask--expanded {
  backdrop-filter: blur(10rpx);
}

.preview-sheet {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f7f3ed;
  transform-origin: center top;
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease;
}

.preview-sheet--dragging {
  transition: none;
}

.preview-scroll {
  width: 100%;
  height: 100%;
}

.preview-media {
  position: relative;
  width: 100%;
  height: 960rpx;
  overflow: hidden;
  background: #111;
}

.preview-video {
  display: block;
  width: 100%;
  height: 100%;
  background: #111;
}

.preview-back {
  position: absolute;
  left: 24rpx;
  top: calc(env(safe-area-inset-top) + 24rpx);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: rgba(19, 15, 12, 0.32);
  backdrop-filter: blur(12rpx);
}

.preview-back__icon {
  color: #fff7ee;
  font-size: 44rpx;
  line-height: 1;
}

.preview-media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(14, 10, 8, 0.02), rgba(14, 10, 8, 0.58));
}

.preview-media-copy {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 36rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.preview-media-tag {
  font-size: 24rpx;
  color: rgba(255, 245, 229, 0.8);
}

.preview-media-title {
  font-size: 58rpx;
  font-weight: 600;
  line-height: 1.1;
  color: #fff8f0;
}

.preview-guide {
  padding: 18rpx 28rpx calc(env(safe-area-inset-bottom) + 56rpx);
}

.preview-guide-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26rpx;
  padding: 0 0 24rpx;
  border-bottom: 1rpx solid rgba(122, 109, 97, 0.12);
}

.preview-guide-entry-title {
  flex: 1;
  padding-right: 24rpx;
  color: #1f1a16;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.3;
}

.preview-guide-entry-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100rpx;
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #1f1a16;
}

.preview-guide-entry-btn-text {
  color: #fff9f1;
  font-size: 22rpx;
  font-weight: 600;
}

.preview-guide-kicker {
  display: block;
  font-size: 22rpx;
  letter-spacing: 4rpx;
  color: #978b7e;
}

.preview-guide-title {
  display: block;
  margin-top: 14rpx;
  font-size: 44rpx;
  font-weight: 600;
  line-height: 1.2;
  color: #1f1a16;
}

.preview-guide-summary {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #5e5349;
}

.preview-guide-section {
  margin-top: 28rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid rgba(122, 109, 97, 0.12);
}

.preview-guide-section-title {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 3rpx;
  color: #8f8071;
}

.preview-guide-section-text {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.85;
  color: #4f453d;
}

.archive-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
  padding: 0 28rpx;
}

.archive-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f1a16;
}

.archive-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  padding: 0;
}

.archive-card {
  position: relative;
  overflow: hidden;
  height: 276rpx;
  border-radius: 28rpx;
  box-shadow: 0 18rpx 34rpx rgba(42, 30, 18, 0.08);
}

.archive-image {
  width: 100%;
  height: 100%;
}

.archive-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(21, 16, 12, 0.58), rgba(21, 16, 12, 0.08));
}

.archive-content {
  position: absolute;
  left: 28rpx;
  right: 28rpx;
  bottom: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.archive-tag {
  font-size: 24rpx;
  color: rgba(255, 245, 228, 0.76);
}

.archive-name {
  font-size: 40rpx;
  font-weight: 600;
  color: #fff8ef;
}

.featured-scroll {
  white-space: nowrap;
}

.featured-item {
  display: inline-flex;
  flex-direction: column;
  width: 256rpx;
  margin-right: 18rpx;
}

.featured-item:last-child {
  margin-right: 0;
}

.featured-item-img {
  width: 256rpx;
  height: 320rpx;
  border-radius: 24rpx;
  background: #e7dfd3;
}

.featured-item-title {
  margin-top: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f1a16;
}

.featured-item-artist {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8b7f72;
}

.launch-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  opacity: 1;
  transition: opacity 420ms ease;
}

.launch-overlay--fading {
  opacity: 0;
}

.launch-skip {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 32rpx);
  right: 32rpx;
  z-index: 8;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 96rpx;
  height: 48rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(10rpx);
}

.launch-skip__text {
  font-size: 20rpx;
  line-height: 1;
  color: rgba(17, 17, 17, 0.62);
  letter-spacing: 2rpx;
}

.launch-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fff;
}

.launch-video {
  width: 100%;
  height: 100%;
  background: #fff;
}
</style>
