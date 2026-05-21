<template>
  <view class="edit-page">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">编辑资料</text>
      <view class="save-btn" @click="saveProfile">
        <text>保存</text>
      </view>
    </view>

    <view class="avatar-section" @click="changeAvatar">
      <AppAvatar class="avatar" :src="userAvatar" :cache-key="store.avatarVersion" />
      <text class="avatar-tip">轻点更换头像</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="label">用户名</text>
        <input class="input" v-model="form.username" placeholder="请输入用户名" />
      </view>

      <view class="form-item">
        <text class="label">简介</text>
        <textarea class="textarea" v-model="form.bio" maxlength="200" placeholder="介绍一下自己" />
      </view>

      <view class="form-item">
        <text class="label">邮箱</text>
        <input class="input" v-model="form.email" type="email" placeholder="请输入邮箱" />
      </view>

      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" v-model="form.phone" type="number" placeholder="请输入手机号" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../../store/index'
import { uploadImage } from '../../utils/api/upload'
import { resolveUserAvatar } from '../../utils/assets'
import AppAvatar from '../../components/AppAvatar.vue'

const store = useAppStore()

const form = ref({
  username: '',
  bio: '',
  email: '',
  phone: '',
  avatar: ''
})
const savingProfile = ref(false)

const userAvatar = computed(() => resolveUserAvatar(form.value.avatar || store.user && store.user.avatar))

onMounted(() => {
  if (!store.user) {
    return
  }

  form.value.username = store.user.username || ''
  form.value.bio = store.user.bio || ''
  form.value.email = store.user.email || ''
  form.value.phone = store.user.phone || ''
  form.value.avatar = store.user.avatar || ''
})

const goBack = () => {
  uni.navigateBack()
}

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const filePath = res.tempFilePaths && res.tempFilePaths[0]
      if (filePath) {
        form.value.avatar = filePath
      }
    }
  })
}

const isRemoteAvatar = (value) => {
  return typeof value === 'string' && (/^(https?:)?\/\//i.test(value) || value.startsWith('/'))
}

const saveProfile = async () => {
  if (savingProfile.value) {
    return
  }

  if (!form.value.username) {
    store.showToast('请输入用户名')
    return
  }

  let loadingVisible = false

  try {
    savingProfile.value = true
    uni.showLoading({ title: '保存中...', mask: true })
    loadingVisible = true

    let avatar = form.value.avatar || store.user && store.user.avatar || ''
    if (avatar && !isRemoteAvatar(avatar)) {
      const uploaded = await uploadImage(avatar, 'avatar')
      avatar = uploaded.url
    }

    await store.updateUser({
      username: form.value.username,
      bio: form.value.bio,
      email: form.value.email,
      phone: form.value.phone,
      avatar: avatar || undefined
    })

    form.value.avatar = store.user && store.user.avatar || avatar || ''
    store.showToast('已保存')
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (error) {
    store.showToast(error.message || '保存失败')
  } finally {
    savingProfile.value = false
    if (loadingVisible) {
      uni.hideLoading()
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-page { min-height: 100vh; background-color: #f9f9f7; padding-bottom: 100rpx; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 48rpx 32rpx; }
.back-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 36rpx; color: #1a1a1a; }
.title { font-family: 'Playfair Display', serif; font-size: 36rpx; font-weight: bold; color: #1a1a1a; }
.save-btn { padding: 16rpx 32rpx; background: #c5a47e; border-radius: 24rpx; }
.save-btn text { font-size: 26rpx; color: #fff; font-weight: bold; }
.avatar-section { display: flex; flex-direction: column; align-items: center; padding: 48rpx 0; }
.avatar { width: 160rpx; height: 160rpx; border-radius: 50%; border: 4rpx solid rgba(197, 164, 126, 0.3); background: #ede7de; }
.avatar-tip { font-size: 24rpx; color: #8c8c8c; margin-top: 16rpx; }
.form-section { padding: 0 32rpx; }
.form-item { background: #fff; border-radius: 24rpx; padding: 32rpx; margin-bottom: 24rpx; }
.label { display: block; font-size: 24rpx; color: #8c8c8c; margin-bottom: 16rpx; }
.input { width: 100%; font-size: 30rpx; color: #1a1a1a; }
.textarea { width: 100%; height: 160rpx; font-size: 30rpx; color: #1a1a1a; }
</style>
