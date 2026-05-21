<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack"><text>←</text></view>
      <text class="title">{{ isEdit ? '编辑地址' : '新增地址' }}</text>
      <view class="placeholder"></view>
    </view>

    <view class="form">
      <view class="field">
        <text class="label">收货人</text>
        <input v-model.trim="form.name" class="input" placeholder="请输入收货人姓名" />
      </view>

      <view class="field">
        <text class="label">手机号</text>
        <input
          v-model.trim="form.phone"
          class="input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
        />
      </view>

      <view class="field">
        <text class="label">省份</text>
        <input v-model.trim="form.province" class="input" placeholder="请输入省份" />
      </view>

      <view class="field">
        <text class="label">城市</text>
        <input v-model.trim="form.city" class="input" placeholder="请输入城市" />
      </view>

      <view class="field">
        <text class="label">区县</text>
        <input v-model.trim="form.district" class="input" placeholder="请输入区县" />
      </view>

      <view class="field">
        <text class="label">详细地址</text>
        <textarea
          v-model.trim="form.address"
          class="textarea"
          maxlength="200"
          placeholder="请输入详细地址"
        />
      </view>

      <view class="default-row" @click="form.is_default = !form.is_default">
        <text class="default-label">设为默认地址</text>
        <view :class="['switch', { 'switch--active': form.is_default }]">
          <view class="switch-dot"></view>
        </view>
      </view>
    </view>

    <view class="footer">
      <button class="submit-btn" :disabled="submitting" @click="submit">
        {{ submitting ? '保存中...' : isEdit ? '保存修改' : '新增地址' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '../../store/index'

const store = useAppStore()
const addressId = ref('')
const submitting = ref(false)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  is_default: false
})

const isEdit = computed(() => !!addressId.value)

const fillForm = (addr = {}) => {
  form.name = addr.name || addr.receiver_name || ''
  form.phone = addr.phone || addr.receiver_phone || ''
  form.province = addr.province || ''
  form.city = addr.city || ''
  form.district = addr.district || ''
  form.address = addr.address || addr.detail_address || ''
  form.is_default = !!addr.is_default
}

const loadAddress = async () => {
  if (!addressId.value) {
    return
  }

  try {
    const result = await store.fetchAddresses()
    const list = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.items)
        ? result.data.items
        : []
    const current = list.find((item) => String(item.id) === String(addressId.value))
    if (current) {
      fillForm(current)
    }
  } catch (error) {
    store.showToast(error.message || '加载地址失败')
  }
}

const validatePhone = (phone) => /^1\d{10}$/.test(phone)

const goBack = () => uni.navigateBack()

const submit = async () => {
  if (!form.name) {
    store.showToast('请输入收货人姓名')
    return
  }

  if (!validatePhone(form.phone)) {
    store.showToast('请输入正确的手机号')
    return
  }

  if (!form.province || !form.city || !form.district || !form.address) {
    store.showToast('请完整填写地址信息')
    return
  }

  try {
    submitting.value = true

    const payload = {
      name: form.name,
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      address: form.address,
      is_default: form.is_default
    }

    if (isEdit.value) {
      await store.updateAddress(addressId.value, payload)
      store.showToast('地址已更新')
    } else {
      await store.createAddress(payload)
      store.showToast('地址已新增')
    }

    uni.navigateBack()
  } catch (error) {
    store.showToast(error.message || '保存地址失败')
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  addressId.value = options && options.id ? String(options.id) : ''
  loadAddress()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f9f9f7;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48rpx 32rpx;
}

.back-btn,
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  color: #1a1a1a;
  font-size: 34rpx;
}

.title {
  color: #1a1a1a;
  font-size: 36rpx;
  font-weight: 700;
}

.form {
  padding: 0 32rpx;
}

.field {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  color: #666;
  font-size: 24rpx;
}

.input,
.textarea {
  width: 100%;
  padding: 28rpx 30rpx;
  border-radius: 24rpx;
  background: #fff;
  box-sizing: border-box;
  color: #1a1a1a;
  font-size: 28rpx;
}

.textarea {
  min-height: 180rpx;
}

.default-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
  padding: 24rpx 8rpx;
}

.default-label {
  color: #1a1a1a;
  font-size: 28rpx;
}

.switch {
  display: flex;
  align-items: center;
  width: 90rpx;
  height: 52rpx;
  padding: 4rpx;
  border-radius: 999rpx;
  background: #d9d9d9;
  transition: background-color 0.25s ease;
  box-sizing: border-box;
}

.switch--active {
  background: #c5a47e;
}

.switch-dot {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.25s ease;
}

.switch--active .switch-dot {
  transform: translateX(38rpx);
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #f9f9f7;
}

.submit-btn {
  width: 100%;
  border-radius: 32rpx;
  background: #c5a47e;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}
</style>
