import request from './request'
import type { ApiResponse } from './types'

// 字典类型
export interface DictType {
    id?: number
    dictName: string
    dictCode: string
    status?: number
    sort?: number
    remark?: string
    createTime?: string
    updateTime?: string
}

// 字典数据
export interface DictData {
    id?: number
    dictTypeId: number
    dictLabel: string
    dictValue: string
    dictSort?: number
    status?: number
    remark?: string
    createTime?: string
    updateTime?: string
}

// ========== 字典类型 API ==========

/**
 * 分页查询字典类型
 */
export function getDictTypePage(params: {
    dictName?: string
    pageNum: number
    pageSize: number
}) {
    return request.get('/dict-types/page', { params })
}

/**
 * 查询所有启用的字典类型
 */
export function getAllDictTypes() {
    return request.get<DictType[]>('/dict-types/all')
}

/**
 * 根据ID查询字典类型
 */
export function getDictTypeById(id: number) {
    return request.get<DictType>(`/dict-types/${id}`)
}

/**
 * 创建字典类型
 */
export function createDictType(data: DictType) {
    return request.post('/dict-types', data)
}

/**
 * 更新字典类型
 */
export function updateDictType(id: number, data: DictType) {
    return request.put(`/dict-types/${id}`, data)
}

/**
 * 删除字典类型
 */
export function deleteDictType(id: number) {
    return request.delete(`/dict-types/${id}`)
}

/**
 * 更新字典类型状态
 */
export function updateDictTypeStatus(id: number, status: number) {
    return request.put(`/dict-types/${id}/status`, { status })
}

// ========== 字典数据 API ==========

/**
 * 分页查询字典数据
 */
export function getDictDataPage(params: {
    dictTypeId: number
    dictLabel?: string
    pageNum: number
    pageSize: number
}) {
    return request.get('/dict-data/page', { params })
}

/**
 * 根据字典类型编码查询字典数据
 */
export function getDictDataByTypeCode(dictCode: string) {
    return request.get<DictData[]>(`/dict-data/type/${dictCode}`)
}

/**
 * 根据ID查询字典数据
 */
export function getDictDataById(id: number) {
    return request.get<DictData>(`/dict-data/${id}`)
}

/**
 * 创建字典数据
 */
export function createDictData(data: DictData) {
    return request.post('/dict-data', data)
}

/**
 * 更新字典数据
 */
export function updateDictData(id: number, data: DictData) {
    return request.put(`/dict-data/${id}`, data)
}

/**
 * 删除字典数据
 */
export function deleteDictData(id: number) {
    return request.delete(`/dict-data/${id}`)
}

/**
 * 更新字典数据状态
 */
export function updateDictDataStatus(id: number, status: number) {
    return request.put(`/dict-data/${id}/status`, { status })
}
