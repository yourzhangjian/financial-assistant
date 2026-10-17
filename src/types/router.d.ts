import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题：用于 document.title */
    title?: string
    /** 是否显示底部 tabbar（默认不显示） */
    tabbar?: boolean
    /** 是否免登录访问（默认需要登录） */
    public?: boolean
  }
}

export {}
