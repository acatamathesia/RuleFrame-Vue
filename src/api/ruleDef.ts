import request from './request'
import type { ApiResponse, PageResult } from './types'

// ===== DTO 类型 =====

export interface RuleDefDTO {
  id: number
  groupId: number
  ruleCode: string
  ruleName: string
  priority: number
  conditionsJson: string
  resultAction: string
  resultMessage: string
  unifiedReturn: number
  status: number
  createTime: string
  updateTime: string
}

// ===== 请求类型 =====

export interface RuleDefQueryRequest {
  keyword?: string
  groupId?: number
  pageNum: number
  pageSize: number
}

export interface RuleDefCreateRequest {
  groupId: number
  ruleCode: string
  ruleName: string
  priority: number
  conditionsJson: string
  resultAction: string
  resultMessage: string
  unifiedReturn: number
  status: number
}

export interface RuleDefUpdateRequest {
  id?: number
  groupId: number
  ruleCode: string
  ruleName: string
  priority: number
  conditionsJson: string
  resultAction: string
  resultMessage: string
  unifiedReturn: number
  status: number
}

// ===== API 方法 =====

/** 分页查询规则定义 */
export function pageQueryRuleDefs(params: RuleDefQueryRequest) {
  return request<PageResult<RuleDefDTO>>({
    url: '/rule-defs/page',
    method: 'get',
    params,
  })
}

/** 根据规则组编码查询规则定义列表 */
export function listRuleDefsByGroupCode(groupCode: string) {
  return request<RuleDefDTO[]>({
    url: '/rule-defs/group/' + groupCode,
    method: 'get',
  })
}

/** 根据ID查询规则定义 */
export function getRuleDefById(id: number) {
  return request<RuleDefDTO>({
    url: '/rule-defs/' + id,
    method: 'get',
  })
}

/** 创建规则定义 */
export function createRuleDef(data: RuleDefCreateRequest) {
  return request<RuleDefDTO>({
    url: '/rule-defs',
    method: 'post',
    data,
  })
}

/** 更新规则定义 */
export function updateRuleDef(id: number, data: RuleDefUpdateRequest) {
  return request<RuleDefDTO>({
    url: '/rule-defs/' + id,
    method: 'put',
    data,
  })
}

/** 删除规则定义 */
export function deleteRuleDef(id: number) {
  return request<void>({
    url: '/rule-defs/' + id,
    method: 'delete',
  })
}
