import { get, post, put } from '../utils/request'
import { PageResult } from './boardGame'

export interface BoardOrder {
  id: number
  storeId: number
  spaceId: number
  customerId: number
  customerName: string
  startTime: string
  endTime: string
  totalAmount: number
  status: number // 0进行中 1已完成 2已取消
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
  endTime: string
  totalAmount: number
  remark?: string
  gameIds?: number[]
}

/** 创建订单 */
export function createOrder(data: CreateOrderDTO): Promise<BoardOrder> {
  return post<BoardOrder>('/api/order', data)
}

/** 获取订单详情（含桌游） */
export function getOrderDetail(id: number): Promise<OrderVO> {
  return get<OrderVO>(`/api/order/${id}`)
}

/** 分页查询订单 */
export function getOrderPage(params: {
  current?: number
  size?: number
  storeId?: number
  status?: number
}): Promise<PageResult<BoardOrder>> {
  return get<PageResult<BoardOrder>>('/api/order/page', params)
}

/** 完成订单 */
export function completeOrder(id: number): Promise<void> {
  return put<void>(`/api/order/${id}/complete`)
}

/** 取消订单 */
export function cancelOrder(id: number): Promise<void> {
  return put<void>(`/api/order/${id}/cancel`)
}
