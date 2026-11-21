import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/search', name: 'search', component: () => import('./views/SearchView.vue') },
    { path: '/maps/:key', name: 'map', component: () => import('./views/MapView.vue') },
    { path: '/:pathMatch(.*)*', name: 'missing', component: () => import('./views/MissingView.vue') },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.fullPath !== from.fullPath) return { top: 0 }
  },
})

router.beforeEach(to => {
  if (to.name !== 'search' || typeof to.query.q !== 'string') return

  const match = /^(?:!bsr\s+|bsr\s*)([0-9a-f]+)$/i.exec(to.query.q.trim())
  const key = match?.[1]?.replace(/^0+(?=.)/, '').toLowerCase()
  if (key && key.length <= 6) return { name: 'map', params: { key } }
})

createApp(App).use(router).mount('#app')
