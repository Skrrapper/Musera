<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack"><text>←</text></view>
      <text class="title">地址</text>
      <view class="add-btn" @click="goToAdd"><text>新增</text></view>
    </view>

    <view v-if="addresses.length === 0" class="empty">
      <text class="empty-text">暂无地址</text>
    </view>

    <view v-else class="list">
      <view v-for="addr in addresses" :key="addr.id" class="item">
        <view class="info" @click="selectAddress(addr)">
          <view class="name-row">
            <text class="name">{{ addr.name }}</text>
            <text class="phone">{{ addr.phone }}</text>
          </view>
          <text class="addr">{{ fullAddress(addr) }}</text>
          <text v-if="addr.is_default" class="default-tag">默认</text>
        </view>

        <view class="actions">
          <text class="action" @click="editAddress(addr)">编辑</text>
          <text class="action delete" @click="deleteAddr(addr)">删除</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAppStore } from '../../store/index'

const store = useAppStore()
const addresses = ref([])
const selectMode = ref(false)

const normalizeAddress = (addr = {}) => ({
  id: addr.id,
  name: addr.name || addr.receiver_name || '',
  phone: addr.phone || addr.receiver_phone || '',
  province: addr.province || '',
  city: addr.city || '',
  district: addr.district || '',
  address: addr.address || addr.detail_address || '',
  is_default: !!addr.is_default
})

const extractAddressList = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeAddress)
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items.map(normalizeAddress)
  }

  return []
}

const loadAddresses = async () => {
  try {
    const result = await store.fetchAddresses()
    addresses.value = extractAddressList(result && result.data)
  } catch (error) {
    console.error('Failed to load addresses:', error)
    store.showToast(error.message || '加载地址失败')
  }
}

const fullAddress = (addr) => [addr.province, addr.city, addr.district, addr.address].filter(Boolean).join('')

const goBack = () => uni.navigateBack()
const goToAdd = () => uni.navigateTo({ url: '/pages/address/edit' })

const selectAddress = (addr) => {
  if (!selectMode.value) {
    return
  }

  uni.setStorageSync('selectedAddress', addr)
  uni.navigateBack()
}

const editAddress = (addr) => {
  uni.navigateTo({ url: '/pages/address/edit?id=' + addr.id })
}

const deleteAddr = (addr) => {
  uni.showModal({
    title: '删除地址',
    content: '确认删除这个地址吗？',
    success: async (res) => {
      if (!res.confirm) {
        return
      }

      try {
        await store.deleteAddress(addr.id)
        addresses.value = addresses.value.filter((item) => item.id !== addr.id)
        store.showToast('地址已删除')
      } catch (error) {
        store.showToast(error.message || '删除地址失败')
      }
    }
  })
}

onLoad((options) => {
  selectMode.value = options && String(options.select) === '1'
})

onShow(loadAddresses)
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f9f9f7;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48rpx 32rpx;
}

.back-btn {
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

.add-btn {
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  background: #c5a47e;
}

.add-btn text {
  color: #fff;
  font-size: 24rpx;
}

.empty {
  padding: 100rpx;
  text-align: center;
}

.empty-text {
  color: #8c8c8c;
  font-size: 26rpx;
}

.list {
  padding: 24rpx;
}

.item {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.name {
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 700;
}

.phone {
  color: #666;
  font-size: 24rpx;
}

.addr {
  color: #666;
  font-size: 24rpx;
  line-height: 1.7;
}

.default-tag {
  align-self: flex-start;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #c5a47e;
  color: #fff;
  font-size: 20rpx;
}

.actions {
  display: flex;
  gap: 24rpx;
  margin-top: 18rpx;
}

.action {
  color: #666;
  font-size: 24rpx;
}

.action.delete {
  color: #ff4d4f;
}
</style>
