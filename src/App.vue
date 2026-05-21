<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
onLaunch(() => { console.log('App Launch') })
onShow(() => { console.log('App Show') })
onHide(() => { console.log('App Hide') })
</script>

<style lang="scss">
/* 色彩体系 - 高确信度低饱和色彩系统 */
page {
  /* Primary - 黑/深灰：主标题、核心操作按钮 */
  --color-primary: #1a1a1a;
  --color-primary-light: #333333;
  
  /* Surface - 米白/纸张色：背景 */
  --color-surface: #f9f9f7;
  --color-surface-white: #ffffff;
  --color-surface-warm: #f5f4f2;
  
  /* Accent - 哑光金：关键交互点 */
  --color-accent: #c5a47e;
  --color-accent-light: #d4b896;
  
  /* Text - 文字色彩层级 */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-text-inverse: #ffffff;
  
  /* 字体系统 - 使用系统字体作为后备 */
  --font-display: "Playfair Display", "Times New Roman", "Songti SC", serif;
  --font-body: "Lato", -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;
  
  /* 行高 */
  --line-height-tight: 1.3;
  --line-height-normal: 1.6;
  --line-height-relaxed: 1.8;
  
  background-color: var(--color-surface); 
  font-family: var(--font-body); 
  color: var(--color-text-primary);
  font-size: 28rpx;
  line-height: var(--line-height-normal);
}

/* 全局标题样式 */
.title-display {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 2rpx;
}

/* 全局按钮样式 */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-body);
  font-weight: 500;
  letter-spacing: 4rpx;
}

.btn-accent {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
  color: var(--color-text-inverse);
  font-family: var(--font-body);
  font-weight: 500;
}

/* 全局卡片阴影 - 环境光阴影 */
.shadow-soft {
  box-shadow: 
    0 4rpx 12rpx rgba(197, 164, 126, 0.06),
    0 12rpx 40rpx rgba(0, 0, 0, 0.04);
}

.shadow-medium {
  box-shadow: 
    0 4rpx 16rpx rgba(197, 164, 126, 0.08),
    0 16rpx 48rpx rgba(0, 0, 0, 0.06);
}
</style>
