import { createApp } from 'vue'
import './styles/index.scss'
import App from './App.vue'

const app = createApp(App)

/**
 * 导入当前components目录下所有组件, eager同步加载
 */
const modules = import.meta.glob('./components/**/*.vue', { eager: true })
for (const module in modules) {
  var fileName = module.split('/').pop().replace(/\.\w+$/, '')
  const compoentName = fileName.replace(/([A-Z])/g, (_match: string, name, offset) => offset > 0 ? '-' + name.toLowerCase() : name.toLowerCase())
    console.log(compoentName)
    if (fileName.endsWith('container')) {
        app.component(compoentName, modules[module])
    } else {
        app.component('z-'+compoentName, modules[module])
    }
}

app.mount('#app')
