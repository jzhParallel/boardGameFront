import { post } from '../utils/request'
import { setToken, setUserInfo, UserInfo } from '../utils/auth'

interface LoginVO {
  token: string
  userId: number
  account: string
  nickname: string
  role: string
  tenantId: number
  storeId: number | null
}

/** 微信登录（小程序端） */
export async function wxLogin(code: string): Promise<LoginVO> {
  const res = await post<LoginVO>('/api/auth/wx-login', { code })
  setToken(res.token)
  const userInfo: UserInfo = {
    userId: res.userId,
    account: res.account,
    nickname: res.nickname,
    role: res.role,
    tenantId: res.tenantId,
    storeId: res.storeId,
  }
  setUserInfo(userInfo)
  return res
}

/** 账号密码登录（店员/管理员） */
export async function login(account: string, password: string): Promise<LoginVO> {
  const res = await post<LoginVO>('/api/auth/login', { account, password })
  setToken(res.token)
  const userInfo: UserInfo = {
    userId: res.userId,
    account: res.account,
    nickname: res.nickname,
    role: res.role,
    tenantId: res.tenantId,
    storeId: res.storeId,
  }
  setUserInfo(userInfo)
  return res
}

/** 退出登录 */
export function logout(): Promise<void> {
  return post<void>('/api/auth/logout')
}
