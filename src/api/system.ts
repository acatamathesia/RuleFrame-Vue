import request from './request'
import type { SystemInfo, DashboardStats, ApiResponse } from './types'

/**
 * 获取系统信息
 */
export function getSystemInfo(): Promise<ApiResponse<SystemInfo>> {
  return request.get('/system/info')
}

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return request.get('/system/dashboard')
}

/**
 * 健康检查
 */
export function healthCheck(): Promise<ApiResponse<string>> {
  return request.get('/system/health')
}
