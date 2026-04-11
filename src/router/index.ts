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
    // 添加一个临时的默认路由,避免初始重定向失败
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { title: '仪表盘' }
    }
  ]
}

// 使用 Vite 的 import.meta.glob 预加载所有 views 下的 Vue 组件
// 这样可以避免动态 import 的路径变量限制
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

  // 移除可能的前导斜杠
  const path = componentPath.startsWith('/') ? componentPath.substring(1) : componentPath
  
  // 构造模块路径 - 使用 /src/views/ 而不是 @/views/
  const modulePath = `/src/views/${path}.vue`
  
  // 从预加载的模块中获取
  const componentLoader = viewsModules[modulePath]
  
  if (!componentLoader) {
    console.warn(`未找到组件: ${modulePath}`)
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
    // 跳过按钮类型和隐藏的菜单
    if (menu.menuType === 3 || menu.visible === 0 || menu.status === 0) {
      continue
    }

    // 如果有路径,创建路由
    if (menu.path) {
      const route: any = {
        path: menu.path,
        name: menu.menuCode || menu.menuName,
        meta: {
          title: menu.menuName,
          icon: menu.icon
        }
      }

      // 设置组件 - 从数据库的 component 字段动态加载
      if (menu.component) {
        route.component = loadComponent(menu.component)
      } else if (menu.menuType === 2) {
        // 菜单类型但没有指定组件,使用路径的最后一段作为组件名
        const componentName = menu.path.split('/').pop()
        if (componentName) {
          route.component = loadComponent(componentName)
        }
      }

      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        const childRoutes = generateRoutes(menu.children)
        if (childRoutes.length > 0) {
          route.children = childRoutes
          // 如果有子路由且没有设置重定向,设置默认重定向到第一个子路由
          if (!route.redirect && childRoutes.length > 0) {
            route.redirect = childRoutes[0].path
          }
        }
      }

      routes.push(route)
    }
  }

  return routes
}

/**
 * 添加动态路由
 */
export function addDynamicRoutes(): boolean {
  const authStore = useAuthStore()
  
  // 如果已经有动态路由,不再添加
  if (authStore.menus.length === 0) {
    return false
  }

  // 移除旧的布局路由
  const routes = router.getRoutes()
  const layoutRouteName = layoutRoute.name
  if (layoutRouteName && routes.find(r => r.name === layoutRouteName)) {
    router.removeRoute(layoutRouteName)
  }

  // 清空现有子路由
  layoutRoute.children = []

  // 生成动态路由
  const dynamicRoutes = generateRoutes(authStore.menus)
  
  // 添加动态路由到布局路由
  layoutRoute.children?.push(...dynamicRoutes)

  // 确保有默认重定向
  if (!layoutRoute.children?.some(r => r.path === 'dashboard')) {
    // 如果没有仪表盘路由,添加一个默认的
    const defaultDashboardRoute: RouteRecordRaw = {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { title: '仪表盘', icon: 'HomeFilled' }
    }
    layoutRoute.children?.push(defaultDashboardRoute)
    
    // 如果没有其他菜单,重定向到 dashboard
    if (dynamicRoutes.length === 0) {
      layoutRoute.redirect = '/dashboard'
    } else if (dynamicRoutes.length > 0) {
      // 有其他菜单,重定向到第一个菜单
      layoutRoute.redirect = dynamicRoutes[0].path
    }
  }

  // 重新添加布局路由
  router.addRoute(layoutRoute)

  console.log('动态路由已加载,共', dynamicRoutes.length, '个路由')

  return true
}

// 创建路由器（初始只包含静态路由）
const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes
})

// 标记动态路由是否已经加载
let dynamicRoutesLoaded = false

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  console.log('路由守卫:', { to: to.path, from: from.path, isAuthenticated, dynamicRoutesLoaded })

  // 如果访问登录页
  if (to.path === '/login') {
    if (isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 需要认证的路由
  if (isAuthenticated) {
    // 如果动态路由还未加载,尝试加载
    if (!dynamicRoutesLoaded) {
      try {
        console.log('开始加载用户菜单...')
        
        // 如果菜单为空,从后端加载
        if (authStore.menus.length === 0) {
          await authStore.loadMenus()
        }
        
        console.log('菜单加载完成:', authStore.menus.length, '个菜单')
        
        // 添加动态路由
        if (addDynamicRoutes()) {
          dynamicRoutesLoaded = true
          console.log('动态路由加载完成,重新导航到:', to.path)
          // 重新导航到目标路由
          next({ ...to, replace: true })
          return
        }
      } catch (error) {
        console.error('加载菜单失败:', error)
        authStore.logout()
        dynamicRoutesLoaded = false
        next('/login')
        return
      }
    }
    
    // 如果动态路由已加载但菜单为空,说明用户没有权限访问任何菜单
    if (dynamicRoutesLoaded && authStore.menus.length === 0) {
      console.warn('用户没有可访问的菜单')
      next('/login')
      return
    }
    
    // 检查路由是否存在
    if (to.matched.length === 0) {
      console.warn('路由不存在,跳转到默认页:', to.path)
      next('/dashboard') // 路由不存在,跳转到默认页
    } else {
      next()
    }
  } else {
    // 未认证,跳转到登录页
    next('/login')
  }
})

export default router
