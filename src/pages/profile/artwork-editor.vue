<template>
  <view class="editor-page">
    <view class="topbar">
      <view class="topbar-btn" @click="goBack">
        <text class="topbar-icon">←</text>
      </view>
      <text class="topbar-title">{{ pageTitle }}</text>
      <view class="topbar-btn submit-btn" @click="submitArtwork">
        <text class="submit-text">{{ submitting ? '...' : '保存' }}</text>
      </view>
    </view>

    <view class="intro">
      <text class="intro-kicker">作品发布</text>
      <text class="intro-title">{{ isEditing ? '调整你的作品' : '发布新作品' }}</text>
      <text class="intro-subtitle">仅认证艺术家可发布，字段已按接口要求整理。</text>
    </view>

    <view class="panel">
      <view class="section">
        <text class="section-title">封面图</text>
        <view class="cover-picker" @click="chooseCover">
          <image v-if="coverPreview" class="cover-image" :src="coverPreview" mode="aspectFill" />
          <view v-else class="cover-empty">
            <text class="cover-empty-plus">+</text>
            <text class="cover-empty-text">选择封面图</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">详情图</text>
        <view class="gallery-grid" v-if="galleryAssets.length > 0">
          <view class="gallery-item" v-for="(item, index) in galleryAssets" :key="galleryKey(item, index)">
            <image class="gallery-image" :src="assetPreview(item)" mode="aspectFill" @click="previewAsset(item)" />
            <text class="gallery-remove" @click.stop="removeGallery(index)">×</text>
          </view>
          <view v-if="galleryAssets.length < 9" class="gallery-add" @click="chooseGallery">
            <text class="gallery-add-text">添加</text>
          </view>
        </view>
        <view class="gallery-empty" v-else @click="chooseGallery">
          <text class="gallery-empty-text">添加详情图（选填）</text>
        </view>
      </view>

      <view class="section">
        <text class="label">标题</text>
        <input v-model.trim="form.title" class="input" maxlength="100" placeholder="作品标题" />
      </view>

      <view class="section">
        <text class="label">分类</text>
        <picker mode="selector" :range="categoryNames" :value="selectedCategoryIndex" @change="handleCategoryChange">
          <view class="picker-field">
            <text>{{ selectedCategoryName || (categoryNames.length ? '选择分类' : '暂无分类') }}</text>
          </view>
        </picker>
      </view>

      <view class="two-col">
        <view class="section col">
          <text class="label">价格</text>
          <input v-model.trim="form.price" class="input" type="digit" placeholder="0.00" />
        </view>
        <view class="section col">
          <text class="label">原价</text>
          <input v-model.trim="form.originalPrice" class="input" type="digit" placeholder="选填" />
        </view>
      </view>

      <view class="two-col">
        <view class="section col">
          <text class="label">年份</text>
          <input v-model.trim="form.year" class="input" type="number" maxlength="4" placeholder="2026" />
        </view>
        <view class="section col">
          <text class="label">库存</text>
          <input v-model.trim="form.stock" class="input" type="number" placeholder="1" />
        </view>
      </view>

      <view class="section">
        <text class="label">材质</text>
        <input v-model.trim="form.medium" class="input" maxlength="100" placeholder="如：布面油画" />
      </view>

      <view class="section">
        <text class="label">尺寸</text>
        <input v-model.trim="form.dimensions" class="input" maxlength="100" placeholder="如：60 × 80 cm" />
      </view>

      <view class="section">
        <text class="label">作品介绍</text>
        <textarea
          v-model.trim="form.description"
          class="textarea"
          maxlength="1000"
          auto-height
          placeholder="介绍作品、创作过程或背后的故事"
        />
      </view>

      <button class="primary-btn" :disabled="submitting" @click="submitArtwork">
        {{ submitting ? '保存中...' : isEditing ? '更新作品' : '发布作品' }}
      </button>

      <button v-if="isEditing" class="delete-btn" :disabled="submitting" @click="deleteArtwork">
        删除作品
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '../../store/index'
import { uploadImage } from '../../utils/api/upload'

const store = useAppStore()

const artworkId = ref('')
const loading = ref(false)
const submitting = ref(false)
const coverAsset = ref(null)
const galleryAssets = ref([])
const selectedCategoryId = ref(null)

const form = reactive({
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  medium: '',
  dimensions: '',
  year: '',
  stock: '1'
})

const isEditing = computed(() => !!artworkId.value)
const pageTitle = computed(() => isEditing.value ? '编辑作品' : '新建作品')
const categoryNames = computed(() => (store.categories || []).map(item => item.name))
const selectedCategoryIndex = computed(() => {
  const index = (store.categories || []).findIndex(item => item.id === selectedCategoryId.value)
  return index >= 0 ? index : 0
})
const selectedCategoryName = computed(() => {
  const current = (store.categories || []).find(item => item.id === selectedCategoryId.value)
  return current?.name || ''
})
const coverPreview = computed(() => assetPreview(coverAsset.value))

const toLocalAsset = (path) => ({
  path,
  url: '',
  isLocal: true
})

