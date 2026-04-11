import request from './request'
import type { UserDTO, PageResult, ApiResponse, CreateUserRequest, UpdateUserRequest } from './types'

/**
 * 分页查询用户
 */
export function listUsers(params: {
  keyword?: string
  status?: number
  pageNum: number
  pageSize: number
}): Promise<ApiResponse<PageResult<UserDTO>>> {
  return request.get('/users', { params })
}

/**
 * 根据ID获取用户
 */
export function getUser(id: number): Promise<ApiResponse<UserDTO>> {
  return request.get(`/users/${id}`)
}

/**
 * 创建用户
 */
export function createUser(data: CreateUserRequest): Promise<ApiResponse<UserDTO>> {
  return request.post('/users', data)
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<UserDTO>> {
  return request.put(`/users/${id}`, data)
}

/**
 * 删除用户
 */
export function deleteUser(id: number): Promise<ApiResponse<void>> {
  return request.delete(`/users/${id}`)
}

/**
 * 切换用户状态
 */
export function toggleUserStatus(id: number): Promise<ApiResponse<UserDTO>> {
  return request.put(`/users/${id}/toggle-status`)
}

/**
 * 修改密码
 */
export function changePassword(id: number, oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
  return request.put(`/users/${id}/password`, null, {
    params: { oldPassword, newPassword }
  })
}

/**
 * 更新个人信息
 */
export function updateProfile(id: number, nickname: string, email: string, phone: string): Promise<ApiResponse<UserDTO>> {
  return request.put(`/users/${id}/profile`, null, {
    params: { nickname, email, phone }
  })
}
