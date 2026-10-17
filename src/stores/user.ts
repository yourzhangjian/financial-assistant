import type { UserInfo } from '@/types/user'
import { loadJSON, removeJSON, saveJSON } from '@/utils/storage'

const STORAGE_KEY = 'user'

/** 当前登录用户（模块级单例） */
const user = ref<UserInfo | null>(loadJSON<UserInfo | null>(STORAGE_KEY, null))

export function useUserStore() {
  const isLoggedIn = computed(() => user.value !== null)

  /**
   * 登录
   * 演示环境：任意账号 + 6 位以上密码即可登录，后续接入真实接口时替换此处实现
   */
  async function login(username: string, password: string): Promise<UserInfo> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const account = username.trim()
    if (!account) throw new Error('请输入账号')
    if (password.length < 6) throw new Error('密码至少 6 位')

    const info: UserInfo = { username: account, nickname: account, loginAt: Date.now() }
    user.value = info
    saveJSON(STORAGE_KEY, info)
    return info
  }

  /** 退出登录 */
  function logout(): void {
    user.value = null
    removeJSON(STORAGE_KEY)
  }

  /** 更新用户资料（如昵称） */
  function updateProfile(patch: Partial<Omit<UserInfo, 'loginAt'>>): void {
    if (!user.value) return
    user.value = { ...user.value, ...patch }
    saveJSON(STORAGE_KEY, user.value)
  }

  return { user, isLoggedIn, login, logout, updateProfile }
}