const toRemoteAsset = (url) => ({
  path: url,
  url,
  isLocal: false
})

const assetPreview = (asset) => asset?.path || asset?.url || ''

const galleryKey = (asset, index) => {
  return asset?.url || asset?.path || index
}

const ensureArtistAccess = async () => {
  if (!store.token) {
    throw new Error('请先登录')
  }

  if (!store.user?.id) {
    await store.getCurrentUser()
  }

  if (!store.user?.is_verified) {
    throw new Error('需要认证艺术家身份')
  }
}

const loadCategories = async () => {
  if ((store.categories || []).length > 0) {
    return
  }

  await store.fetchCategories()
}

const fillForm = (artwork = {}) => {
  form.title = artwork.title || ''
  form.description = artwork.description || ''
  form.price = artwork.price ? String(artwork.price) : ''
  form.originalPrice = artwork.original_price ? String(artwork.original_price) : ''
  form.medium = artwork.medium || ''
  form.dimensions = artwork.dimensions || ''
  form.year = artwork.year ? String(artwork.year) : ''
  form.stock = artwork.stock ? String(artwork.stock) : '1'
  selectedCategoryId.value = artwork.category?.id || artwork.category_id || null
  coverAsset.value = artwork.cover_image ? toRemoteAsset(artwork.cover_image) : null
  galleryAssets.value = Array.isArray(artwork.images) ? artwork.images.map(toRemoteAsset) : []
}

const loadArtwork = async (id) => {
  const artwork = await store.fetchArtworkById(Number(id))
  fillForm(artwork || {})
}

