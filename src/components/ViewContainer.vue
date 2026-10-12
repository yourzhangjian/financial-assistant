<script setup lang="ts">
const active = ref(0)
</script>

<template>
  <slot />  
  <van-tabbar v-model="active">
    <van-tabbar-item icon="wap-home-o">首页</van-tabbar-item>
    <van-tabbar-item icon="contact-o">我的</van-tabbar-item>
  </van-tabbar>
</template>
