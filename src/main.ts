import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL + 'sw.js'
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

createApp(App).use(router).mount('#app')
