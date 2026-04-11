import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserDTO, Menu } from '@/api/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserDTO | null>(null)
  const token = ref<string>('')
  const menus = ref<Menu[]>([])

  const isAuthenticated = computed(() => !!token.value)

  function login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username && password) {
          token.value = 'mock-token-' + Date.now()
          user.value = { 
            id: 1,
            username, 
            nickname: username === 'admin' ? '管理员' : username,
            email: username + '@ruleframe.com',
            phone: '13800138000',
            status: 1,
            role: username === 'admin' ? 'admin' : 'user',
            createTime: new Date().toISOString()
          }
          localStorage.setItem('token', token.value)
          localStorage.setItem('user', JSON.stringify(user.value))
          resolve(true)
        } else {
          resolve(false)
        }
      }, 500)
    })
  }

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

  return {
    user,
    token,
    menus,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
