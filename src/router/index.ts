import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import WordList from '../views/WordList.vue'
import Groups from '../views/Groups.vue'
import GroupWords from '../views/GroupWords.vue'
import FlashCards from '../views/FlashCards.vue'
import Quiz from '../views/Quiz.vue'
import Duplicates from '../views/Duplicates.vue'
import Notes from '../views/Notes.vue'
import NoteView from '../views/NoteView.vue'
import TextImport from '../views/TextImport.vue'
import ImportQueue from '../views/ImportQueue.vue'
import StoryView from '../views/StoryView.vue'
import Arithmetic from '../views/Arithmetic.vue'

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
    path: '/duplicates',
    name: 'Duplicates',
    component: Duplicates
  },
  {
    path: '/notes',
    name: 'Notes',
    component: Notes
  },
  {
    path: '/notes/:id',
    name: 'NoteView',
    component: NoteView
  },
  {
    path: '/text-import',
    name: 'TextImport',
    component: TextImport
  },
  {
    path: '/import-queue',
    name: 'ImportQueue',
    component: ImportQueue
  },
  {
    path: '/story/:id',
    name: 'StoryView',
    component: StoryView
  },
  {
    path: '/arithmetic',
    name: 'Arithmetic',
    component: Arithmetic
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