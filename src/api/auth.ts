import request from './request'
import type { LoginRequest, LoginResponse, UserDTO, ApiResponse } from './types'

/**
 * 用户登录
 */
export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return request.post('/auth/login', data)
}

/**
 * 用户登出
 */
export function logout(): Promise<ApiResponse<void>> {
  return request.post('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export function getProfile(): Promise<ApiResponse<UserDTO>> {
  return request.get('/auth/profile')
}
