<script setup lang="ts">
const route = useRoute()
const showTabbar = computed(() => route.meta.tabbar === true)
</script>

<template>
  <div class="view-container">

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
