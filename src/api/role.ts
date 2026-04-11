import request from './request'

// 角色类型定义
export interface Role {
  id?: number
  roleName: string
  roleCode: string
  description?: string
  status?: number
  sort?: number
  createTime?: string
  updateTime?: string
}

// 分页查询参数
export interface RoleQueryParams {
  pageNum: number
  pageSize: number
  roleName?: string
}

// 分页响应
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 分页查询角色
 */
export function getRolePage(params: RoleQueryParams) {
  return request<PageResult<Role>>({
    url: '/roles/page',
    method: 'get',
    params
  })
}

/**
 * 查询所有角色
 */
export function getAllRoles() {
  return request<Role[]>({
    url: '/roles/all',
    method: 'get'
  })
}

/**
 * 根据ID查询角色
 */
export function getRoleById(id: number) {
  return request<Role>({
    url: `/roles/${id}`,
    method: 'get'
  })
}

/**
 * 创建角色
 */
export function createRole(data: Role) {
  return request<Role>({
    url: '/roles',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export function updateRole(id: number, data: Role) {
  return request<Role>({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export function deleteRole(id: number) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除角色
 */
export function deleteRoles(ids: number[]) {
  return request({
    url: '/roles/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 更新角色状态
 */
export function updateRoleStatus(id: number, status: number) {
  return request({
    url: `/roles/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 为角色分配菜单
 */
export function assignMenus(roleId: number, menuIds: number[]) {
  return request({
    url: `/roles/${roleId}/menus`,
    method: 'post',
    data: { menuIds }
  })
}

/**
 * 查询角色的菜单ID列表
 */
export function getRoleMenuIds(roleId: number) {
  return request<number[]>({
    url: `/roles/${roleId}/menus`,
    method: 'get'
  })
}
