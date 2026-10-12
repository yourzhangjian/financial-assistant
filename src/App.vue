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
  <div style="font-size: 24px;margin: 20px;">测试钉钉H5</div>
  <van-button type="primary" @click="test">发起请求</van-button>
  <div>{{ result }}</div>
</template>
