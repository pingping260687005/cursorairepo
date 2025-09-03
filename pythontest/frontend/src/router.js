import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './HomePage.vue'
import MappingPage from './MappingPage.vue'
import UploadPage from './UploadPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/upload', component: UploadPage },
  { path: '/mapping', component: MappingPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
