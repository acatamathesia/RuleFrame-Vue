import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  username: string
  token: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  const isAuthenticated = computed(() => !!token.value)

  function login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username && password) {
          token.value = 'mock-token-' + Date.now()
          user.value = { username, token: token.value }
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function checkAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})