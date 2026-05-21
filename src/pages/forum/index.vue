<template>
  <view class="forum-page">
    <view class="hero">
      <view>
        <text class="title">社区</text>
        <text class="subtitle">分享你对作品的感受。</text>
      </view>
      <button class="hero-btn" @click="openComposer">发布</button>
    </view>

    <view class="sort-tabs">
      <view
        class="sort-tab"
        :class="{ active: sort === 'latest' }"
        @click="changeSort('latest')"
      >
        <text>最新</text>
      </view>
      <view
        class="sort-tab"
        :class="{ active: sort === 'popular' }"
        @click="changeSort('popular')"
      >
        <text>热门</text>
      </view>
    </view>

    <view class="status-card" v-if="loadError">
      <text class="status-title">社区暂不可用</text>
      <text class="status-desc">{{ loadError }}</text>
      <button class="status-btn" @click="loadPosts">重试</button>
    </view>

    <view class="status-card muted" v-else-if="loading && posts.length === 0">
      <text class="status-title">正在载入内容</text>
      <text class="status-desc">正在获取最新动态。</text>
    </view>

    <view class="post-list" v-if="posts.length > 0">
      <view class="post-card" v-for="post in posts" :key="post.id">
        <view class="post-header">
          <view class="post-user">
            <AppAvatar class="post-avatar" :src="post.user.avatar" />
            <view class="post-meta">
              <text class="post-name">{{ post.user.username }}</text>
              <text class="post-time">{{ formatTime(post.created_at) }}</text>
            </view>
          </view>
        </view>

        <view class="post-artwork" v-if="post.artwork">
          <image class="artwork-cover" :src="post.artwork.cover_image" mode="aspectFill" />
          <view class="artwork-copy">
            <text class="artwork-label">关联作品</text>
            <text class="artwork-title">{{ post.artwork.title }}</text>
          </view>
        </view>

        <text class="post-title" v-if="post.title">{{ post.title }}</text>
        <text class="post-content">{{ post.content }}</text>

        <view class="post-images" v-if="post.images.length > 0">
          <image
            class="post-image"
            v-for="image in post.images"
            :key="image"
            :src="image"
            mode="aspectFill"
            @click="previewImages(post.images, image)"
          />
        </view>

        <view class="post-actions">
          <view class="action-item" @click="toggleLike(post)">
            <text class="action-icon">{{ post.is_liked ? '已赞' : '点赞' }}</text>
            <text class="action-text">{{ post.like_count }}</text>
          </view>
          <view class="action-item" @click="showCommentHint">
            <text class="action-icon">评论</text>
            <text class="action-text">{{ post.comment_count }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="status-card muted" v-else-if="!loading">
      <text class="status-title">还没有内容</text>
      <text class="status-desc">来发布第一条分享吧。</text>
    </view>

    <view class="composer-mask" v-if="editorOpen" @click="closeComposer"></view>
    <view class="composer-panel" v-if="editorOpen">
      <view class="composer-head">
        <view>
          <text class="composer-title">发布内容</text>
          <text class="composer-subtitle">简短直接，也可以配图。</text>
        </view>
        <text class="composer-close" @click="closeComposer">×</text>
      </view>

      <input
        class="composer-input"
        v-model="editorTitle"
        maxlength="60"
        placeholder="标题（选填）"
      />

      <textarea
        class="composer-textarea"
        v-model="editorContent"
        maxlength="1000"
        auto-height
        placeholder="说说你对这件作品的感受"
      />

      <view class="composer-tools">
        <view
          class="tool-chip"
          :class="{ active: showArtworkField }"
          @click="toggleArtworkField"
        >
          <text>关联作品</text>
        </view>
        <view class="tool-chip" @click="chooseImages">
          <text>添加图片</text>
        </view>
        <text class="tool-count">{{ editorContent.length }}/1000</text>
      </view>

      <view v-if="showArtworkField" class="artwork-picker">
        <input
          class="composer-input small"
          :value="editorArtworkKeyword"
          placeholder="输入作品名称进行搜索"
          @input="handleArtworkKeywordInput"
        />

        <view class="selected-artwork" v-if="selectedArtwork">
          <text class="selected-artwork__label">已关联</text>
          <text class="selected-artwork__title">{{ selectedArtwork.title }}</text>
        </view>

        <view
          class="artwork-suggestion-card"
          v-if="artworkSearching || artworkSuggestions.length > 0 || (editorArtworkKeyword.trim() && !selectedArtwork)"
        >
          <view class="artwork-suggestion-state" v-if="artworkSearching">
            <text>正在搜索作品…</text>
          </view>
          <view
            v-else-if="artworkSuggestions.length > 0"
            class="artwork-suggestion-item"
            v-for="artwork in artworkSuggestions"
            :key="artwork.id"
            @click="selectArtwork(artwork)"
          >
            <image
              v-if="artwork.cover_image"
              class="artwork-suggestion-cover"
              :src="artwork.cover_image"
              mode="aspectFill"
            />
            <view class="artwork-suggestion-copy">
              <text class="artwork-suggestion-title">{{ artwork.title }}</text>
              <text class="artwork-suggestion-meta" v-if="artwork.artist_name">{{ artwork.artist_name }}</text>
            </view>
          </view>
          <view class="artwork-suggestion-state" v-else>
            <text>没有找到相关作品，请换个关键词。</text>
          </view>
        </view>
      </view>

      <view class="upload-grid" v-if="selectedImages.length > 0">
        <view class="upload-item" v-for="(image, index) in selectedImages" :key="image.path + index">
          <image
            class="upload-preview"
            :src="image.path"
            mode="aspectFill"
            @click="previewImages(selectedImagePaths, image.path)"
          />
          <view class="upload-badge" v-if="image.url">已上传</view>
          <view class="upload-badge dim" v-else-if="submitting">待上传</view>
          <text class="upload-remove" @click.stop="removeImage(index)">×</text>
        </view>
      </view>

      <view class="composer-foot">
        <text class="foot-note">最多 9 张图片，发布时才会上传。</text>
        <button class="publish-btn" :disabled="!canSubmit" @click="submitPost">
          {{ submitting ? '发布中…' : '发布' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../../store/index'
import { uploadImage } from '../../utils/api/upload'
import { getArtworks } from '../../utils/api/artworks'
import { DEFAULT_USER_AVATAR, resolveUserAvatar } from '../../utils/assets'
import AppAvatar from '../../components/AppAvatar.vue'

const store = useAppStore()

const posts = ref([])
const loading = ref(false)
const loadError = ref('')
const sort = ref('latest')

const editorOpen = ref(false)
const submitting = ref(false)
const editorTitle = ref('')
const editorContent = ref('')
const editorArtworkKeyword = ref('')
const showArtworkField = ref(false)
const artworkSearching = ref(false)
const artworkSuggestions = ref([])
const selectedArtwork = ref(null)
const selectedImages = ref([])
let artworkSearchTimer = null

const defaultAvatar = DEFAULT_USER_AVATAR

const selectedImagePaths = computed(() => selectedImages.value.map(image => image.path))
const canSubmit = computed(() => editorContent.value.trim().length > 0 && !submitting.value)

const normalizePost = (post) => {
  const user = post?.user || {}
  const artwork = post?.artwork || null

  return {
    id: post?.id,
    user: {
      id: user.id,
      username: user.username || '藏家',
      avatar: resolveUserAvatar(user.avatar || defaultAvatar)
    },
    artwork_id: post?.artwork_id || artwork?.id || null,
    artwork: artwork ? {
      id: artwork.id,
      title: artwork.title || '未命名作品',
      cover_image: artwork.cover_image || defaultAvatar
    } : null,
    title: post?.title || '',
    content: post?.content || '',
    images: Array.isArray(post?.images) ? post.images : [],
    like_count: Number(post?.like_count || 0),
    comment_count: Number(post?.comment_count || 0),
    is_liked: !!post?.is_liked,
    created_at: post?.created_at || ''
  }
}

const formatTime = (time) => {
  if (!time) {
    return '刚刚'
  }

  const date = new Date(time)
  const now = new Date()
  const diff = now - date

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return Math.floor(diff / (60 * 1000)) + ' 分钟前'
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / (60 * 60 * 1000)) + ' 小时前'
  if (diff < 7 * 24 * 60 * 60 * 1000) return Math.floor(diff / (24 * 60 * 60 * 1000)) + ' 天前'
  return date.toLocaleDateString()
}

const loadPosts = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const result = await store.fetchPosts({
      page: 1,
      page_size: 20,
      sort: sort.value
    })

    const items = result?.data?.items || result?.items || result?.data || []
    posts.value = Array.isArray(items) ? items.map(normalizePost) : []
  } catch (error) {
    console.warn('Failed to load forum posts:', error)
    loadError.value = error.message || '请稍后再试'
    if (posts.value.length === 0) {
      posts.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadPosts)

const changeSort = async (nextSort) => {
  if (sort.value === nextSort) {
    return
  }

  sort.value = nextSort
  await loadPosts()
}

const openComposer = () => {
  if (!store.token) {
    store.showToast('请先登录后再发布')
    return
  }

  editorOpen.value = true
}

const resetComposer = () => {
  editorTitle.value = ''
  editorContent.value = ''
  editorArtworkKeyword.value = ''
  showArtworkField.value = false
  artworkSearching.value = false
  artworkSuggestions.value = []
  selectedArtwork.value = null
  selectedImages.value = []

  if (artworkSearchTimer) {
    clearTimeout(artworkSearchTimer)
    artworkSearchTimer = null
  }
}

const closeComposer = () => {
  if (submitting.value) {
    return
  }

  editorOpen.value = false
  resetComposer()
}

const toggleArtworkField = () => {
  showArtworkField.value = !showArtworkField.value
  if (!showArtworkField.value) {
    editorArtworkKeyword.value = ''
    artworkSearching.value = false
    artworkSuggestions.value = []
    selectedArtwork.value = null
    if (artworkSearchTimer) {
      clearTimeout(artworkSearchTimer)
      artworkSearchTimer = null
    }
  }
}

const searchArtworks = async (keyword) => {
  const trimmedKeyword = keyword.trim()

  if (!showArtworkField.value || !trimmedKeyword) {
    artworkSearching.value = false
    artworkSuggestions.value = []
    return
  }

  artworkSearching.value = true

  try {
    const result = await getArtworks({
      page: 1,
      page_size: 8,
      keyword: trimmedKeyword
    })

    const items = result?.data?.items || result?.data || []
    artworkSuggestions.value = (Array.isArray(items) ? items : [])
      .filter(item => item?.id && item?.title)
      .map(item => ({
        id: item.id,
        title: item.title,
        cover_image: item.cover_image || '',
        artist_name: item.artist?.username || item.artist || ''
      }))
  } catch (error) {
    console.warn('Failed to search artworks for forum composer:', error)
    artworkSuggestions.value = []
  } finally {
    artworkSearching.value = false
  }
}

const handleArtworkKeywordInput = (event) => {
  editorArtworkKeyword.value = event?.detail?.value || ''

  if (selectedArtwork.value && editorArtworkKeyword.value.trim() !== selectedArtwork.value.title) {
    selectedArtwork.value = null
  }

  if (artworkSearchTimer) {
    clearTimeout(artworkSearchTimer)
  }

  if (!editorArtworkKeyword.value.trim()) {
    artworkSuggestions.value = []
    artworkSearching.value = false
    artworkSearchTimer = null
    return
  }

  const nextKeyword = editorArtworkKeyword.value
  artworkSearchTimer = setTimeout(() => {
    searchArtworks(nextKeyword)
    artworkSearchTimer = null
  }, 220)
}

const selectArtwork = (artwork) => {
  selectedArtwork.value = artwork
  editorArtworkKeyword.value = artwork.title
  artworkSuggestions.value = []
}

const chooseImages = async () => {
  if (selectedImages.value.length >= 9) {
    store.showToast('最多可上传 9 张图片')
    return
  }

  try {
    const result = await uni.chooseImage({
      count: 9 - selectedImages.value.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const nextImages = (result.tempFilePaths || []).map(path => ({
      path,
      url: ''
    }))

    selectedImages.value = [...selectedImages.value, ...nextImages].slice(0, 9)
  } catch (error) {
    if (error?.errMsg && error.errMsg.includes('cancel')) {
      return
    }
    store.showToast(error.message || '选择图片失败')
  }
}

const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
}

const previewImages = (images, current) => {
  if (!images.length) {
    return
  }

  uni.previewImage({
    urls: images,
    current
  })
}

const ensureUploadedImages = async () => {
  const uploadedUrls = []

  for (const image of selectedImages.value) {
    if (image.url) {
      uploadedUrls.push(image.url)
      continue
    }

    const uploaded = await uploadImage(image.path, 'post')
    image.url = uploaded.url
    uploadedUrls.push(uploaded.url)
  }

  return uploadedUrls
}

const submitPost = async () => {
  if (!store.token) {
    store.showToast('请先登录后再发布')
    return
  }

  if (!editorContent.value.trim()) {
    store.showToast('请先输入内容')
    return
  }

  if (showArtworkField.value && editorArtworkKeyword.value.trim() && !selectedArtwork.value) {
    store.showToast('请从下拉结果中选择作品')
    return
  }

  submitting.value = true

  try {
    const payload = {
      content: editorContent.value.trim()
    }

    if (editorTitle.value.trim()) {
      payload.title = editorTitle.value.trim()
    }

    if (showArtworkField.value && selectedArtwork.value?.id) {
      payload.artwork_id = Number(selectedArtwork.value.id)
    }

    const images = await ensureUploadedImages()
    if (images.length > 0) {
      payload.images = images
    }

    const result = await store.createPost(payload)
    const createdPost = normalizePost(result?.data || result)

    posts.value = [createdPost, ...posts.value]
    editorOpen.value = false
    resetComposer()
    store.showToast({ title: '已发布', icon: 'success' })
  } catch (error) {
    console.error('Failed to publish forum post:', error)
    store.showToast(error.message || '发布失败')
  } finally {
    submitting.value = false
  }
}

const toggleLike = async (post) => {
  if (!store.token) {
    store.showToast('请先登录后再点赞')
    return
  }

  try {
    const result = post.is_liked
      ? await store.unlikePost(post.id)
      : await store.likePost(post.id)

    const data = result?.data || {}
    const nextLiked = typeof data.is_liked === 'boolean' ? data.is_liked : !post.is_liked
    const nextLikeCount = typeof data.like_count === 'number'
      ? data.like_count
      : post.like_count + (nextLiked ? 1 : -1)

    post.is_liked = nextLiked
    post.like_count = Math.max(0, nextLikeCount)
  } catch (error) {
    console.error('Failed to toggle forum post like:', error)
    store.showToast(error.message || '更新点赞失败')
  }
}

const showCommentHint = () => {
  store.showToast('评论功能即将支持')
}

onUnmounted(() => {
  if (artworkSearchTimer) {
    clearTimeout(artworkSearchTimer)
    artworkSearchTimer = null
  }
})
</script>

<style lang="scss" scoped>
.forum-page {
  min-height: 100vh;
  padding: 32rpx 24rpx 220rpx;
  background:
    radial-gradient(circle at top right, rgba(197, 164, 126, 0.12), transparent 28%),
    linear-gradient(180deg, #f7f4ee 0%, #f9f9f7 32%, #f5f3ee 100%);
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.title {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: 56rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #7a766f;
}

.hero-btn {
  min-width: 164rpx;
  height: 82rpx;
  line-height: 82rpx;
  margin: 0;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #1a1a1a;
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
}

.sort-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.sort-tab {
  min-width: 150rpx;
  padding: 18rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  color: #777169;
  text-align: center;
  font-size: 24rpx;
  font-weight: 500;
}

.sort-tab.active {
  background: #1a1a1a;
  color: #fff;
}

.status-card {
  padding: 32rpx;
  margin-bottom: 24rpx;
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03);
}

.status-card.muted {
  background: rgba(255, 255, 255, 0.76);
}

.status-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.status-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #7e786f;
}

.status-btn {
  margin: 22rpx 0 0;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 999rpx;
  background: rgba(26, 26, 26, 0.08);
  color: #1a1a1a;
  font-size: 24rpx;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.post-card {
  padding: 30rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18rpx 52rpx rgba(0, 0, 0, 0.035);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.post-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
}

.post-meta {
  min-width: 0;
}

.post-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.post-time {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #91897d;
}

.post-artwork {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
  padding: 16rpx;
  border-radius: 24rpx;
  background: #f6f2eb;
}

.artwork-cover {
  width: 84rpx;
  height: 84rpx;
  border-radius: 18rpx;
}

.artwork-copy {
  flex: 1;
  min-width: 0;
}

.artwork-label {
  display: block;
  font-size: 20rpx;
  letter-spacing: 2rpx;
  color: #9a907f;
}

.artwork-title {
  display: block;
  margin-top: 6rpx;
  font-size: 26rpx;
  color: #1a1a1a;
}

.post-title {
  display: block;
  margin-top: 22rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.45;
}

.post-content {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #33312d;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-top: 22rpx;
}

.post-image {
  width: 100%;
  height: 200rpx;
  border-radius: 22rpx;
  background: #f1eee8;
}

.post-actions {
  display: flex;
  gap: 28rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(26, 26, 26, 0.06);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.action-icon {
  font-size: 26rpx;
  color: #1a1a1a;
}

.action-text {
  font-size: 24rpx;
  color: #756f66;
}

.composer-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(17, 17, 17, 0.3);
}

.composer-panel {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 28rpx;
  z-index: 21;
  padding: 30rpx;
  border-radius: 36rpx;
  background: #fffdf9;
  box-shadow: 0 30rpx 100rpx rgba(0, 0, 0, 0.16);
}

.composer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.composer-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.composer-subtitle {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8e8579;
}

.composer-close {
  font-size: 50rpx;
  line-height: 1;
  color: #7f776d;
}

.composer-input {
  height: 88rpx;
  margin-top: 24rpx;
  padding: 0 24rpx;
  border-radius: 24rpx;
  background: #f5f1ea;
  font-size: 28rpx;
  color: #1a1a1a;
}

.composer-input.small {
  margin-top: 16rpx;
}

.artwork-picker {
  margin-top: 16rpx;
}

.selected-artwork {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 14rpx;
  padding: 16rpx 18rpx;
  border-radius: 20rpx;
  background: rgba(197, 164, 126, 0.12);
}

.selected-artwork__label {
  font-size: 20rpx;
  color: #9a7f5c;
}

.selected-artwork__title {
  font-size: 24rpx;
  color: #1a1a1a;
}

.artwork-suggestion-card {
  overflow: hidden;
  margin-top: 14rpx;
  border-radius: 24rpx;
  background: #f5f1ea;
}

.artwork-suggestion-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx;
  border-bottom: 1rpx solid rgba(26, 26, 26, 0.05);
}

.artwork-suggestion-item:last-child {
  border-bottom: none;
}

.artwork-suggestion-cover {
  width: 74rpx;
  height: 74rpx;
  border-radius: 18rpx;
  background: #ece7de;
  flex-shrink: 0;
}

.artwork-suggestion-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.artwork-suggestion-title {
  font-size: 26rpx;
  color: #1a1a1a;
}

.artwork-suggestion-meta {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8e8579;
}

.artwork-suggestion-state {
  padding: 22rpx 18rpx;
  font-size: 22rpx;
  color: #8e8579;
}

.composer-textarea {
  width: 100%;
  min-height: 240rpx;
  margin-top: 18rpx;
  padding: 22rpx 24rpx;
  border-radius: 28rpx;
  background: #f5f1ea;
  font-size: 28rpx;
  line-height: 1.7;
  color: #1a1a1a;
  box-sizing: border-box;
}

.composer-tools {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-wrap: wrap;
  margin-top: 18rpx;
}

.tool-chip {
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(26, 26, 26, 0.06);
  color: #4f4b45;
  font-size: 22rpx;
}

.tool-chip.active {
  background: rgba(197, 164, 126, 0.2);
  color: #7b603f;
}

.tool-count {
  margin-left: auto;
  font-size: 22rpx;
  color: #8f887d;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;
}

.upload-item {
  position: relative;
}

.upload-preview {
  width: 100%;
  height: 200rpx;
  border-radius: 22rpx;
  background: #f1eee8;
}

.upload-badge {
  position: absolute;
  left: 12rpx;
  bottom: 12rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(26, 26, 26, 0.78);
  color: #fff;
  font-size: 20rpx;
}

.upload-badge.dim {
  background: rgba(122, 118, 111, 0.82);
}

.upload-remove {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.68);
  color: #fff;
  text-align: center;
  font-size: 28rpx;
}

.composer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 24rpx;
}

.foot-note {
  flex: 1;
  font-size: 22rpx;
  line-height: 1.6;
  color: #8b8376;
}

.publish-btn {
  min-width: 200rpx;
  height: 84rpx;
  line-height: 84rpx;
  margin: 0;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #1a1a1a;
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
}

.publish-btn[disabled] {
  opacity: 0.45;
}
</style>
