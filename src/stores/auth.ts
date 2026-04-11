import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserDTO, Menu, LoginResponse } from '@/api/types'
import { login as apiLogin, getProfile } from '@/api/auth'
import { getMenuTreeByUserId } from '@/api/menu'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserDTO | null>(null)
  const token = ref<string>('')
  const menus = ref<Menu[]>([])

  const isAuthenticated = computed(() => !!token.value)

  function logout() {
    user.value = null
    token.value = ''
    menus.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('menus')
  }

  function checkAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedMenus = localStorage.getItem('menus')
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      if (savedMenus) {
        menus.value = JSON.parse(savedMenus)
      }
    }
  }

  /**
   * 加载用户菜单
   */
  async function loadMenus() {
    if (!user.value) {
      return
    }

    try {
      // 从后端获取用户菜单
      const response = await getMenuTreeByUserId(user.value.id)
      menus.value = response.data || []
      // 保存到localStorage
      localStorage.setItem('menus', JSON.stringify(menus.value))
    } catch (error) {
      console.error('加载菜单失败:', error)
      // 如果失败，使用空菜单
      menus.value = []
    }
  }

  /**
   * 登录
   */
  async function loginWithApi(username: string, password: string): Promise<boolean> {
    try {
      const response = await apiLogin({ username, password })
      
      if (response.code === 200 && response.data) {
        const loginData = response.data as LoginResponse
        token.value = loginData.token
        user.value = loginData.user
        menus.value = loginData.menus || []
        
        // 保存到localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        localStorage.setItem('menus', JSON.stringify(menus.value))
        
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  return {
    user,
    token,
    menus,
    isAuthenticated,
    login: loginWithApi,
    logout,
    checkAuth,
    loadMenus
  }
})
