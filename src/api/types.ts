/**
 * API类型定义
 */

// 统一API响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页结果
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
}

// 用户DTO
export interface UserDTO {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar?: string
  status: number
  role: string
  createTime: string
  lastLoginTime?: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: UserDTO
  menus: Menu[]
}

// 菜单
export interface Menu {
  id?: number
  parentId?: number
  menuName: string
  menuCode: string
  menuType?: number
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

// 创建用户请求
export interface CreateUserRequest {
  username: string
  password: string
  nickname: string
  email: string
  phone: string
  role: string
}

// 更新用户请求
export interface UpdateUserRequest {
  id?: number
  nickname: string
  email: string
  phone: string
  role: string
  status: number
}

// 系统信息
export interface SystemInfo {
  appName: string
  version: string
  uptime: number
  javaVersion: string
  osName: string
  osArch: string
  cpuCores: number
  totalMemory: number
  freeMemory: number
  usedMemory: number
}

// 仪表盘统计数据
export interface DashboardStats {
  totalRules: number
  totalUsers: number
  todayExecutions: number
  successRate: number
  activeRules: number
  runningDays: number
}
