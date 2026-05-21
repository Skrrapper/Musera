<template>
  <view class="register-page">
    <view class="hero">
      <view class="nav">
        <view class="back" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="nav-title">注册</text>
        <view class="nav-placeholder" />
      </view>

      <view class="hero-copy">
        <text class="eyebrow">MUSE 会员</text>
        <text class="title">创建你的账号</text>
        <text class="subtitle">使用手机号即可快速注册。</text>
      </view>
    </view>

    <view class="panel">
      <view class="field">
        <text class="label">用户名</text>
        <input
          v-model.trim="form.username"
          class="input"
          placeholder="怎么称呼你"
          maxlength="50"
        />
      </view>

      <view class="field">
        <text class="label">手机号</text>
        <input
          v-model.trim="form.phone"
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入 11 位手机号"
        />
      </view>

      <view class="field">
        <text class="label">验证码</text>
        <view class="code-row">
          <input
            v-model.trim="form.code"
            class="input code-input"
            type="number"
            maxlength="6"
            placeholder="请输入 6 位验证码"
          />
          <button class="code-btn" :disabled="countdown > 0 || sendingCode" @click="sendCode">
            {{ countdown > 0 ? `${countdown}s` : sendingCode ? '发送中' : '获取验证码' }}
          </button>
        </view>
      </view>

      <view class="field">
        <text class="label">密码</text>
        <input
          v-model="form.password"
          class="input"
          password
          placeholder="至少 6 位密码"
          maxlength="100"
        />
      </view>

      <view class="field">
        <text class="label">确认密码</text>
        <input
          v-model="form.confirmPassword"
          class="input"
          password
          placeholder="再次输入密码"
          maxlength="100"
        />
      </view>

      <button class="submit-btn" :disabled="submitting" @click="submit">
        {{ submitting ? '注册中...' : '注册' }}
      </button>

      <view class="footnote">
        <text class="footnote-text">已有账号？</text>
        <text class="footnote-link" @click="goBack"> 返回登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import { useAppStore } from '../../store/index'

const store = useAppStore()

const form = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const countdown = ref(0)
const sendingCode = ref(false)
const submitting = ref(false)
let countdownTimer = null

const goBack = () => {
  uni.navigateBack()
}

const startCountdown = () => {
  countdown.value = 60
  clearCountdown()
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearCountdown()
    }
  }, 1000)
}

const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const validatePhone = (phone) => /^1\d{10}$/.test(phone)

const sendCode = async () => {
  if (!validatePhone(form.phone)) {
    store.showToast('请输入正确的手机号')
    return
  }

  try {
    sendingCode.value = true
    await store.sendSmsCode(form.phone, 'register')
    store.showToast('验证码已发送')
    startCountdown()
  } catch (error) {
    store.showToast(error.message || '发送验证码失败')
  } finally {
    sendingCode.value = false
  }
}

const submit = async () => {
  if (!form.username || form.username.length < 3) {
    store.showToast('用户名至少 3 个字符')
    return
  }

  if (!validatePhone(form.phone)) {
    store.showToast('请输入正确的手机号')
    return
  }

  if (!/^\d{6}$/.test(form.code)) {
    store.showToast('请输入 6 位验证码')
    return
  }

  if (!form.password || form.password.length < 6) {
    store.showToast('密码至少 6 位')
    return
  }

  if (form.password !== form.confirmPassword) {
    store.showToast('两次输入的密码不一致')
    return
  }

  try {
    submitting.value = true
    await store.register({
      username: form.username,
      phone: form.phone,
      code: form.code,
      password: form.password
    })

    store.showToast('注册成功')

    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    store.showToast(error.message || '注册失败')
  } finally {
    submitting.value = false
  }
}

onUnload(clearCountdown)
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  padding: 0 28rpx 48rpx;
  background:
    radial-gradient(circle at top left, rgba(197, 164, 126, 0.18), transparent 36%),
    linear-gradient(180deg, #f8f6f1 0%, #f4f1ea 44%, #f7f7f4 100%);
}

.hero {
  padding: calc(88rpx + env(safe-area-inset-top)) 8rpx 36rpx;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back,
.nav-placeholder {
  width: 72rpx;
  height: 72rpx;
}

.back {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12rpx 32rpx rgba(30, 24, 15, 0.05);
}

.back-icon {
  font-size: 44rpx;
  color: #1d1c18;
  line-height: 1;
}

.nav-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d1c18;
  letter-spacing: 1rpx;
}

.hero-copy {
  margin-top: 52rpx;
}

.eyebrow {
  display: block;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  color: rgba(111, 95, 69, 0.72);
}

.title {
  display: block;
  margin-top: 18rpx;
  font-family: 'Playfair Display', serif;
  font-size: 66rpx;
  line-height: 1.08;
  color: #171612;
}

.subtitle {
  display: block;
  margin-top: 18rpx;
  font-size: 26rpx;
  line-height: 1.65;
  color: #6c675d;
}

.panel {
  padding: 36rpx 30rpx 34rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14rpx);
  box-shadow: 0 24rpx 56rpx rgba(30, 24, 15, 0.08);
}

.field + .field {
  margin-top: 24rpx;
}

.label {
  display: block;
  margin-bottom: 14rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #312d26;
  letter-spacing: 1rpx;
}

.input {
  width: 100%;
  min-height: 96rpx;
  padding: 0 28rpx;
  border-radius: 24rpx;
  background: #f6f4ee;
  border: 1rpx solid rgba(168, 150, 117, 0.18);
  font-size: 28rpx;
  color: #171612;
  box-sizing: border-box;
}

.code-row {
  display: flex;
  align-items: stretch;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 196rpx;
  min-height: 96rpx;
  border-radius: 24rpx;
  background: #1f1d19;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.code-btn[disabled] {
  opacity: 0.56;
}

.submit-btn {
  margin-top: 36rpx;
  width: 100%;
  min-height: 104rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #1f1d19 0%, #40392f 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  box-shadow: 0 18rpx 36rpx rgba(31, 29, 25, 0.14);
}

.submit-btn[disabled] {
  opacity: 0.6;
}

.footnote {
  margin-top: 28rpx;
  text-align: center;
}

.footnote-text {
  font-size: 24rpx;
  color: #7b756b;
}

.footnote-link {
  font-size: 24rpx;
  font-weight: 600;
  color: #1f1d19;
}
</style>
