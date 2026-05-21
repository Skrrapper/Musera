<template>
  <view class="resident-page">
    <view class="theme-header">
      <view class="theme-header-content">
        <view class="theme-vol-tag">{{ heroTag }}</view>
        <text class="theme-title">{{ heroTitle }}</text>
        <text class="theme-desc">{{ heroDescription }}</text>
      </view>
    </view>

    <view class="products-section">
      <view class="search-shell">
        <input
          class="search-input"
          type="text"
          placeholder="搜索常驻作品或艺术家"
          v-model="searchQuery"
          @confirm="onSearch"
        />
        <view class="search-trigger" @click="onSearch">
          <text class="search-trigger__text">搜索</text>
        </view>
      </view>

      <view class="sort-row">
        <view class="sort-trigger" @click="toggleSortMenu">
          <view class="sort-trigger__glyph">
            <text class="sort-trigger__bar sort-trigger__bar--top"></text>
            <text class="sort-trigger__bar sort-trigger__bar--middle"></text>
            <text class="sort-trigger__bar sort-trigger__bar--bottom"></text>
          </view>
        </view>
        <view class="sort-panel" v-if="sortMenuOpen">
          <view
            class="sort-option"
            v-for="option in sortOptions"
            :key="option.value"
            :class="{ active: sortMode === option.value }"
            @click="selectSort(option.value)"
          >
            <text class="sort-option__text">{{ option.label }}</text>
          </view>
        </view>
      </view>

      <text class="section-title">作品</text>

      <view class="catalog-shell">
        <scroll-view class="category-rail" scroll-y :show-scrollbar="false">
          <view
            class="category-item"
            :class="{ active: activeCategory === null }"
            @click="setCategory(null)"
          >
            <text class="category-item__text">全部</text>
          </view>
          <view
            class="category-item"
            v-for="cat in categoryOptions"
            :key="cat.id"
            :class="{ active: activeCategory === cat.id }"
            @click="setCategory(cat.id)"
          >
            <text class="category-item__text">{{ cat.name }}</text>
          </view>
        </scroll-view>

        <view class="catalog-main">
          <view class="mock-banner" v-if="usingMockData">
            <text class="mock-banner__text">当前展示常驻测试内容，接口恢复后会自动显示真实数据。</text>
          </view>

          <view class="catalog-head" v-if="displayArtworks.length > 0">
            <text class="catalog-head__series">{{ heroLabel }}</text>
            <text class="catalog-head__count">{{ displayArtworks.length }} 件常驻作品</text>
          </view>

          <view class="loading-state" v-if="loading && displayArtworks.length === 0">
            <text class="status-title">正在加载</text>
            <text class="status-desc">正在整理常驻作品。</text>
          </view>

          <view class="empty-state" v-else-if="!loading && displayArtworks.length === 0">
            <text class="status-title">暂无常驻作品</text>
            <text class="status-desc">换个关键词，或试试其他分类。</text>
          </view>

          <view v-else class="products-grid">
            <view
              class="product-item"
              v-for="(item, index) in displayArtworks"
              :key="item.id"
              @click="openDetail(item)"
            >
              <view class="product-image-wrapper" :style="getProductMediaStyle()">
                <image
                  v-if="item.cover_image"
                  class="product-image"
                  :src="item.cover_image"
                  mode="aspectFill"
                  @click.stop="openDetail(item)"
                />
                <view
                  v-else
                  class="product-image artwork-thumb--mock"
                  :style="getMockPaletteStyle(item)"
                  @click.stop="openDetail(item)"
                >
                  <view class="artwork-thumb__shape artwork-thumb__shape--base"></view>
                  <view class="artwork-thumb__shape artwork-thumb__shape--accent"></view>
                </view>

                <view class="resident-chip">
                  <text class="resident-chip__text">常驻</text>
                </view>

              </view>

              <view class="product-info">
                <text class="product-title">{{ item.title }}</text>
                <text class="product-artist">{{ getArtistName(item) }}</text>
                <text class="product-price">{{ formatPrice(item.price) }}</text>
              </view>
            </view>
          </view>

          <view class="load-more" v-if="hasMore && !loading" @click="loadMore">
            <text class="load-more__text">查看更多</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../../store/index'
import { getArtworks } from '../../utils/api/artworks'
import { persistMockArtwork } from '../../utils/mockArtwork'

const store = useAppStore()

const RESIDENT_TAG = '常驻'
const searchQuery = ref('')
const activeCategory = ref(null)
const currentPage = ref(1)
const pageSize = 20
const loading = ref(false)
const hasMore = ref(false)
const usingMockData = ref(false)
const residentArtworks = ref([])
const sortMode = ref('random')
const sortMenuOpen = ref(false)
const shuffleSeed = ref(Date.now())

