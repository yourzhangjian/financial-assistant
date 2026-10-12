<script setup lang="ts">
import axios from 'axios'
const result = ref<any>(null)
const show = ref(false)  
const date = ref('')
const test = () => {
  axios.get('https://jsonplaceholder.typicode.com/posts/1').then((response) => {
    console.log(response.data)
    result.value = response.data
  })
}
const onConfirm = () => {
  show.value = false
}
</script>

<template>
  <view-container>
    <div style="font-size: 24px;margin: 20px;">测试钉钉H5</div>
    <van-button type="primary" @click="test">发起请求</van-button>
    <div>{{ result }}</div>

    <van-cell title="选择单个日期" :value="date" @click="show = true" />
    <van-calendar v-model:show="show" @confirm="onConfirm" />

  </view-container>
</template>
