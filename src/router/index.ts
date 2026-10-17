import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 页面布局：
 * - 首页 / 我的：底部 tabbar 页面
 * - 记账（新增、编辑）/ 账单明细：二级页面，顶部导航栏自带返回按钮
 * - 登录：独立页面，不显示导航栏
 */
const router = createRouter({
  // H5 内嵌容器（钉钉 / 微信等）下 hash 模式兼容性最好
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '财务助理', tabbar: true },
    },
    {
      path: '/bills',
      name: 'bills',
      component: () => import('@/views/BillsView.vue'),
      meta: { title: '账单明细' },
    },
    {
      path: '/record',
      name: 'record',
      component: () => import('@/views/RecordView.vue'),
      meta: { title: '记一笔' },
    },
    {
      path: '/record/:id',
      name: 'record-edit',
      component: () => import('@/views/RecordView.vue'),
      meta: { title: '编辑账单' },
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
      meta: { title: '登录', navbar: false, public: true },
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
  document.title = to.meta.title ? `${to.meta.title} · 财务助理` : '财务助理'
})

export default router
