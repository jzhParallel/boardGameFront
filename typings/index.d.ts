/// <reference path="./types/index.d.ts" />

interface AppUserInfo {
  userId: number
  account: string
  nickname: string
  role: string
  tenantId: number
  storeId: number | null
}

interface IAppOption {
  globalData: {
    userInfo?: AppUserInfo | null
    storeId: number
    aiQuestion?: string
  }
  silentLogin(): void
}