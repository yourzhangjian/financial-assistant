import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const APP_NAME = '财务助理'

/**
 * 页面布局：
 * - 首页 / 我的：底部 tabbar 页面
 * - 记一笔、编辑交易、交易明细：二级页面，由页面自己的 PageHeader 提供标题与返回
 * - 登录：独立页面
 */
const router = createRouter({
  // H5 内嵌容器（钉钉 / 微信等）下 hash 模式兼容性最好
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: APP_NAME, tabbar: true },
    },
    {
      path: '/trades',
      name: 'trades',
      component: () => import('@/views/TradesView.vue'),
      meta: { title: '交易明细' },
    },
    {
      path: '/trade',
      name: 'trade',
      component: () => import('@/views/TradeView.vue'),
      meta: { title: '记一笔' },
    },
    {
      path: '/trade/:id',
      name: 'trade-edit',
      component: () => import('@/views/TradeView.vue'),
      meta: { title: '编辑交易' },
    },
    {
      path: '/mine',
      name: 'mine',
      component: () => import('@/views/MineView.vue'),
      meta: { title: '我的', tabbar: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录', public: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

/** 登录校验：未登录时跳转到登录页，并带上回跳地址 */
router.beforeEach((to) => {
  const { isLoggedIn } = useUserStore()

  if (!to.meta.public && !isLoggedIn.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && isLoggedIn.value) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/'
    return redirect
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = !title || title === APP_NAME ? APP_NAME : `${title} · ${APP_NAME}`
})

export default router
