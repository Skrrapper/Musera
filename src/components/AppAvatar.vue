<template>
  <view class="avatar-shell" @click="emit('click', $event)">
    <image
      class="app-avatar"
      :src="displaySrc"
      :mode="mode"
      @error="handleError"
    />
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { DEFAULT_USER_AVATAR, resolveUserAvatar, withAvatarVersion } from '../utils/assets'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'aspectFill'
  },
  cacheKey: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['click', 'error'])

const hasError = ref(false)

watch(() => [props.src, props.cacheKey], () => {
  hasError.value = false
})

const resolvedSrc = computed(() => resolveUserAvatar(props.src))
const displaySrc = computed(() => {
  if (hasError.value) {
    return DEFAULT_USER_AVATAR
  }

  return withAvatarVersion(resolvedSrc.value, props.cacheKey)
})

const handleError = (event) => {
  if (!hasError.value) {
    hasError.value = true
  }
  emit('error', event)
}
</script>

<style scoped>
.avatar-shell {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
}

.app-avatar {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
</style>
