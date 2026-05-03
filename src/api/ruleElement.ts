import request from './request'
import type { ApiResponse, PageResult } from './types'

// 规则元素接口定义
export interface SetElementDTO {
    id: number
    code: string
    elementName: string
    elementPath: string
    needConvert: boolean
    dataType: string
    updateTime: string
}

// 分页查询请求
export interface SetElementQueryRequest {
    keyword?: string
    dataType?: string
    pageNum: number
    pageSize: number
}

// 创建请求
export interface SetElementCreateRequest {
    code: string
    name: string
    elPath: string
    converted: number
    convertType: string
    enabled?: number
}

// 更新请求
export interface SetElementUpdateRequest {
    id?: number
    code: string
    name: string
    elPath: string
    converted: number
    convertType: string
    enabled?: number
}

/**
 * 条件分页查询规则元素
 */
export function pageQueryRuleElements(data: SetElementQueryRequest) {
    return request<PageResult<SetElementDTO>>({
        url: '/rule-elements/page',
        method: 'post',
        data
    })
}

/**
 * 查询所有规则元素
 */
export function listAllRuleElements() {
    return request<SetElementDTO[]>({
        url: '/rule-elements/all',
        method: 'get'
    })
}

/**
 * 根据ID查询
 */
export function getRuleElementById(id: number) {
    return request<SetElementDTO>({
        url: `/rule-elements/${id}`,
        method: 'get'
    })
}

/**
 * 创建规则元素
 */
export function createRuleElement(data: SetElementCreateRequest) {
    return request<SetElementDTO>({
        url: '/rule-elements',
        method: 'post',
        data
    })
}

/**
 * 更新规则元素
 */
export function updateRuleElement(id: number, data: SetElementUpdateRequest) {
    return request<SetElementDTO>({
        url: `/rule-elements/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除规则元素
 */
export function deleteRuleElement(id: number) {
    return request({
        url: `/rule-elements/${id}`,
        method: 'delete'
    })
}

/**
 * 批量删除规则元素
 */
export function batchDeleteRuleElements(ids: number[]) {
    return request({
        url: '/rule-elements/batch',
        method: 'delete',
        data: ids
    })
}
