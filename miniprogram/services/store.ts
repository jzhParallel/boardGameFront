import { get } from '../utils/request'
import { resolveAssetUrl } from '../utils/asset'

export interface Store {
  id: number
  storeName: string
  address: string
  phone: string
  storeAvatar: string
  openTime: string
  closeTime: string
  status: number
}

/** 获取店铺详情 */
export function getStoreDetail(id: number): Promise<Store> {
  return get<Store>(`/api/store/${id}`).then(normalizeStore)
}

/** 获取所有店铺列表 */
export function getStoreList(): Promise<Store[]> {
  return get<Store[]>('/api/store/list').then(list => (list || []).map(normalizeStore))
}

function normalizeStore(store: Store): Store {
  return {
    ...store,
    storeAvatar: resolveAssetUrl(store?.storeAvatar),
  }
}
