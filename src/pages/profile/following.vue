<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack"><text>←</text></view>
      <text class="title">关注</text>
    </view>
    <view class="empty" v-if="list.length === 0">
      <text class="empty-text">还没有关注的人</text>
    </view>
    <view class="list" v-else>
      <view class="item" v-for="user in list" :key="user.id" @click="goToArtist(user)">
        <AppAvatar class="avatar" :src="getUserAvatar(user)" />
        <view class="info">
          <text class="name">{{ user.username }}</text>
          <text class="bio">{{ user.bio }}</text>
        </view>
        <button class="unfollow-btn" @click.stop="unfollow(user)">取消关注</button>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../../store/index'
import { resolveUserAvatar } from '../../utils/assets'
import AppAvatar from '../../components/AppAvatar.vue'
const store = useAppStore()
const list = ref([])
const getUserAvatar = (user) => resolveUserAvatar(user && user.avatar)
const goBack = () => uni.navigateBack()
const goToArtist = (user) => uni.navigateTo({ url: '/pages/artist/index?id=' + user.id })
const unfollow = async (user) => {
  try {
    await store.unfollowUser(user.id)
    list.value = list.value.filter(u => u.id !== user.id)
  } catch (e) {}
}
onMounted(async () => {
  if (store.user) {
    try {
    } catch (e) {}
  }
})
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: #f9f9f7; }
.header { display: flex; align-items: center; padding: 48rpx 32rpx; }
.back-btn { width: 64rpx; height: 64rpx; }
.title { font-size: 36rpx; font-weight: bold; margin-left: 16rpx; }
.empty { padding: 100rpx; text-align: center; }
.empty-text { color: #8c8c8c; }
.list { padding: 24rpx; }
.item { display: flex; align-items: center; background: #fff; padding: 24rpx; border-radius: 24rpx; margin-bottom: 16rpx; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; }
.info { flex: 1; margin-left: 24rpx; }
.name { display: block; font-size: 28rpx; font-weight: bold; }
.bio { display: block; font-size: 24rpx; color: #8c8c8c; margin-top: 4rpx; }
.unfollow-btn { padding: 16rpx 24rpx; background: #f5f5f5; border-radius: 16rpx; font-size: 24rpx; }
</style>
