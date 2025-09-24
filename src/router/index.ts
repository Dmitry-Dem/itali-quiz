import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import WordList from '../views/WordList.vue'
import Groups from '../views/Groups.vue'
import GroupWords from '../views/GroupWords.vue'
import FlashCards from '../views/FlashCards.vue'
import Quiz from '../views/Quiz.vue'

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
    path: '/groups',
    name: 'Groups',
    component: Groups
  },
  {
    path: '/words/:groupId',
    name: 'GroupWords',
    component: GroupWords
  },
  {
    path: '/flashcards/:groupId',
    name: 'FlashCards',
    component: FlashCards
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: Quiz
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