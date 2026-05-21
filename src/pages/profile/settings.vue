<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack"><text>←</text></view>
      <text class="title">设置</text>
    </view>

    <view class="section">
      <text class="section-title">账号</text>
      <view class="item" @click="goToChangePassword">
        <text class="item-text">修改密码</text>
        <text class="item-arrow">›</text>
      </view>
      <view class="item" @click="deleteAccount">
        <text class="item-text delete">注销账号</text>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">关于</text>
      <view class="item">
        <text class="item-text">版本</text>
        <text class="item-value">1.0.0</text>
      </view>
      <view class="item" @click="showAbout">
        <text class="item-text">关于 MUSE</text>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </view>
</template>

<script setup>
import { useAppStore } from '../../store/index'

const store = useAppStore()

const goBack = () => uni.navigateBack()

const goToChangePassword = () => {
  uni.navigateTo({ url: '/pages/profile/change-password' })
}

const deleteAccount = () => {
  uni.showModal({
    title: '注销账号',
    content: '确认注销当前账号？此操作无法撤销。',
    confirmText: '注销',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          await store.logout()
          store.showToast('账号已注销')
          uni.switchTab({ url: '/pages/profile/index' })
        } catch (e) {
          store.showToast('注销失败')
        }
      }
    }
  })
}

const showAbout = () => {
  uni.showModal({
    title: '关于 MUSE',
    content: 'MUSE 是一个面向艺术爱好者的社区与作品平台，用来发现、收藏和分享当代艺术作品。',
    showCancel: false
  })
}

const handleLogout = async () => {
  try {
    await store.logout()
    store.showToast('已退出登录')
  } catch (e) {
    store.showToast('退出失败')
  }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f9f9f7; padding-bottom: 100rpx; }
.header { display: flex; align-items: center; padding: 48rpx 32rpx; }
.back-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.back-btn text { font-size: 36rpx; }
.title { font-size: 36rpx; font-weight: bold; margin-left: 16rpx; }
.section { padding: 24rpx 32rpx; }
.section-title { display: block; font-size: 26rpx; color: #8c8c8c; margin-bottom: 16rpx; }
.item { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 32rpx; border-radius: 24rpx; margin-bottom: 16rpx; }
.item-text { font-size: 28rpx; color: #1a1a1a; }
.item-text.delete { color: #ff4d4f; }
.item-value { font-size: 28rpx; color: #8c8c8c; }
.item-arrow { font-size: 32rpx; color: #ccc; }
.logout-btn { margin: 48rpx 32rpx; background: #f5f5f5; color: #ff4d4f; border-radius: 32rpx; padding: 32rpx; font-size: 28rpx; font-weight: bold; }
</style>
