<template>
  <view class="chat-page">
    <view class="chat-header">
      <text class="chat-title">{{ chatWith }}</text>
      <view class="online-status">
        <view class="online-dot"></view>
        <text class="online-text">在线</text>
      </view>
    </view>

    <scroll-view class="message-list" scroll-y :scroll-top="scrollTop">
      <view class="date-divider">
        <text>今天</text>
      </view>

      <view class="message" :class="{ 'is-mine': msg.isMine }" v-for="msg in messages" :key="msg.id">
        <view class="message-bubble">
          <text class="message-text">{{ msg.text }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="input-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <input class="chat-input" v-model="inputText" placeholder="发送消息" @confirm="sendMessage" />
      <view class="send-btn" @click="sendMessage">
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const chatWith = ref('艺术家')
const inputText = ref('')
const scrollTop = ref(0)
const safeAreaBottom = ref(0)

const messages = ref([
  { id: 1, text: '你好，这件作品现在还能购买吗？', isMine: true },
  { id: 2, text: '可以的，需要我为你保留吗？', isMine: false }
])

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  chatWith.value = currentPage.options?.artist || '艺术家'
  const systemInfo = uni.getSystemInfoSync()
  safeAreaBottom.value = systemInfo.safeAreaInsets?.bottom || 0
  scrollToBottom()
})

const sendMessage = () => {
  if (!inputText.value.trim()) return
  messages.value.push({ id: Date.now(), text: inputText.value, isMine: true })
  inputText.value = ''
  scrollToBottom()
  setTimeout(() => {
    messages.value.push({ id: Date.now() + 1, text: '收到，我稍后回复你。', isMine: false })
    scrollToBottom()
  }, 1000)
}

const scrollToBottom = () => {
  nextTick(() => { scrollTop.value = 999999 })
}
</script>

<style lang="scss" scoped>
.chat-page { display: flex; flex-direction: column; height: 100vh; background: #f5f5f5; }
.chat-header { background: #fff; padding: 20rpx 32rpx; text-align: center; border-bottom: 1rpx solid #e5e5e5; }
.chat-title { font-size: 32rpx; font-weight: bold; color: #1a1a1a; }
.online-status { display: flex; align-items: center; justify-content: center; margin-top: 4rpx; }
.online-dot { width: 12rpx; height: 12rpx; background: #52c41a; border-radius: 50%; margin-right: 8rpx; }
.online-text { font-size: 20rpx; color: #8c8c8c; }
.message-list { flex: 1; padding: 32rpx; }
.date-divider { text-align: center; margin: 24rpx 0; }
.date-divider text { font-size: 22rpx; color: #8c8c8c; font-weight: bold; }
.message { margin-bottom: 24rpx; }
.message.is-mine { display: flex; justify-content: flex-end; }
.message.is-mine .message-bubble { background: #1a1a1a; }
.message.is-mine .message-text { color: #fff; }
.message-bubble { max-width: 70%; padding: 20rpx 28rpx; background: #fff; border-radius: 24rpx; }
.message-text { font-size: 28rpx; color: #333; line-height: 1.5; }
.input-bar { display: flex; align-items: center; padding: 16rpx 24rpx; background: #fff; border-top: 1rpx solid #e5e5e5; }
.chat-input { flex: 1; background: #f5f5f5; border-radius: 48rpx; padding: 20rpx 32rpx; font-size: 28rpx; }
.send-btn { min-width: 96rpx; height: 64rpx; background: #1a1a1a; border-radius: 32rpx; display: flex; align-items: center; justify-content: center; margin-left: 16rpx; padding: 0 18rpx; }
.send-btn text { color: #fff; font-size: 24rpx; }
</style>
