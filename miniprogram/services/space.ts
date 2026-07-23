import { get, put } from '../utils/request'

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

/** 获取店铺空间列表 */
export function getSpaceList(storeId: number): Promise<Space[]> {
  return get<Space[]>('/api/space/list', { storeId })
}

/** 获取空间详情 */
export function getSpaceDetail(id: number): Promise<Space> {
  return get<Space>(`/api/space/${id}`)
}

/** 更新空间状态 */
export function updateSpaceStatus(id: number, status: number): Promise<void> {
  return put<void>(`/api/space/${id}/status?status=${status}`)
}
