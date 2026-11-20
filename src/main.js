import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'

import './assets/css/input.css'

import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.component('VueApexCharts', VueApexCharts)

app.mount('#app')
