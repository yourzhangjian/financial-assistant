<script setup lang="ts">
import type { ConfigProviderThemeVars } from 'vant'

/** vant 主题变量：theme-vars-scope="global" 时写入 :root，避免样式顺序影响 */
const themeVars: ConfigProviderThemeVars = {
  primaryColor: '#5b8cff',
  successColor: '#10ac84',
  dangerColor: '#ff6b6b',
  textColor2: '#66696e',
  textColor3: '#969799',
  radiusMd: '8px',
  radiusLg: '12px',
}
</script>

<template>
  <van-config-provider :theme-vars="themeVars" theme-vars-scope="global">
    <view-container>
      <router-view />
    </view-container>
  </van-config-provider>
</template>
