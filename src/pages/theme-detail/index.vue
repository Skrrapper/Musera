<template>
  <view class="theme-detail-page">
    <view class="theme-header">
      <image class="theme-bg" :src="themeImage" mode="aspectFill" />
      <view class="theme-header-overlay"></view>
      <view class="theme-header-content">
        <view class="theme-vol-tag">第 0{{ themeVol }} 期</view>
        <text class="theme-title">{{ themeTitle }}</text>
        <text class="theme-desc">{{ themeDesc }}</text>
      </view>
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
    </view>

    <view class="concepts-section">
      <text class="section-title">作品</text>

      <view class="concept-list" v-if="themeConcepts.length > 0">
        <view
          class="concept-card"
          v-for="(item, index) in themeConcepts"
          :key="item.id"
          :style="{ animationDelay: `${index * 0.06}s` }"
          @click="openConcept(item)"
        >
          <image class="concept-image" :src="item.image" mode="aspectFill" :style="getConceptMediaStyle(index)" />
          <view class="concept-body">
            <text class="concept-title">{{ item.title }}</text>
            <text class="concept-artist-name">{{ item.artist.name }}</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-else>
        <text class="empty-icon">○</text>
        <text class="empty-text">当前季度暂无概念内容</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getThemePeriodByVol } from '../../utils/themeConcepts'

const themeVol = ref(1)
const theme = ref(getThemePeriodByVol(1))

const themeTitle = computed(() => theme.value.title || '')
const themeDesc = computed(() => theme.value.summary || '')
const themeImage = computed(() => theme.value.img || '')
const themeConcepts = computed(() => theme.value.concepts || [])

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  const vol = Number(options.vol) || 1

  themeVol.value = vol
  theme.value = getThemePeriodByVol(vol)
})

const openConcept = (concept) => {
  uni.navigateTo({
    url: `/pages/theme-concept/index?vol=${themeVol.value}&concept=${encodeURIComponent(concept.id)}`
  })
}

const goBack = () => {
  uni.navigateBack()
}

const getConceptMediaStyle = (index) => {
  const heights = [420, 338, 470, 382, 438, 354]
  return {
    height: `${heights[index % heights.length]}rpx`
  }
}
</script>

<style lang="scss" scoped>
.theme-detail-page {
  min-height: 100vh;
  background-color: #ffffff;
}

.theme-header {
  position: relative;
  height: 420rpx;
  overflow: hidden;
}

.theme-bg {
  width: 100%;
  height: 100%;
}

.theme-header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.42) 56%, rgba(0, 0, 0, 0.68) 100%);
}

.theme-header-content {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  bottom: 34rpx;
}

.theme-vol-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 118rpx;
  height: 44rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.9);
  font-size: 20rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  color: #ffffff;
}

.theme-title {
  display: block;
  margin-top: 18rpx;
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: 50rpx;
  font-weight: 600;
  color: #ffffff;
}

.theme-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.84);
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
  z-index: 2;
}

.back-icon {
  color: #ffffff;
  font-size: 34rpx;
  line-height: 1;
}

.concepts-section {
  padding: 40rpx 24rpx 120rpx;
}

.section-title {
  display: block;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #14110f;
}

.concept-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  align-items: start;
}

.concept-card {
  width: 100%;
  background: #ffffff;
  opacity: 0;
  animation: cardFadeIn 0.55s ease-out forwards;
}

.concept-image {
  width: 100%;
  border-radius: 18rpx;
  background: #ede7df;
}

.concept-body {
  padding: 14rpx 6rpx 10rpx;
}

.concept-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.2;
  color: #1f1a16;
}

.concept-artist-name {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  font-weight: 400;
  color: #8b7f72;
}

.empty-state {
  padding: 120rpx 24rpx;
  text-align: center;
}

.empty-icon {
  display: block;
  font-size: 56rpx;
  color: #d4cdc4;
}

.empty-text {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #9f9386;
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
</style>
