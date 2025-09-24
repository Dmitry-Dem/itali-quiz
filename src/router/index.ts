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
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router