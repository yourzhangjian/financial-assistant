<script setup lang="ts">
import { showToast } from 'vant'
import 'vant/es/toast/style'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const { login } = useUserStore()

const form = reactive({ username: '', password: '' })
const loading = ref(false)

const usernameRules = [{ required: true, message: '请输入账号' }]
const passwordRules = [
  { required: true, message: '请输入密码' },
  { pattern: /^\S{6,}$/, message: '密码至少 6 位' },
]

async function onSubmit() {
  loading.value = true
  try {
    const info = await login(form.username, form.password)
    showToast(`欢迎回来，${info.nickname}`)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (error) {
    showToast(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <header class="login__header">
      <div class="login__logo">
        <van-icon name="balance-list-o" />
      </div>
      <h1 class="login__title">财务助理</h1>
      <p class="login__slogan">随手记一笔，收支心里有数</p>
    </header>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="账号"
          placeholder="请输入账号"
          clearable
          :rules="usernameRules"
        />
        <van-field
          v-model="form.password"
          name="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          clearable
          :rules="passwordRules"
        />
      </van-cell-group>

      <div class="login__submit">
        <van-button block round type="primary" native-type="submit" :loading="loading" loading-text="登录中...">
          登录
        </van-button>
      </div>
    </van-form>

    <p class="login__tips">演示环境：任意账号 + 6 位以上密码即可登录</p>
  </div>
</template>

<style scoped lang="scss">
.login {
  min-height: 100vh;
  padding: calc(48px + env(safe-area-inset-top)) 0 32px;
  background: linear-gradient(180deg, #eaf1ff 0%, var(--fa-page-bg) 45%);

  &__header {
    padding: 0 24px 32px;
    text-align: center;
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    border-radius: 20px;
    font-size: 34px;
    color: #fff;
    background: linear-gradient(135deg, #5b8cff 0%, #7a5cff 100%);
    box-shadow: 0 10px 22px rgba(91, 140, 255, 0.3);
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  &__slogan {
    margin-top: 8px;
    font-size: 13px;
    color: var(--fa-text-color-secondary);
  }

  &__submit {
    margin: 24px 16px 0;
  }

  &__tips {
    margin-top: 16px;
    font-size: 12px;
    text-align: center;
    color: var(--fa-text-color-secondary);
  }
}
</style>
