import { get, put } from '../utils/request'
import { PageResult } from './boardGame'
import { resolveAssetUrl } from '../utils/asset'

export type PricingRuleType = 'HOURLY' | 'PACKAGE' | 'TICKET'

export interface PricingPackageRule {
  hours: number
  price: number
}

export interface Space {
  id: number
  storeId: number
  spaceName: string
  spaceType: string
  spaceImage: string
  capacity: number
  pricePerHour: number
  capacityControlEnabled: boolean
  maxConcurrentBookings: number
  pricingRuleType: PricingRuleType
  packageRulesJson: string
  packageRules: PricingPackageRule[]
  ticketPrice: number
  status: number
  remark: string
}

export interface SpaceOrder {
  id: number
  spaceId: number
  startTime: string
  endTime: string
  status: number
}

export interface SpaceVO extends Space {
  orders: SpaceOrder[]
}

export interface SpaceAvailableParams {
  storeId: number
  spaceType?: string
  queryDate?: string
  current?: number
  size?: number
}

export function getSpaceList(storeId: number): Promise<Space[]> {
  return get<Space[]>('/api/space/list', { storeId }).then(list => (list || []).map(normalizeSpace))
}

export function getSpaceAvailable(params: SpaceAvailableParams): Promise<PageResult<SpaceVO>> {
  return get<PageResult<SpaceVO>>('/api/space/available', params).then(res => ({
    ...res,
    records: (res.records || []).map(item => normalizeSpace(item) as SpaceVO),
  }))
}

export function getSpaceDetail(id: number): Promise<Space> {
  return get<Space>(`/api/space/${id}`).then(normalizeSpace)
}

export function updateSpaceStatus(id: number, status: number): Promise<void> {
  return put<void>(`/api/space/${id}/status?status=${status}`)
}

function normalizeSpace<T extends Space>(space: T): T {
  return {
    ...space,
    spaceImage: resolveAssetUrl(space?.spaceImage),
    capacityControlEnabled: Boolean(space?.capacityControlEnabled),
    pricingRuleType: (space?.pricingRuleType || 'HOURLY') as PricingRuleType,
    packageRules: parsePackageRules(space?.packageRulesJson),
  }
}

function parsePackageRules(packageRulesJson?: string): PricingPackageRule[] {
  if (!packageRulesJson) return []
  try {
    const rules = JSON.parse(packageRulesJson)
    return Array.isArray(rules) ? rules : []
  } catch (error) {
    return []
  }
}
