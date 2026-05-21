<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack"><text>←</text></view>
      <text class="title">收藏</text>
    </view>
    <view class="empty" v-if="list.length === 0">
      <text class="empty-text">暂无收藏</text>
    </view>
    <view class="grid" v-else>
      <view class="item" v-for="(item, index) in list" :key="item.id" @click="goToDetail(item)">
        <view class="media" :style="getMediaStyle(index)">
          <image class="img" :src="item.cover_image" mode="aspectFill" />
        </view>
        <text class="name">{{ item.title }}</text>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../../store/index'
const store = useAppStore()
const list = ref([])
const goBack = () => uni.navigateBack()
const goToDetail = (item) => uni.navigateTo({ url: '/pages/product-detail/index?id=' + item.id })
const getMediaStyle = (index) => {
  const heights = [418, 336, 468, 380, 440, 352]
  return { height: `${heights[index % heights.length]}rpx` }
}
onMounted(async () => {
  try {
    await store.fetchAddresses()
  } catch (e) {}
})
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: #f9f9f7; padding-bottom: 100rpx; }
.header { display: flex; align-items: center; padding: 48rpx 32rpx; }
.back-btn { width: 64rpx; height: 64rpx; }
.title { font-size: 36rpx; font-weight: bold; margin-left: 16rpx; }
.empty { padding: 100rpx; text-align: center; }
.empty-text { color: #8c8c8c; }
.grid { column-count: 2; column-gap: 24rpx; padding: 24rpx; }
.item { display: inline-block; width: 100%; margin-bottom: 24rpx; background: #fff; border-radius: 24rpx; overflow: hidden; break-inside: avoid; }
.media { position: relative; width: 100%; background: #efebe5; }
.img { position: absolute; inset: 0; width: 100%; height: 100%; }
.name { display: block; padding: 16rpx; font-size: 26rpx; line-height: 1.35; word-break: break-word; }
</style>
