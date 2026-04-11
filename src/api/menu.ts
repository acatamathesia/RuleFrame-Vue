import request from './request'

// 菜单类型定义
export interface Menu {
  id?: number
  parentId?: number
  menuName: string
  menuCode: string
  menuType?: number  // 1-目录，2-菜单，3-按钮
  path?: string
  component?: string
  permission?: string
  icon?: string
  sort?: number
  visible?: number
  status?: number
  isFrame?: number
  createTime?: string
  updateTime?: string
  children?: Menu[]
}

/**
 * 查询菜单树
 */
export function getMenuTree() {
  return request<Menu[]>({
    url: '/menus/tree',
    method: 'get'
  })
}

/**
 * 查询所有菜单
 */
export function getAllMenus() {
  return request<Menu[]>({
    url: '/menus/all',
    method: 'get'
  })
}

/**
 * 根据ID查询菜单
 */
export function getMenuById(id: number) {
  return request<Menu>({
    url: `/menus/${id}`,
    method: 'get'
  })
}

/**
 * 创建菜单
 */
export function createMenu(data: Menu) {
  return request<Menu>({
    url: '/menus',
    method: 'post',
    data
  })
}

/**
 * 更新菜单
 */
export function updateMenu(id: number, data: Menu) {
  return request<Menu>({
    url: `/menus/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 */
export function deleteMenu(id: number) {
  return request({
    url: `/menus/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除菜单
 */
export function deleteMenus(ids: number[]) {
  return request({
    url: '/menus/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 更新菜单状态
 */
export function updateMenuStatus(id: number, status: number) {
  return request({
    url: `/menus/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 根据用户ID查询菜单树
 */
export function getMenuTreeByUserId(userId: number) {
  return request<Menu[]>({
    url: `/menus/user/${userId}`,
    method: 'get'
  })
}
