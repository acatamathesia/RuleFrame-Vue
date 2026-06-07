import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Menu } from '@/api/types'

// 静态路由(不需要权限控制)
const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  }
]

// 基础布局路由(作为动态路由的容器)
const layoutRoute: RouteRecordRaw = {
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
    }
  ]
}

// 使用 Vite 的 import.meta.glob 预加载所有 views 下的 Vue 组件
const viewsModules = import.meta.glob('@/views/**/*.vue')

/**
 * 根据组件路径动态导入组件
 * @param componentPath 组件路径,如: 'Dashboard', 'system/Users', 'system/Roles'
 * @returns 组件加载函数
 */
function loadComponent(componentPath: string): any {
  if (!componentPath) {
    return null
  }

  const path = componentPath.startsWith('/') ? componentPath.substring(1) : componentPath
  
  const modulePath = '/src/views/' + path + '.vue'
  
  const componentLoader = viewsModules[modulePath]
  
  if (!componentLoader) {
    console.warn('未找到组件: ' + modulePath)
    return null
  }
  
  return componentLoader
}

/**
 * 根据菜单生成路由
 */
function generateRoutes(menus: Menu[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  for (const menu of menus) {
    if (menu.menuType === 3 || menu.visible === 0 || menu.status === 0) {
      continue
    }

    if (menu.path) {
      const route: any = {
        path: menu.path,
        name: menu.menuCode,
        meta: {
          title: menu.menuName,
          icon: menu.icon,
          requiresAuth: menu.menuType !== 1,
          keepAlive: true
        }
      }

      if (menu.menuType === 1) {
        route.component = () => import('@/layouts/RouteView.vue')
      } else if (menu.menuType === 2) {
        // 先尝试加载,如果组件不存在则使用默认占位组件
        const component = loadComponent(menu.component || '')
        if (component) {
          route.component = component
        } else {
          // 使用占位组件
          route.component = () => import('@/layouts/RouteView.vue')
        }
      }

      if (menu.children && menu.children.length > 0) {
        route.redirect = menu.path
        route.children = generateRoutes(menu.children)
      }

      routes.push(route)
    } else if (menu.menuType === 1 && menu.children && menu.children.length > 0) {
      // 目录类型没有path,但可能有子菜单
      routes.push(...generateRoutes(menu.children))
    }
  }

  return routes
}

const router = createRouter({
  history: createWebHistory(),
  routes: [...staticRoutes, layoutRoute]
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  console.log('路由守卫: 从', from.path, '到', to.path)
  console.log('路由守卫: 完整路径', to.fullPath)
  console.log('路由守卫: 路径信息', {
    path: to.path,
    fullPath: to.fullPath,
    matched: to.matched.map(r => r.path),
    meta: to.meta
  })
  
  const authStore = useAuthStore()
  
  if (to.path === '/login') {
    // 如果已登录,重定向到首页
    if (authStore.isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }
  
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isLoggedIn) {
      // 未登录,跳转登录页
      next('/login')
      return
    }
    
    // 检查是否有动态路由,如果没有则初始化
    const menus = authStore.menus
    if (!menus || menus.length === 0) {
      try {
        await authStore.fetchUserInfo()
        // fetchUserInfo 内部已经调用了 initDynamicRoutes
        const dynamicRoutes = generateRoutes(authStore.menus)
        
        // 移除旧路由并添加新路由
        for (const route of dynamicRoutes) {
          router.removeRoute(route.name as string)
          router.addRoute('Layout', route)
        }
        
        // 尝试重新导航
        // 注意: 不能直接 next(to.fullPath),会导致无限重定向
        // 如果当前要去的路径不是dashboard (比如刷新时在规则组页面),
        // 需要允许继续,但路由可能还没注册
        next({ ...to, replace: true })
        return
      } catch (error) {
        console.error('获取用户信息失败:', error)
        next('/login')
        return
      }
    } else if (!router.hasRoute('Users') && authStore.isLoggedIn) {
      // 如果已登录但没有初始化路由,手动初始化
      const dynamicRoutes = generateRoutes(menus)
      for (const route of dynamicRoutes) {
        if (!router.hasRoute(route.name as string)) {
          router.addRoute('Layout', route)
        }
      }
      
      if (to.matched.length === 1 && to.matched[0].name === 'Layout') {
        next('/dashboard')
        return
      }
    }
    
    next()
  } else {
    next()
  }
})

// 保存原始 addRoute 方法
const originalAddRoute = router.addRoute.bind(router)
router.addRoute = function(...args: any[]): any {
  // 如果是 RouteRecordRaw 对象
  if (typeof args[0] === 'object') {
    const route = args[0] as RouteRecordRaw
    // 如果已经存在同名路由，先移除
    if (route.name && router.hasRoute(route.name)) {
      router.removeRoute(route.name)
    }
  }
  // 如果是 parentName, route 两个参数
  if (typeof args[0] === 'string') {
    const route = args[1] as RouteRecordRaw
    if (route.name && router.hasRoute(route.name)) {
      router.removeRoute(route.name)
    }
  }
  return originalAddRoute(...args)
}

// 导出供外部使用(如权限更新后刷新路由)
export function resetRoutes() {
  // 获取所有动态添加的路由并移除
  const currentRoutes = router.getRoutes()
  currentRoutes.forEach(route => {
    if (route.name && route.name !== 'Layout' && route.name !== 'Login' && route.name !== 'Dashboard') {
      router.removeRoute(route.name)
    }
  })
}

export default router