const categories = computed(() => store.categories || [])
const mockCategories = [
  { id: 101, name: '自然系列' },
  { id: 102, name: '器物研究' },
  { id: 103, name: '陶艺作品' },
  { id: 104, name: '光影摆件' },
  { id: 105, name: '空间陈设' }
]

const mockArtworks = [
  {
    id: 9101,
    title: '玉梨',
    price: 399,
    medium: '陶土与矿釉',
    like_count: 12,
    is_liked: false,
    palette: ['#ece4d8', '#c9b089'],
    artist: { username: '木目常驻' },
    category: { id: 101, name: '自然系列' },
    tags: ['常驻'],
    cover_image: 'https://picsum.photos/seed/muse-resident-pear/720/960'
  },
  {
    id: 9102,
    title: '半卷香语',
    price: 259,
    medium: '香器 / 白瓷',
    like_count: 18,
    is_liked: false,
    palette: ['#ddd4ca', '#9b7f62'],
    artist: { username: '木目常驻' },
    category: { id: 102, name: '器物研究' },
    tags: ['常驻'],
    cover_image: 'https://picsum.photos/seed/muse-resident-light/720/960'
  },
  {
    id: 9103,
    title: '叶面书立',
    price: 399,
    medium: '树脂与石粉',
    like_count: 7,
    is_liked: false,
    palette: ['#efe7d9', '#d8bc7c'],
    artist: { username: '木目常驻' },
    category: { id: 105, name: '空间陈设' },
    tags: ['常驻'],
    cover_image: 'https://picsum.photos/seed/muse-resident-bookend/720/960'
  },
  {
    id: 9104,
    title: '玉阶花器',
    price: 580,
    medium: '手工花器',
    like_count: 21,
    is_liked: false,
    palette: ['#e5ddd1', '#b78d64'],
    artist: { username: '木目常驻' },
    category: { id: 103, name: '陶艺作品' },
    tags: ['常驻'],
    cover_image: 'https://picsum.photos/seed/muse-resident-vase/720/960'
  },
  {
    id: 9105,
    title: '晨雾灯',
    price: 680,
    medium: '光影摆件',
    like_count: 10,
    is_liked: false,
    palette: ['#ede8de', '#8f7b67'],
    artist: { username: '木目常驻' },
    category: { id: 104, name: '光影摆件' },
    tags: ['常驻'],
    cover_image: 'https://picsum.photos/seed/muse-resident-lamp/720/960'
  },
  {
    id: 9106,
    title: '月白盏',
    price: 168,
    medium: '手作器皿',
    like_count: 15,
    is_liked: false,
    palette: ['#f2ece3', '#cab7a1'],
    artist: { username: '木目常驻' },
    category: { id: 102, name: '器物研究' },
    tags: ['常驻'],
    cover_image: 'https://picsum.photos/seed/muse-resident-cup/720/960'
  }
]

const categoryOptions = computed(() => {
  return usingMockData.value ? mockCategories : categories.value
})

const sortOptions = [
  { value: 'random', label: '随机' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'price_asc', label: '价格从低到高' }
]

const activeSortLabel = computed(() => {
  return sortOptions.find(option => option.value === sortMode.value)?.label || '随机'
})

const displayArtworks = computed(() => {
  let items = usingMockData.value ? mockArtworks : residentArtworks.value

  if (activeCategory.value) {
    items = items.filter(item => item.category && item.category.id === activeCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => {
      const title = item.title ? item.title.toLowerCase() : ''
      const artistName = item.artist && item.artist.username ? item.artist.username.toLowerCase() : ''
      return title.includes(query) || artistName.includes(query)
    })
  }

  return [...items].sort(compareArtworks)
})

const heroLabel = computed(() => 'RESIDENT')

const heroTag = computed(() => '常设陈列')

const heroTitle = computed(() => '常驻')

const heroDescription = computed(() => '这里收纳常设作品，不随季度上下线而变化。')

const buildQueryParams = (page = 1) => {
  const params = {
    page,
    page_size: pageSize,
    tag: RESIDENT_TAG,
    status: 'active'
  }

  const apiSort = getApiSortValue()
  if (apiSort) {
    params.sort = apiSort
  }

  if (searchQuery.value.trim()) {
    params.keyword = searchQuery.value.trim()
  }

  if (activeCategory.value) {
    params.category_id = activeCategory.value
  }

  return params
}

