import { createApp } from 'vue'
import './styles/index.scss'
import App from './App.vue'
import router from './router'
import ViewContainer from './components/ViewContainer.vue'

const app = createApp(App)

app.component('view-container', ViewContainer)
app.use(router)

app.mount('#app')
