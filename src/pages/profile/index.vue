<template>
  <view class="profile-page">
    <view v-if="!isLoggedIn" class="login-view">
      <view class="login-icon">M</view>
      <text class="login-title">欢迎回来</text>
      <text class="login-subtitle">登录后继续浏览、收藏与交流</text>

      <view class="login-form">
        <view class="login-tabs">
          <view class="login-tab" :class="{ active: loginMode === 'sms' }" @click="loginMode = 'sms'">
            <text>验证码登录</text>
          </view>
          <view class="login-tab" :class="{ active: loginMode === 'password' }" @click="loginMode = 'password'">
            <text>密码登录</text>
          </view>
        </view>

        <template v-if="loginMode === 'sms'">
          <view class="input-shell">
            <input
              v-model="phone"
              class="input-control"
              type="number"
              maxlength="11"
              confirm-type="next"
              cursor-spacing="160"
              cursor-color="#1a1a1a"
              placeholder="手机号"
              placeholder-style="color: #aba39a;"
            />
          </view>

          <view class="code-row">
            <view class="input-shell input-shell--code">
              <input
                v-model="code"
                class="input-control"
                type="number"
                maxlength="6"
                confirm-type="done"
                cursor-spacing="160"
                cursor-color="#1a1a1a"
                placeholder="验证码"
                placeholder-style="color: #aba39a;"
              />
            </view>
            <button class="code-btn" :disabled="countdown > 0" @click="sendCode">
              {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
            </button>
          </view>
        </template>

        <template v-else>
          <view class="input-shell">
            <input
              v-model.trim="account"
              class="input-control"
              type="text"
              maxlength="50"
              confirm-type="next"
              cursor-spacing="160"
              cursor-color="#1a1a1a"
              placeholder="用户名"
              placeholder-style="color: #aba39a;"
            />
          </view>

          <view class="input-shell">
            <input
              v-model="password"
              class="input-control"
              type="text"
              password
              confirm-type="done"
              cursor-spacing="160"
              cursor-color="#1a1a1a"
              placeholder="密码"
              placeholder-style="color: #aba39a;"
            />
          </view>
        </template>

        <button class="submit-btn" @click="handleLogin">登录</button>

        <view class="register-link" @click="goToRegister">
          <text>还没有账号？立即注册</text>
        </view>
      </view>
    </view>

    <view v-else class="profile-view">
      <view class="profile-header">
        <AppAvatar
          class="profile-avatar"
          :src="userAvatar"
          :cache-key="store.avatarVersion"
          @click="updateAvatar"
        />
        <view class="profile-info">
          <text class="profile-name">{{ userName }}</text>
          <view class="profile-badge">
            <text class="badge-text">{{ isVerified ? '已认证' : '普通用户' }}</text>
            <text class="profile-id">ID: {{ userId }}</text>
          </view>
          <text v-if="userBio" class="profile-bio">{{ userBio }}</text>
        </view>
        <view class="edit-btn" @click="goToEdit">
          <text>编辑</text>
        </view>
      </view>

      <view class="stats-row">
        <view class="stat-item" @click="goToCollections">
          <text class="stat-num">{{ likesCount }}</text>
          <text class="stat-label">收藏</text>
        </view>
        <view class="stat-item" @click="goToFollowing">
          <text class="stat-num">{{ followingCount }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-item" @click="goToOrders">
          <text class="stat-num">{{ orderCount }}</text>
          <text class="stat-label">订单</text>
        </view>
      </view>

      <view class="order-panel">
        <view class="order-panel__header">
          <text class="order-panel__title">我的订单</text>
          <view class="order-panel__more" @click="goToOrders()">
            <text class="order-panel__more-text">查看全部</text>
            <text class="order-panel__more-arrow">›</text>
          </view>
        </view>
        <view class="order-shortcuts">
          <view
            v-for="item in orderShortcutItems"
            :key="item.key"
            class="order-shortcut"
            @click="goToOrders(item.status)"
          >
            <view class="order-shortcut__icon" :class="'order-shortcut__icon--' + item.icon"></view>
            <text class="order-shortcut__label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view v-if="canPublishArtwork" class="artist-studio" @click="goToMyArtworks">
        <view class="studio-copy">
          <text class="studio-kicker">艺术家工作台</text>
          <text class="studio-title">管理你的作品</text>
          <text class="studio-desc">发布新作、编辑作品，或查看你的艺术品列表。</text>
        </view>
        <view class="studio-arrow">
          <text>→</text>
        </view>
      </view>

      <view class="messages-section">
        <view class="section-header">
          <text class="section-title">消息</text>
          <text v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</text>
        </view>

        <view v-if="conversations.length > 0" class="messages-list">
          <view v-for="conv in conversations" :key="conv.id" class="message-item" @click="openChat(conv)">
            <AppAvatar class="message-avatar" :src="getConvAvatar(conv)" />
            <view class="message-info">
              <text class="message-name">{{ getConvName(conv) }}</text>
              <text class="message-preview">{{ conv.last_message }}</text>
            </view>
            <view class="message-meta">
              <text class="message-time">{{ formatTime(conv.last_message_time) }}</text>
              <view v-if="conv.unread_count > 0" class="message-dot">
                <text>{{ conv.unread_count > 99 ? '99+' : conv.unread_count }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-message">
          <text class="empty-text">暂无消息</text>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-item" @click="goToAddresses">
          <view class="menu-icon address-icon"></view>
          <text class="menu-text">地址管理</text>
        </view>
        <view class="menu-item" @click="goToSettings">
          <view class="menu-icon settings-icon"></view>
          <text class="menu-text">设置</text>
        </view>
      </view>

      <button class="logout-btn" @click="handleLogout">退出登录</button>

      <view v-if="canPublishArtwork" class="artist-fab" @click="goToArtworkEditor">
        <text class="artist-fab-icon">+</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { onHide, onShow } from '@dcloudio/uni-app'
import AppAvatar from '../../components/AppAvatar.vue'
import { useAppStore } from '../../store/index'
import { uploadImage } from '../../utils/api/upload'
import { DEFAULT_USER_AVATAR, resolveUserAvatar } from '../../utils/assets'

const store = useAppStore()

const loginMode = ref('sms')
const phone = ref('')
const account = ref('')
const code = ref('')
const password = ref('')
const countdown = ref(0)
const avatarUpdating = ref(false)
const orderCount = ref(0)
let countdownTimer = null

const orderShortcutItems = [
  { key: 'pending', label: '待付款', status: 'pending', icon: 'wallet' },
  { key: 'paid', label: '待发货', status: 'paid', icon: 'box' },
  { key: 'shipped', label: '待收货', status: 'shipped', icon: 'truck' },
  { key: 'completed', label: '已完成', status: 'completed', icon: 'clipboard' },
  { key: 'aftersale', label: '售后', status: 'aftersale', icon: 'return' }
]

const isLoggedIn = computed(() => !!store.token)
const userAvatar = computed(() => resolveUserAvatar(store.user && store.user.avatar))
const userName = computed(() => (store.user && store.user.username) || '藏家')
const isVerified = computed(() => !!(store.user && store.user.is_verified))
const userId = computed(() => (store.user && store.user.id) || '')
const userBio = computed(() => (store.user && store.user.bio) || '')
const likesCount = computed(() => (store.user && store.user.likes_count) || 0)
const followingCount = computed(() => (store.user && store.user.following_count) || 0)
const canPublishArtwork = computed(() => !!store.token && !!(store.user && store.user.is_verified))
const conversations = computed(() => store.conversations || [])
const unreadCount = computed(() => store.unreadCount || 0)

const getConvAvatar = (conv) => resolveUserAvatar((conv && conv.user && conv.user.avatar) || DEFAULT_USER_AVATAR)
const getConvName = (conv) => (conv && conv.user && conv.user.username) || '未知用户'

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const loadProfileData = async () => {
  if (!store.token) {
    orderCount.value = 0
    return
  }

  try {
    await Promise.all([
      store.getCurrentUser(),
      store.fetchConversations()
    ])

    const result = await store.fetchOrders({ page: 1, page_size: 1 })
    orderCount.value = result?.data?.total || result?.total || 0
  } catch (error) {
    console.error('Failed to load profile data:', error)
  }
}

onMounted(loadProfileData)
onShow(loadProfileData)
onHide(stopCountdown)

watch(() => store.token, (nextToken, prevToken) => {
  if (nextToken && nextToken !== prevToken) {
    loadProfileData()
  }
})

const sendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    store.showToast('请输入正确的手机号')
    return
  }

  try {
    await store.sendSmsCode(phone.value)
    store.showToast('验证码已发送')

    countdown.value = 60
    stopCountdown()
    countdownTimer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        countdown.value = 0
        stopCountdown()
      }
    }, 1000)
  } catch (error) {
    store.showToast(error.message || '发送验证码失败')
  }
}