const applyPagedResult = (result, page = 1) => {
  const items = result?.data?.items || result?.items || result?.data || []
  const itemList = Array.isArray(items) ? items : []

  if (page === 1) {
    residentArtworks.value = itemList
  } else {
    const existingIds = new Set(residentArtworks.value.map(item => item.id))
    residentArtworks.value = residentArtworks.value.concat(itemList.filter(item => !existingIds.has(item.id)))
  }

  hasMore.value = itemList.length === pageSize
}

const enableMockData = () => {
  usingMockData.value = true
  hasMore.value = false
}

const getApiSortValue = () => {
  if (sortMode.value === 'price_desc') {
    return 'price_desc'
  }

  if (sortMode.value === 'price_asc') {
    return 'price_asc'
  }

  return ''
}

const getNumericValue = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getPrice = (item) => getNumericValue(item?.price)

const getShuffleRank = (item) => {
  const base = `${shuffleSeed.value}:${item?.id ?? item?.title ?? ''}`
  let hash = 0

  for (let index = 0; index < base.length; index += 1) {
    hash = (hash * 33 + base.charCodeAt(index)) % 2147483647
  }

  return hash
}

const compareArtworks = (left, right) => {
  switch (sortMode.value) {
    case 'price_desc':
      return getPrice(right) - getPrice(left)
    case 'price_asc':
      return getPrice(left) - getPrice(right)
    default:
      return getShuffleRank(left) - getShuffleRank(right)
  }
}

const toggleSortMenu = () => {
  sortMenuOpen.value = !sortMenuOpen.value
}

const selectSort = async (mode) => {
  if (sortMode.value === mode) {
    sortMenuOpen.value = false
    return
  }

  sortMode.value = mode
  sortMenuOpen.value = false
  currentPage.value = 1

  if (mode === 'random') {
    shuffleSeed.value = Date.now()
  }

  if (usingMockData.value) {
    hasMore.value = false
    return
  }

  await fetchResidentArtworks(1)
}

const fetchResidentArtworks = async (page = 1) => {
  if (usingMockData.value) {
    hasMore.value = false
    return
  }

  loading.value = true
  try {
    const result = await getArtworks(buildQueryParams(page))
    applyPagedResult(result, page)
  } catch (error) {
    console.warn('Resident fallback to mock data:', error)
    enableMockData()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      store.fetchCategories(),
      fetchResidentArtworks(1)
    ])
    usingMockData.value = false
  } catch (error) {
    console.warn('Resident initial load failed, using mock data:', error)
    enableMockData()
  } finally {
    loading.value = false
  }
})

const onSearch = async () => {
  sortMenuOpen.value = false
  currentPage.value = 1
  if (usingMockData.value) {
    hasMore.value = false
    return
  }
  await fetchResidentArtworks(1)
}

const setCategory = async (categoryId) => {
  if (activeCategory.value === categoryId) {
    return
  }

  sortMenuOpen.value = false
  activeCategory.value = categoryId
  currentPage.value = 1
  if (usingMockData.value) {
    hasMore.value = false
    return
  }
  await fetchResidentArtworks(1)
}

const loadMore = async () => {
  if (loading.value || usingMockData.value) {
    return
  }

  currentPage.value += 1
  await fetchResidentArtworks(currentPage.value)
}

const getArtistName = (item) => {
  if (item.artist && item.artist.username) {
    return item.artist.username
  }
  return '未知艺术家'
}

const formatPrice = (price) => {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return ''
  }

  return `¥ ${numericPrice.toLocaleString('zh-CN')}`
}

const previewArtwork = (item) => {
  if (!item?.cover_image) {
    return
  }

  uni.previewImage({
    urls: [item.cover_image],
    current: item.cover_image
  })
}

const openDetail = (item) => {
  if (usingMockData.value) {
    const mockArtwork = persistMockArtwork(item, { resident: true })
    uni.navigateTo({ url: '/pages/product-detail/index?id=' + mockArtwork.id + '&mock=1' })
    return
  }

  uni.navigateTo({ url: '/pages/product-detail/index?id=' + item.id })
}

const getMockPaletteStyle = (item) => {
  const palette = item.palette || ['#ece4d8', '#c9b089']
  return {
    background: `linear-gradient(180deg, ${palette[0]} 0%, ${palette[1]} 100%)`
  }
}

const getProductMediaStyle = () => {
  return {
    height: '420rpx'
  }
}
</script>

<style lang="scss" scoped>
.resident-page {
  min-height: 100vh;
  background-color: #ffffff;
}

.theme-header {
  padding: 36rpx 24rpx 0;
  background: #ffffff;
}

.theme-header-content {
  position: static;
}

.theme-vol-tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  margin-bottom: 16rpx;
  border-radius: 24rpx;
  background: #000000;
  font-size: 20rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  color: #ffffff;
}

