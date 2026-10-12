import { createApp } from 'vue'
import './styles/index.scss'
import App from './App.vue'

const app = createApp(App)

import ViewContainer from './components/ViewContainer.vue'
app.component('view-container', ViewContainer)

app.mount('#app')
