import { get, put } from '../utils/request'
import { PageResult } from './boardGame'

export interface Space {
  id: number
  storeId: number
  spaceName: string
  spaceType: string // PRIVATE_ROOM | HALL | TABLE
  capacity: number
  pricePerHour: number
  status: number // 0空闲 1使用中 2维护中
  remark: string
}

export interface SpaceOrder {
  id: number
  spaceId: number
  startTime: string
  endTime: string
  status: number
}

/** 空间+时间范围内订单列表 */
export interface SpaceVO extends Space {
  orders: SpaceOrder[]
}

export interface SpaceAvailableParams {
  storeId: number
  spaceType?: string
  queryDate?: string // YYYY-MM-DD
  current?: number
  size?: number
}

/** 获取店铺空间列表 */
export function getSpaceList(storeId: number): Promise<Space[]> {
  return get<Space[]>('/api/space/list', { storeId })
}

/** 空闲时间分页查询（空间+时间范围内订单列表） */
export function getSpaceAvailable(params: SpaceAvailableParams): Promise<PageResult<SpaceVO>> {
  return get<PageResult<SpaceVO>>('/api/space/available', params)
}

/** 获取空间详情 */
export function getSpaceDetail(id: number): Promise<Space> {
  return get<Space>(`/api/space/${id}`)
}

/** 更新空间状态 */
export function updateSpaceStatus(id: number, status: number): Promise<void> {
  return put<void>(`/api/space/${id}/status?status=${status}`)
}