const handleLogin = async () => {
  try {
    if (loginMode.value === 'sms') {
      if (!phone.value) {
        store.showToast('请输入手机号')
        return
      }

      if (!code.value) {
        store.showToast('请输入验证码')
        return
      }
      await store.login({ phone: phone.value, code: code.value })
    } else {
      if (!account.value) {
        store.showToast('请输入用户名')
        return
      }

      if (!password.value) {
        store.showToast('请输入密码')
        return
      }
      await store.login({ username: account.value, password: password.value })
    }

    if (!store.token) {
      throw new Error('登录状态未更新')
    }

    store.showToast('欢迎回来')
    await loadProfileData()
  } catch (error) {
    store.showToast(error.message || '登录失败')
  }
}

const handleLogout = async () => {
  try {
    await store.logout()
    store.showToast('已退出登录')
  } catch (error) {
    store.showToast('退出失败')
  }
}

const formatTime = (time) => {
  if (!time) {
    return ''
  }

  const date = new Date(time)
  const diff = Date.now() - date.getTime()

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return Math.floor(diff / (60 * 1000)) + ' 分钟前'
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / (60 * 60 * 1000)) + ' 小时前'
  if (diff < 7 * 24 * 60 * 60 * 1000) return Math.floor(diff / (24 * 60 * 60 * 1000)) + ' 天前'
  return date.toLocaleDateString()
}

