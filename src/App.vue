<script setup lang="ts">
import axios from 'axios'
const result = ref<any>(null)
const test = () => {
  axios.get('https://jsonplaceholder.typicode.com/posts/1').then((response) => {
    console.log(response.data)
    result.value = response.data
  })
}
</script>

<template>
  <div style="font-size: 24px;margin: 20px;">测试</div>
  <van-button type="primary" @click="test">主要按钮</van-button>
  <div>{{ result }}</div>
</template>
