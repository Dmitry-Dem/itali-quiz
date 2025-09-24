import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import WordList from '../views/WordList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/words',
    name: 'WordList',
    component: WordList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router