const goToRegister = () => uni.navigateTo({ url: '/pages/profile/register' })
const goToEdit = () => uni.navigateTo({ url: '/pages/profile/edit' })
const goToCollections = () => uni.navigateTo({ url: '/pages/profile/collections' })
const goToFollowing = () => uni.navigateTo({ url: '/pages/profile/following' })
const goToOrders = (status = '') => {
  const query = status ? '?status=' + encodeURIComponent(status) : ''
  uni.navigateTo({ url: '/pages/profile/orders' + query })
}
const goToAddresses = () => uni.navigateTo({ url: '/pages/profile/addresses' })
const goToSettings = () => uni.navigateTo({ url: '/pages/profile/settings' })
const goToMyArtworks = () => uni.navigateTo({ url: '/pages/profile/artworks' })
const goToArtworkEditor = () => uni.navigateTo({ url: '/pages/profile/artwork-editor' })

const updateAvatar = () => {
  if (avatarUpdating.value) {
    return
  }

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths && res.tempFilePaths[0]
      let loadingVisible = false

      if (!filePath) {
        return
      }

      try {
        avatarUpdating.value = true
        uni.showLoading({ title: '保存中...', mask: true })
        loadingVisible = true

        const uploaded = await uploadImage(filePath, 'avatar')
        await store.updateUser({ avatar: uploaded.url })
        store.showToast('头像已更新')
      } catch (error) {
        store.showToast(error.message || '更新头像失败')
      } finally {
        avatarUpdating.value = false
        if (loadingVisible) {
          uni.hideLoading()
        }
      }
    }
  })
}

const openChat = (conv) => {
  uni.navigateTo({ url: '/pages/chat/index?id=' + conv.id })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f9f9f7;
}

.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 48rpx;
}

.login-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 40rpx;
  border-radius: 50%;
  background: #1a1a1a;
  color: #fff;
  font-size: 40rpx;
}

.login-title {
  margin-bottom: 12rpx;
  color: #1a1a1a;
  font-family: 'Playfair Display', serif;
  font-size: 56rpx;
  font-weight: 700;
}

.login-subtitle {
  margin-bottom: 64rpx;
  color: #8c8c8c;
  font-size: 26rpx;
}

.login-form {
  width: 100%;
}

.login-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.login-tab {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  color: #666;
  text-align: center;
  font-size: 26rpx;
}

.login-tab.active {
  background: #1a1a1a;
  color: #fff;
}

.input-shell {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  margin-bottom: 24rpx;
  padding: 0 30rpx;
  border: 2rpx solid transparent;
  border-radius: 24rpx;
  background: #f5f5f5;
  box-sizing: border-box;
}

.input-shell--code {
  flex: 1;
  min-width: 0;
  margin-bottom: 0;
}

.input-control {
  width: 100%;
  height: 96rpx;
  color: #1a1a1a;
  background: transparent;
  font-size: 30rpx;
  line-height: 96rpx;
}

.code-row {
  display: flex;
  align-items: stretch;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.code-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 220rpx;
  padding: 0 28rpx;
  border-radius: 24rpx;
  background: #1a1a1a;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.code-btn[disabled] {
  opacity: 0.5;
}

