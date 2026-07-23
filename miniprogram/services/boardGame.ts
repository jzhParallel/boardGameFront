import { get } from '../utils/request'

export interface BoardGame {
  id: number
  gameName: string
  category: string
  minPlayers: number
  maxPlayers: number
  playTime: number
  minAge: number
  difficulty: number // 1-5
  coverImage: string
  description: string
  status: number // 1正常 0下架
}

export interface StoreGame {
  id: number
  storeId: number
  gameId: number
  quantity: number
  location: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/** 分页查询桌游 */
export function getBoardGamePage(params: {
  current?: number
  size?: number
  keyword?: string
  category?: string
}): Promise<PageResult<BoardGame>> {
  return get<PageResult<BoardGame>>('/api/board-game/page', params)
}

/** 获取桌游详情 */
export function getBoardGameDetail(id: number): Promise<BoardGame> {
  return get<BoardGame>(`/api/board-game/${id}`)
}

/** 获取店铺桌游库存列表 */
export function getStoreGameList(storeId: number): Promise<StoreGame[]> {
  return get<StoreGame[]>('/api/board-game/store-game/list', { storeId })
}
