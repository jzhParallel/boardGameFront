import { get } from '../utils/request'

export interface Tenant {
  id: number
  tenantName: string
  contactName?: string
  contactPhone?: string
  status: number
  expireTime?: string
}

/** 获取可登录商户列表 */
export function getTenantList(): Promise<Tenant[]> {
  return get<Tenant[]>('/api/tenant/list')
}