.submit-btn {
  width: 100%;
  margin-top: 32rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #c5a47e;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.register-link {
  margin-top: 32rpx;
  text-align: center;
}

.register-link text {
  color: #c5a47e;
  font-size: 26rpx;
}

.profile-view {
  padding: 0 32rpx 200rpx;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 80rpx 0 40rpx;
}

.profile-avatar {
  width: 140rpx;
  height: 140rpx;
  margin-right: 32rpx;
  border: 4rpx solid rgba(197, 164, 126, 0.3);
  border-radius: 50%;
  background: #ede7de;
}

.profile-info {
  flex: 1;
}

.profile-name {
  display: block;
  color: #1a1a1a;
  font-family: 'Playfair Display', serif;
  font-size: 44rpx;
  font-weight: 700;
}

.profile-badge {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.badge-text {
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  background: #1a1a1a;
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
}

.profile-id {
  color: #8c8c8c;
  font-size: 22rpx;
}

.profile-bio {
  display: block;
  margin-top: 8rpx;
  color: #666;
  font-size: 24rpx;
}

.edit-btn {
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  background: rgba(197, 164, 126, 0.1);
}

.edit-btn text {
  color: #c5a47e;
  font-size: 24rpx;
  font-weight: 700;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 32rpx 0;
  border-top: 1rpx solid #f0f0f0;
}

.stats-row .stat-item:nth-child(3) {
  display: none;
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  color: #1a1a1a;
  font-family: 'Playfair Display', serif;
  font-size: 36rpx;
  font-weight: 700;
}

.stat-label {
  display: block;
  margin-top: 4rpx;
  color: #8c8c8c;
  font-size: 20rpx;
}

.order-panel {
  margin-bottom: 32rpx;
  padding: 30rpx 28rpx 24rpx;
  border-radius: 32rpx;
  background: #fff;
}

.order-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.order-panel__title {
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 700;
}

.order-panel__more {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.order-panel__more-text,
.order-panel__more-arrow {
  color: #9a9289;
  font-size: 22rpx;
}

.order-shortcuts {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.order-shortcut {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.order-shortcut__icon {
  position: relative;
  width: 52rpx;
  height: 52rpx;
  color: #7f756a;
}

.order-shortcut__icon::before,
.order-shortcut__icon::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.order-shortcut__icon--wallet::before {
  left: 5rpx;
  top: 11rpx;
  width: 42rpx;
  height: 30rpx;
  border: 3rpx solid #7f756a;
  border-radius: 10rpx;
}

.order-shortcut__icon--wallet::after {
  right: 4rpx;
  top: 18rpx;
  width: 14rpx;
  height: 16rpx;
  border: 3rpx solid #f0a46f;
  border-left: none;
  border-radius: 0 8rpx 8rpx 0;
}

.order-shortcut__icon--box::before {
  left: 9rpx;
  top: 10rpx;
  width: 34rpx;
  height: 30rpx;
  border: 3rpx solid #7f756a;
  border-radius: 8rpx;
}

.order-shortcut__icon--box::after {
  left: 24rpx;
  top: 10rpx;
  width: 0;
  height: 30rpx;
  border-left: 3rpx solid #f0a46f;
  box-shadow: 0 12rpx 0 0 #f0a46f;
}

.order-shortcut__icon--truck::before {
  left: 4rpx;
  top: 18rpx;
  width: 26rpx;
  height: 18rpx;
  border: 3rpx solid #7f756a;
  border-radius: 6rpx;
}

.order-shortcut__icon--truck::after {
  left: 28rpx;
  top: 14rpx;
  width: 18rpx;
  height: 22rpx;
  border: 3rpx solid #f0a46f;
  border-radius: 6rpx;
  box-shadow:
    -16rpx 22rpx 0 -13rpx #7f756a,
    6rpx 22rpx 0 -13rpx #7f756a;
}

.order-shortcut__icon--clipboard::before {
  left: 10rpx;
  top: 8rpx;
  width: 32rpx;
  height: 38rpx;
  border: 3rpx solid #7f756a;
  border-radius: 8rpx;
}

.order-shortcut__icon--clipboard::after {
  left: 18rpx;
  top: 4rpx;
  width: 16rpx;
  height: 10rpx;
  border: 3rpx solid #f0a46f;
  border-bottom: none;
  border-radius: 8rpx 8rpx 0 0;
}

.order-shortcut__icon--return::before {
  left: 8rpx;
  top: 12rpx;
  width: 30rpx;
  height: 24rpx;
  border: 3rpx solid #7f756a;
  border-left: none;
  border-radius: 0 8rpx 8rpx 0;
}

.order-shortcut__icon--return::after {
  left: 6rpx;
  top: 16rpx;
  width: 22rpx;
  height: 0;
  border-top: 3rpx solid #f0a46f;
  box-shadow: 0 -8rpx 0 -1rpx transparent;
  transform: translateX(0);
}

.order-shortcut__label {
  color: #6f665d;
  font-size: 22rpx;
  line-height: 1.2;
}

.artist-studio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin: 12rpx 0 28rpx;
  padding: 30rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, rgba(29, 28, 24, 0.98) 0%, rgba(67, 57, 45, 0.94) 100%);
  box-shadow: 0 18rpx 44rpx rgba(17, 17, 17, 0.08);
}

.studio-copy {
  flex: 1;
}

.studio-kicker {
  display: block;
  color: rgba(255, 255, 255, 0.52);
  font-size: 18rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.studio-title {
  display: block;
  margin-top: 14rpx;
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 38rpx;
}

.studio-desc {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.68);
  font-size: 22rpx;
  line-height: 1.7;
}

.studio-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.studio-arrow text {
  color: #fff;
  font-size: 32rpx;
}

.messages-section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.section-title {
  color: #1a1a1a;
  font-family: 'Playfair Display', serif;
  font-size: 32rpx;
  font-weight: 700;
}

.unread-badge {
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
}

.message-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 28rpx;
  border-radius: 32rpx;
  background: #fff;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
}

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  margin-right: 24rpx;
  border-radius: 50%;
  background: #ede7de;
}