onLoad(async (options) => {
  try {
    loading.value = true
    await ensureArtistAccess()
    try {
      await loadCategories()
    } catch (error) {
      console.warn('Failed to load categories:', error)
      store.showToast(error.message || '分类暂时不可用')
    }

    if (options?.id) {
      artworkId.value = String(options.id)
      try {
        await loadArtwork(options.id)
      } catch (error) {
        console.warn('Failed to load artwork:', error)
        store.showToast(error.message || '载入作品详情失败')
      }
    }
  } catch (error) {
    store.showToast(error.message || '无法打开编辑页')
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  if (submitting.value) {
    return
  }
  uni.navigateBack()
}

const handleCategoryChange = (event) => {
  const nextIndex = Number(event.detail.value)
  const nextCategory = (store.categories || [])[nextIndex]
  selectedCategoryId.value = nextCategory?.id || null
}

const chooseCover = async () => {
  try {
    const result = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const [path] = result.tempFilePaths || []
    if (path) {
      coverAsset.value = toLocalAsset(path)
    }
  } catch (error) {
    if (error?.errMsg?.includes('cancel')) {
      return
    }
    store.showToast(error.message || '选择封面失败')
  }
}

const chooseGallery = async () => {
  if (galleryAssets.value.length >= 9) {
    store.showToast('最多添加 9 张图片')
    return
  }

  try {
    const result = await uni.chooseImage({
      count: 9 - galleryAssets.value.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const assets = (result.tempFilePaths || []).map(toLocalAsset)
    galleryAssets.value = [...galleryAssets.value, ...assets].slice(0, 9)
  } catch (error) {
    if (error?.errMsg?.includes('cancel')) {
      return
    }
    store.showToast(error.message || '选择图片失败')
  }
}

const removeGallery = (index) => {
  galleryAssets.value.splice(index, 1)
}

const previewAsset = (asset) => {
  const current = assetPreview(asset)
  if (!current) {
    return
  }

  const urls = galleryAssets.value.map(item => assetPreview(item)).filter(Boolean)
  uni.previewImage({
    urls: urls.length > 0 ? urls : [current],
    current
  })
}

const uploadAssetIfNeeded = async (asset) => {
  if (!asset) {
    return ''
  }

  if (!asset.isLocal) {
    return asset.url || asset.path || ''
  }

  const uploaded = await uploadImage(asset.path, 'artwork')
  console.info('Artwork image uploaded:', uploaded)
  asset.url = uploaded.url
  asset.isLocal = false
  return uploaded.url
}

const buildPayload = async () => {
  const coverImage = await uploadAssetIfNeeded(coverAsset.value)
  const galleryImages = []

  for (const item of galleryAssets.value) {
    const uploadedUrl = await uploadAssetIfNeeded(item)
    if (uploadedUrl) {
      galleryImages.push(uploadedUrl)
    }
  }

  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    cover_image: coverImage,
    images: galleryImages,
    price: Number(form.price),
    original_price: form.originalPrice ? Number(form.originalPrice) : undefined,
    category_id: selectedCategoryId.value,
    medium: form.medium.trim() || undefined,
    dimensions: form.dimensions.trim() || undefined,
    year: form.year ? Number(form.year) : undefined,
    stock: form.stock ? Number(form.stock) : 1
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => value !== undefined && value !== '')
  )
}

const validateForm = () => {
  const price = Number(form.price)
  const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined
  const stock = Number(form.stock)

  if (!coverPreview.value) {
    return '请先选择封面图'
  }

  if (!form.title.trim()) {
    return '请输入作品标题'
  }

  if (!selectedCategoryId.value) {
    return '请选择分类'
  }

  if (!form.price || !Number.isFinite(price) || price <= 0) {
    return '请输入正确的价格'
  }

  if (form.originalPrice && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
    return '请输入正确的原价'
  }

  if (form.year && !/^\d{4}$/.test(form.year)) {
    return '年份需为 4 位数字'
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return '库存不能小于 0'
  }

  return ''
}

const submitArtwork = async () => {
  const errorMessage = validateForm()
  if (errorMessage) {
    store.showToast(errorMessage)
    return
  }

  try {
    submitting.value = true
    const payload = await buildPayload()
    console.info('Artwork submit payload:', payload)

    if (isEditing.value) {
      await store.updateArtwork(Number(artworkId.value), payload)
      store.showToast({ title: '已更新', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 500)
      return
    }

    await store.createArtwork(payload)
    store.showToast({ title: '已发布', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/profile/artworks' })
    }, 500)
  } catch (error) {
    console.error('Failed to submit artwork:', error)
    store.showToast(error.message || '保存作品失败')
  } finally {
    submitting.value = false
  }
}

const deleteArtwork = async () => {
  if (!isEditing.value) {
    return
  }

  try {
    const modal = await uni.showModal({
      title: '删除作品',
      content: '确认永久删除这件作品？',
      confirmColor: '#8f5a4a'
    })

    if (!modal.confirm) {
      return
    }

    await store.deleteArtwork(Number(artworkId.value))
    store.showToast({ title: '已删除', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/profile/artworks' })
    }, 500)
  } catch (error) {
    store.showToast(error.message || '删除作品失败')
  }
}
</script>

<style lang="scss" scoped>
.editor-page {
  min-height: 100vh;
  padding: calc(84rpx + env(safe-area-inset-top)) 24rpx 56rpx;
  background:
    radial-gradient(circle at top right, rgba(197, 164, 126, 0.16), transparent 28%),
    linear-gradient(180deg, #f7f4ee 0%, #f8f7f3 36%, #f2efe8 100%);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-btn {
  min-width: 76rpx;
  height: 76rpx;
  padding: 0 18rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.84);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 28rpx rgba(28, 24, 18, 0.05);
}

.topbar-icon {
  font-size: 42rpx;
  color: #181713;
  line-height: 1;
}

.topbar-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #181713;
}

.submit-btn {
  background: #1c1b18;
}

.submit-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

.intro {
  margin-top: 40rpx;
}

.intro-kicker {
  display: block;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  color: #8f826d;
}

.intro-title {
  display: block;
  margin-top: 18rpx;
  font-family: 'Playfair Display', serif;
  font-size: 60rpx;
  line-height: 1.08;
  color: #181713;
}

.intro-subtitle {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.65;
  color: #726c61;
}

.panel {
  margin-top: 28rpx;
  padding: 28rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 22rpx 54rpx rgba(28, 24, 18, 0.05);
}

.section + .section,
.two-col,
.primary-btn,
.delete-btn {
  margin-top: 22rpx;
}

.section-title,
.label {
  display: block;
  margin-bottom: 14rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #312d26;
}

.cover-picker {
  overflow: hidden;
  border-radius: 28rpx;
  background: #f2eee6;
}

.cover-image {
  width: 100%;
  height: 520rpx;
}

.cover-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 320rpx;
}

.cover-empty-plus {
  font-size: 64rpx;
  line-height: 1;
  color: #8f826d;
}

.cover-empty-text {
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #7c7568;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.gallery-item,
.gallery-add,
.gallery-empty {
  position: relative;
  border-radius: 24rpx;
  overflow: hidden;
  background: #f2eee6;
}

.gallery-image,
.gallery-add {
  width: 100%;
  height: 200rpx;
}

.gallery-add,
.gallery-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-add-text,
.gallery-empty-text {
  font-size: 24rpx;
  color: #7c7568;
}

.gallery-empty {
  height: 180rpx;
}

.gallery-remove {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 42rpx;
  height: 42rpx;
  line-height: 42rpx;
  text-align: center;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.66);
  color: #fff;
  font-size: 28rpx;
}

.two-col {
  display: flex;
  gap: 16rpx;
}

.col {
  flex: 1;
}

.input,
.picker-field,
.textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 24rpx;
  background: #f6f3ec;
  border: 1rpx solid rgba(168, 150, 117, 0.18);
  color: #181713;
}

.input,
.picker-field {
  min-height: 92rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
}

.textarea {
  min-height: 220rpx;
  padding: 22rpx 24rpx;
  font-size: 28rpx;
  line-height: 1.7;
}

.primary-btn,
.delete-btn {
  width: 100%;
  min-height: 98rpx;
  border-radius: 28rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.primary-btn {
  background: linear-gradient(135deg, #1f1d19 0%, #40392f 100%);
  color: #fff;
}

.primary-btn[disabled] {
  opacity: 0.6;
}

.delete-btn {
  background: rgba(143, 90, 74, 0.12);
  color: #8f5a4a;
}
</style>
