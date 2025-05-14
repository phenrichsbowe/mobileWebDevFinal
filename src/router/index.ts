import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tasks'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tasks'
      },
      {
        path: 'tasks',
        component: () => import('@/views/TasksPage.vue')
      },
      {
        path: 'daily',
        component: () => import('@/views/DailyTasksPage.vue')
      },
      {
        path: 'weekly',
        component: () => import('@/views/WeeklyTasksPage.vue')
      },
      {
        path: 'task/:id',
        component: () => import('@/views/TaskDetailPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