.message-info {
  flex: 1;
  overflow: hidden;
}

.message-name {
  display: block;
  color: #1a1a1a;
  font-size: 28rpx;
  font-weight: 700;
}

.message-preview {
  display: block;
  margin-top: 4rpx;
  overflow: hidden;
  color: #8c8c8c;
  font-size: 24rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.message-time {
  color: #8c8c8c;
  font-size: 20rpx;
}

.message-dot {
  min-width: 32rpx;
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  text-align: center;
}

.empty-message {
  padding: 48rpx;
  border: 2rpx dashed #e5e5e5;
  border-radius: 32rpx;
  background: #fff;
  text-align: center;
}

.empty-text {
  color: #8c8c8c;
  font-size: 26rpx;
}

.menu-section {
  margin-bottom: 32rpx;
  overflow: hidden;
  border-radius: 32rpx;
  background: #fff;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  position: relative;
  flex: 0 0 40rpx;
  width: 40rpx;
  height: 40rpx;
  margin-right: 24rpx;
}

.address-icon::before {
  content: '';
  position: absolute;
  left: 7rpx;
  top: 3rpx;
  width: 24rpx;
  height: 24rpx;
  box-sizing: border-box;
  border: 3rpx solid #8c8c8c;
  border-radius: 24rpx 24rpx 24rpx 0;
  transform: rotate(-45deg);
}

.address-icon::after {
  content: '';
  position: absolute;
  left: 15rpx;
  top: 11rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #8c8c8c;
}

.settings-icon::before {
  content: '';
  position: absolute;
  inset: 6rpx;
  box-sizing: border-box;
  border: 3rpx solid #8c8c8c;
  border-radius: 50%;
}

.settings-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #8c8c8c;
  transform: translate(-50%, -50%);
  box-shadow:
    0 -16rpx 0 -2rpx #8c8c8c,
    0 16rpx 0 -2rpx #8c8c8c,
    16rpx 0 0 -2rpx #8c8c8c,
    -16rpx 0 0 -2rpx #8c8c8c,
    11rpx 11rpx 0 -2rpx #8c8c8c,
    -11rpx -11rpx 0 -2rpx #8c8c8c,
    11rpx -11rpx 0 -2rpx #8c8c8c,
    -11rpx 11rpx 0 -2rpx #8c8c8c;
}

.menu-text {
  color: #1a1a1a;
  font-size: 28rpx;
}

.logout-btn {
  width: 100%;
  margin-top: 48rpx;
  background: transparent;
  color: #8c8c8c;
  font-size: 24rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
}

.artist-fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(168rpx + env(safe-area-inset-bottom));
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d1c18 0%, #43392d 100%);
  box-shadow: 0 18rpx 48rpx rgba(17, 17, 17, 0.2);
}

.artist-fab-icon {
  color: #fff;
  font-size: 56rpx;
  font-weight: 300;
  line-height: 1;
}
</style>
