import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题，用于顶部导航栏 */
    title?: string
    /** 是否显示顶部导航栏（默认显示） */
    navbar?: boolean
    /** 是否显示底部 tabbar（默认不显示） */
    tabbar?: boolean
    /** 是否显示返回按钮（默认非 tabbar 页面显示） */
    back?: boolean
    /** 是否免登录访问（默认需要登录） */
    public?: boolean
  }
}

export {}
