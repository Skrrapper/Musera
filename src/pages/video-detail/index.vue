<template>
  <view class="video-detail-page">
    <view class="video-detail-media">
      <video
        v-if="detail.video"
        class="video-detail-player"
        :src="detail.video"
        object-fit="cover"
        autoplay
        controls
        show-fullscreen-btn
        show-play-btn
        enable-progress-gesture
      />
      <view class="video-detail-topbar">
        <view class="video-detail-back" @tap="goBack">
          <text class="video-detail-back__icon">‹</text>
        </view>
        <view class="video-detail-meta">
          <text class="video-detail-kicker">第 {{ detail.vol }} 期视频导览</text>
          <text class="video-detail-title">{{ detail.title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const detail = reactive({
  vol: '',
  title: '季度视频',
  video: ''
})

const decodeValue = (value = '') => {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch (error) {
    return value
  }
}

const goBack = () => {
  uni.navigateBack()
}

onLoad((query) => {
  detail.vol = query?.vol || ''
  detail.title = decodeValue(query?.title) || '季度视频'
  detail.video = decodeValue(query?.video)
})
</script>

<style scoped>
.video-detail-page {
  min-height: 100vh;
  background: #110e0b;
}

.video-detail-media {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #110e0b;
}

.video-detail-player {
  display: block;
  width: 100%;
  height: 100vh;
  background: #110e0b;
}

.video-detail-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-start;
  gap: 22rpx;
  padding: calc(env(safe-area-inset-top) + 24rpx) 28rpx 32rpx;
  background: linear-gradient(180deg, rgba(17, 14, 11, 0.5), rgba(17, 14, 11, 0));
  pointer-events: none;
}

.video-detail-back {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: rgba(255, 249, 241, 0.12);
  backdrop-filter: blur(12rpx);
}

.video-detail-back__icon {
  color: #fff8f0;
  font-size: 44rpx;
  line-height: 1;
}

.video-detail-meta {
  flex: 1;
  padding-top: 8rpx;
}

.video-detail-kicker {
  display: block;
  font-size: 22rpx;
  letter-spacing: 4rpx;
  color: rgba(255, 244, 226, 0.72);
}

.video-detail-title {
  display: block;
  margin-top: 10rpx;
  font-size: 42rpx;
  font-weight: 600;
  line-height: 1.2;
  color: #fff8f0;
}
</style>
