const TOKEN_KEY = 'auth_token'
const USER_INFO_KEY = 'user_info'

export interface UserInfo {
  userId: number
  account: string
  nickname: string
  avatar?: string
  role: string // ADMIN | STAFF | CUSTOMER
  tenantId: number
  storeId: number | null
}

/** 获取 token */
export function getToken(): string {
  return wx.getStorageSync(TOKEN_KEY) || ''
}

/** 保存 token */
export function setToken(token: string): void {
  wx.setStorageSync(TOKEN_KEY, token)
}

/** 清除 token */
export function clearToken(): void {
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(USER_INFO_KEY)
}

/** 获取用户信息 */
export function getUserInfo(): UserInfo | null {
  const data = wx.getStorageSync(USER_INFO_KEY)
  return data || null
}

/** 保存用户信息 */
export function setUserInfo(info: UserInfo): void {
  wx.setStorageSync(USER_INFO_KEY, info)
}

/** 是否已登录 */
export function isLoggedIn(): boolean {
  return !!getToken()
}

/** 是否为店员/管理员 */
export function isStaff(): boolean {
  const info = getUserInfo()
  return info?.role === 'STAFF' || info?.role === 'ADMIN'
}
