<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack"><text>←</text></view>
      <text class="title">确认订单</text>
    </view>

    <view class="section">
      <text class="section-title">作品信息</text>
      <view v-if="artwork" class="artwork-info">
        <image class="artwork-img" :src="artwork.cover_image" mode="aspectFill" />
        <view class="artwork-detail">
          <text class="artwork-name">{{ artwork.title }}</text>
          <text class="artwork-artist">{{ artwork.artist && artwork.artist.username }}</text>
          <text class="artwork-price">¥{{ artwork.price }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">收货地址</text>
      <view class="address-select" @click="selectAddress">
        <view v-if="selectedAddress" class="address-info">
          <text class="address-name">{{ selectedAddress.name }} {{ selectedAddress.phone }}</text>
          <text class="address-detail">{{ formatAddress(selectedAddress) }}</text>
        </view>
        <text v-else class="placeholder">请选择地址</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">备注</text>
      <textarea v-model="remarks" class="remarks" placeholder="添加备注（选填）" />
    </view>

    <view class="footer">
      <text class="total">合计：¥{{ total }}</text>
      <button class="submit-btn" @click="submitOrder">提交订单</button>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAppStore } from '../../store/index'

const store = useAppStore()
const artwork = ref(null)
const selectedAddress = ref(null)
const remarks = ref('')
const artworkId = ref(null)

const goBack = () => uni.navigateBack()
const total = computed(() => (artwork.value && artwork.value.price) || 0)

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

const formatAddress = (addr) => [addr.province, addr.city, addr.district, addr.address].filter(Boolean).join('')

const selectAddress = () => uni.navigateTo({ url: '/pages/profile/addresses?select=1' })

const submitOrder = async () => {
  if (!selectedAddress.value) {
    store.showToast('请选择地址')
    return
  }

  if (!artworkId.value) {
    store.showToast('作品信息缺失')
    return
  }

  try {
    await store.createOrder({
      address_id: selectedAddress.value.id,
      artworks: [
        {
          artwork_id: artworkId.value,
          quantity: 1
        }
      ],
      remark: remarks.value
    })
    store.showToast('订单已提交')
    uni.redirectTo({ url: '/pages/profile/orders' })
  } catch (error) {
    store.showToast(error.message || '提交订单失败')
  }
}

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  artworkId.value = currentPage.options && currentPage.options.artwork_id

  if (artworkId.value) {
    try {
      const result = await store.fetchArtworkById(parseInt(artworkId.value, 10))
      artwork.value = result
    } catch (error) {
      console.error('Failed to load artwork:', error)
    }
  }
})

onShow(() => {
  const nextAddress = uni.getStorageSync('selectedAddress')
  if (nextAddress && nextAddress.id) {
    selectedAddress.value = normalizeAddress(nextAddress)
    uni.removeStorageSync('selectedAddress')
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f9f9f7;
  padding-bottom: 200rpx;
}

.header {
  display: flex;
  align-items: center;
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
  margin-left: 16rpx;
  color: #1a1a1a;
  font-size: 36rpx;
  font-weight: 700;
}

.section {
  padding: 24rpx 32rpx;
}

.section-title {
  display: block;
  margin-bottom: 16rpx;
  color: #8c8c8c;
  font-size: 28rpx;
}

.artwork-info {
  display: flex;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff;
}

.artwork-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
}

.artwork-detail {
  flex: 1;
  margin-left: 24rpx;
}

.artwork-name {
  display: block;
  color: #1a1a1a;
  font-size: 28rpx;
  font-weight: 700;
}

.artwork-artist {
  display: block;
  margin-top: 4rpx;
  color: #666;
  font-size: 24rpx;
}

.artwork-price {
  display: block;
  margin-top: 8rpx;
  color: #c5a47e;
  font-size: 26rpx;
}

.address-select {
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.address-name {
  color: #1a1a1a;
  font-size: 28rpx;
  font-weight: 700;
}

.address-detail {
  color: #666;
  font-size: 24rpx;
  line-height: 1.7;
}

.placeholder {
  color: #8c8c8c;
  font-size: 26rpx;
}

.remarks {
  width: 100%;
  height: 160rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff;
  box-sizing: border-box;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.total {
  color: #1a1a1a;
  font-size: 32rpx;
  font-weight: 700;
}

.submit-btn {
  border-radius: 32rpx;
  background: #c5a47e;
  color: #fff;
  font-weight: 700;
}
</style>
