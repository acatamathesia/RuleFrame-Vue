import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'rules',
        name: 'Rules',
        component: () => import('@/views/Rules.vue'),
        meta: { title: '规则管理' }
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/users',
        meta: { title: '系统管理' },
        children: [
          {
            path: 'users',
            name: 'Users',
            component: () => import('@/views/Users.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'roles',
            name: 'Roles',
            component: () => import('@/views/Roles.vue'),
            meta: { title: '角色管理' }
          },
          {
            path: 'menus',
            name: 'Menus',
            component: () => import('@/views/Menus.vue'),
            meta: { title: '菜单管理' }
          },
          {
            path: 'settings',
            name: 'Settings',
            component: () => import('@/views/Settings.vue'),
            meta: { title: '系统设置' }
          }
        ]
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
