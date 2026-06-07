import request from './request'
import type { ApiResponse, PageResult } from './types'

// ===== DTO 类型 =====

export interface RuleGroupDTO {
  id: number
  groupCode: string
  groupName: string
  strategy: string
  description: string
  status: number
  createTime: string
  updateTime: string
}

// ===== 请求类型 =====

export interface RuleGroupQueryRequest {
  keyword?: string
  pageNum: number
  pageSize: number
}

export interface RuleGroupCreateRequest {
  groupCode: string
  groupName: string
  strategy: string
  description: string
  status: number
}

export interface RuleGroupUpdateRequest {
  id?: number
  groupCode: string
  groupName: string
  strategy: string
  description: string
  status: number
}

// ===== API 方法 =====

/** 分页查询规则组 */
export function pageQueryRuleGroups(params: RuleGroupQueryRequest) {
  return request<PageResult<RuleGroupDTO>>({
    url: '/rule-groups/page',
    method: 'get',
    params,
  })
}

/** 查询所有规则组 */
export function listAllRuleGroups() {
  return request<RuleGroupDTO[]>({
    url: '/rule-groups/all',
    method: 'get',
  })
}

/** 根据ID查询规则组 */
export function getRuleGroupById(id: number) {
  return request<RuleGroupDTO>({
    url: '/rule-groups/' + id,
    method: 'get',
  })
}

/** 创建规则组 */
export function createRuleGroup(data: RuleGroupCreateRequest) {
  return request<RuleGroupDTO>({
    url: '/rule-groups',
    method: 'post',
    data,
  })
}

/** 更新规则组 */
export function updateRuleGroup(id: number, data: RuleGroupUpdateRequest) {
  return request<RuleGroupDTO>({
    url: '/rule-groups/' + id,
    method: 'put',
    data,
  })
}

/** 删除规则组 */
export function deleteRuleGroup(id: number) {
  return request<void>({
    url: '/rule-groups/' + id,
    method: 'delete',
  })
}
