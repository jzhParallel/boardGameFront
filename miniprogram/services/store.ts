import { get } from '../utils/request'

export interface Store {
  id: number
  storeName: string
  address: string
  phone: string
  businessHours: string
  status: number
}

/** 获取店铺详情 */
export function getStoreDetail(id: number): Promise<Store> {
  return get<Store>(`/api/store/${id}`)
}

/** 获取所有店铺列表 */
export function getStoreList(): Promise<Store[]> {
  return get<Store[]>('/api/store/list')
}
