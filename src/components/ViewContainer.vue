<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const title = computed(() => route.meta.title ?? '')
const showNavbar = computed(() => route.meta.navbar !== false)
const showTabbar = computed(() => route.meta.tabbar === true)
const showBack = computed(() => route.meta.back !== false && !showTabbar.value)

/** 有历史记录时返回上一页，否则回到首页（直接打开二级页面的场景） */
function onBack() {
  if (window.history.state?.back) router.back()
  else router.replace('/')
}
</script>

<template>
  <div class="view-container">
    <van-nav-bar
      v-if="showNavbar"
      :title="title"
      :left-arrow="showBack"
      placeholder
      fixed
      safe-area-inset-top
      @click-left="onBack"
    />

    <div class="view-container__body" :class="{ 'view-container__body--tabbar': showTabbar }">
      <slot />
    </div>

    <van-tabbar v-if="showTabbar" route fixed safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="wap-home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped lang="scss">
.view-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;

  &__body {
    flex: 1;
    padding-bottom: 24px;

    &--tabbar {
      padding-bottom: calc(var(--van-tabbar-height) + 24px);
    }
  }
}
</style>
