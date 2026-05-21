<template>
  <view class="page">
    <view class="header">
      <view class="back-btn" @click="goBack"><text>‹</text></view>
      <view class="header-copy">
        <text class="title">我的订单</text>
        <text v-if="activeStatusLabel" class="subtitle">{{ activeStatusLabel }}</text>
      </view>
    </view>

    <view class="status-strip">
      <view
        v-for="item in statusTabs"
        :key="item.key"
        class="status-chip"
        :class="{ 'status-chip--active': activeStatus === item.key }"
        @click="switchStatus(item.key)"
      >
        <text>{{ item.label }}</text>
      </view>
    </view>

    <view class="empty" v-if="filteredOrders.length === 0">
      <text class="empty-text">{{ activeStatus ? '暂无相关订单' : '暂无订单' }}</text>
    </view>

    <view class="list" v-else>
      <view class="item" v-for="order in filteredOrders" :key="order.id" @click="goToDetail(order)">
        <image class="img" :src="getOrderImage(order)" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ order.artwork && order.artwork.title || '未命名作品' }}</text>
          <text class="price">¥{{ order.total_amount || order.amount || 0 }}</text>
          <text class="status" :class="'status--' + normalizeStatus(order)">{{ getStatusText(normalizeStatus(order)) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '../../store/index'
import { resolveAssetUrl } from '../../utils/assets'

const store = useAppStore()
const orders = ref([])
const activeStatus = ref('')

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipped', label: '待收货' },
  { key: 'completed', label: '已完成' },
  { key: 'aftersale', label: '售后' }
]

const activeStatusLabel = computed(() => {
  return statusTabs.find(item => item.key === activeStatus.value)?.label || ''
})

const normalizeStatus = (order) => {
  const rawStatus = order?.status || ''
  if (rawStatus === 'aftersale' || rawStatus === 'refund') {
    return 'aftersale'
  }

  if (order?.aftersale_status || order?.refund_status || order?.service_status) {
    return 'aftersale'
  }

  return rawStatus
}

const matchesStatus = (order, status) => {
  if (!status) {
    return true
  }

  return normalizeStatus(order) === status
}

const filteredOrders = computed(() => {
  return orders.value.filter(order => matchesStatus(order, activeStatus.value))
})

const getStatusText = (status) => {
  const map = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    aftersale: '售后'
  }
  return map[status] || status || '订单处理中'
}

const getOrderImage = (order) => {
  return resolveAssetUrl(order?.artwork?.cover_image || order?.artwork?.images?.[0] || '')
}

const loadOrders = async () => {
  try {
    const result = await store.fetchOrders()
    orders.value = result?.data?.items || result?.items || []
  } catch (error) {
    console.error('Failed to load orders:', error)
    orders.value = []
  }
}

const switchStatus = (status) => {
  activeStatus.value = status
}

const goBack = () => uni.navigateBack()
const goToDetail = (order) => uni.navigateTo({ url: '/pages/order/detail?id=' + order.id })

onLoad(async (options = {}) => {
  activeStatus.value = options.status || ''
  await loadOrders()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f4ef;
}

.header {
  display: flex;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 28rpx) 32rpx 24rpx;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.82);
  color: #40352b;
  font-size: 42rpx;
}

.header-copy {
  margin-left: 18rpx;
}

.title {
  display: block;
  color: #201a15;
  font-size: 36rpx;
  font-weight: 700;
}

.subtitle {
  display: block;
  margin-top: 6rpx;
  color: #8d8278;
  font-size: 22rpx;
}

.status-strip {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 18rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.84);
  color: #756a60;
  font-size: 22rpx;
}

.status-chip--active {
  background: #1f1a16;
  color: #fff9f1;
}

.empty {
  padding: 120rpx 48rpx;
  text-align: center;
}

.empty-text {
  color: #8c8379;
  font-size: 26rpx;
}

.list {
  padding: 12rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx);
}

.item {
  display: flex;
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.92);
}

.img {
  width: 132rpx;
  height: 132rpx;
  border-radius: 20rpx;
  background: #ece5dc;
}

.info {
  flex: 1;
  margin-left: 24rpx;
}

.name {
  display: block;
  color: #1d1814;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.45;
}

.price {
  display: block;
  margin-top: 10rpx;
  color: #9c7b57;
  font-size: 26rpx;
  font-weight: 600;
}

.status {
  display: inline-flex;
  margin-top: 14rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #f1ede7;
  color: #6f655b;
  font-size: 22rpx;
}

.status--paid {
  background: #e9f2ff;
  color: #3f79d8;
}

.status--shipped {
  background: #fff2e6;
  color: #c47b37;
}

.status--completed {
  background: #ebf7ee;
  color: #3d9461;
}

.status--cancelled,
.status--aftersale {
  background: #fff0ef;
  color: #c9645f;
}
</style>
