import { get } from '../utils/request'
import { resolveAssetUrl } from '../utils/asset'

export interface BoardGame {
  id: number
  gameName: string
  category: string
  minPlayers: number
  maxPlayers: number
  playTime: number
  minAge: number
  difficulty: number
  coverImage: string
  description: string
  status: number
}

export interface BoardGameRule {
  id?: number
  gameId: number
  content: string
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

export function getBoardGamePage(params: {
  current?: number
  size?: number
  keyword?: string
  category?: string
}): Promise<PageResult<BoardGame>> {
  return get<PageResult<BoardGame>>('/api/board-game/page', params).then(res => ({
    ...res,
    records: (res.records || []).map(normalizeBoardGame),
  }))
}

export function getBoardGameDetail(id: number): Promise<BoardGame> {
  return get<BoardGame>(`/api/board-game/${id}`).then(normalizeBoardGame)
}

export function getBoardGameRule(id: number): Promise<BoardGameRule> {
  return get<BoardGameRule>(`/api/board-game/${id}/rule`).then(rule => ({
    ...rule,
    content: rule?.content || '',
  }))
}

export function getStoreGameList(storeId: number): Promise<StoreGame[]> {
  return get<StoreGame[]>('/api/board-game/store-game/list', { storeId })
}

function normalizeBoardGame(game: BoardGame): BoardGame {
  return {
    ...game,
    coverImage: resolveAssetUrl(game?.coverImage),
  }
}
