import { get, post, put } from '../utils/request'
import { PageResult } from './boardGame'
import { PricingRuleType } from './space'

export interface BoardOrder {
  id: number
  storeId: number
  spaceId: number
  customerId: number
  customerName: string
  startTime: string
  endTime: string
  totalAmount: number
  status: number
  remark: string
  createTime: string
}

export interface OrderGame {
  id: number
  orderId: number
  gameId: number
  gameName: string
}

export interface OrderVO extends BoardOrder {
  games: OrderGame[]
}

export interface CreateOrderDTO {
  storeId: number
  spaceId: number
  customerId: number
  customerName: string
  startTime: string
  endTime?: string
  packageHours?: number
  totalAmount: number
  remark?: string
  gameIds?: number[]
}

export interface OrderAmountPreview {
  totalAmount: number
  pricingRuleType: PricingRuleType
  pricingDescription: string
  startTime: string
  endTime: string
}

export function createOrder(data: CreateOrderDTO): Promise<BoardOrder> {
  return post<BoardOrder>('/api/order', data)
}

export function previewOrderAmount(data: CreateOrderDTO): Promise<OrderAmountPreview> {
  return post<OrderAmountPreview>('/api/order/preview-amount', data)
}

export function getOrderDetail(id: number): Promise<OrderVO> {
  return get<OrderVO>(`/api/order/${id}`)
}

export function getOrderPage(params: {
  current?: number
  size?: number
  storeId?: number
  status?: number
}): Promise<PageResult<BoardOrder>> {
  return get<PageResult<BoardOrder>>('/api/order/page', params)
}

export function completeOrder(id: number): Promise<void> {
  return put<void>(`/api/order/${id}/complete`)
}

export function cancelOrder(id: number): Promise<void> {
  return put<void>(`/api/order/${id}/cancel`)
}