.theme-title {
  display: block;
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: 48rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  color: #1f1a16;
}

.theme-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #7f756a;
}

.products-section {
  padding: 40rpx 24rpx 220rpx;
}

.search-shell {
  position: relative;
  margin-bottom: 10rpx;
}

.search-input {
  width: 100%;
  height: 82rpx;
  padding: 0 126rpx 0 28rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.84);
  font-size: 28rpx;
  color: #1f1a16;
  box-sizing: border-box;
}

.search-trigger {
  position: absolute;
  top: 13rpx;
  right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 92rpx;
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 16rpx;
  background: rgba(31, 26, 22, 0.08);
}

.search-trigger__text {
  font-size: 22rpx;
  color: #3d342c;
}

.sort-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  background: rgba(31, 26, 22, 0.06);
}

.sort-row {
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12rpx;
}

.sort-trigger__glyph {
  position: relative;
  width: 22rpx;
  height: 18rpx;
}

.sort-trigger__bar {
  position: absolute;
  left: 0;
  height: 3rpx;
  border-radius: 999rpx;
  background: #6b6156;
}

.sort-trigger__bar--top {
  top: 0;
  width: 22rpx;
}

.sort-trigger__bar--middle {
  top: 7rpx;
  width: 16rpx;
}

.sort-trigger__bar--bottom {
  top: 14rpx;
  width: 10rpx;
}

.sort-panel {
  position: absolute;
  top: calc(100% + 8rpx);
  right: 0;
  width: 232rpx;
  padding: 10rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 48rpx rgba(31, 26, 22, 0.1);
  z-index: 8;
  box-sizing: border-box;
}

.sort-option {
  padding: 14rpx 16rpx;
  border-radius: 12rpx;
}

.sort-option.active {
  background: rgba(138, 106, 73, 0.08);
}

.sort-option__text {
  font-size: 22rpx;
  line-height: 1.5;
  color: #4d443c;
}

.catalog-shell {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.category-rail {
  width: 156rpx;
  max-height: calc(100vh - 260rpx);
  padding-right: 8rpx;
  box-sizing: border-box;
}

.category-item {
  position: relative;
  padding: 18rpx 8rpx 18rpx 0;
}

.category-item::before {
  content: '';
  position: absolute;
  left: -10rpx;
  top: 50%;
  width: 6rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: transparent;
  transform: translateY(-50%);
}

.category-item.active::before {
  background: #8a6a49;
}

.category-item__text {
  display: block;
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: 28rpx;
  line-height: 1.28;
  color: #7a7166;
  word-break: break-word;
}

.category-item.active .category-item__text {
  color: #1f1a16;
}

.catalog-main {
  flex: 1;
  min-width: 0;
}

.section-title {
  display: block;
  margin-bottom: 14rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #000000;
}

.catalog-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18rpx;
  padding: 6rpx 4rpx 10rpx;
}

.catalog-head__series {
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-size: 26rpx;
  letter-spacing: 2rpx;
  color: #5e5448;
}

.catalog-head__count {
  font-size: 20rpx;
  color: #9a9082;
}

.mock-banner {
  margin-bottom: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: rgba(138, 106, 73, 0.08);
}

.mock-banner__text {
  font-size: 22rpx;
  line-height: 1.6;
  color: #7c6750;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.product-item {
  width: 100%;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  background: #f5f5f5;
  border-radius: 16rpx;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ece7de;
}

.artwork-thumb--mock {
  overflow: hidden;
}

.artwork-thumb__shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.62);
}

.artwork-thumb__shape--base {
  left: 22rpx;
  right: 22rpx;
  bottom: 18rpx;
  height: 60rpx;
  border-radius: 50% 50% 20rpx 20rpx;
}

.artwork-thumb__shape--accent {
  top: 18rpx;
  right: 22rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
}

.resident-chip {
  position: absolute;
  left: 14rpx;
  top: 14rpx;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72rpx;
  height: 40rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 250, 242, 0.92);
}

.resident-chip__text {
  font-size: 20rpx;
  color: #6d5e50;
}

.product-info {
  padding: 16rpx 12rpx 20rpx;
  background: #ffffff;
}

.product-title {
  display: block;
  color: #1f1a16;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.2;
  word-break: break-word;
}

.product-artist {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  font-size: 22rpx;
  color: #8b7f72;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.product-price {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #3f3328;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 34rpx;
}

.load-more__text {
  padding: 20rpx 34rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.84);
  font-size: 22rpx;
  color: #5e5448;
}

.loading-state,
.empty-state {
  padding: 96rpx 24rpx;
  text-align: center;
}

.status-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f1a16;
}

.status-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: #8f8679;
}
</style>
