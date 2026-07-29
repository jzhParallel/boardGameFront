/// <reference path="./types/index.d.ts" />

interface AppUserInfo {
  userId: number
  account: string
  nickname: string
  avatar?: string
  role: string
  tenantId: number
  storeId: number | null
}

interface AppStoreInfo {
  id: number
  storeName: string
  address: string
  phone: string
  storeAvatar: string
  openTime: string
  closeTime: string
  status: number
}

interface IAppOption {
  globalData: {
    userInfo?: AppUserInfo | null
    storeId: number
    currentStore?: AppStoreInfo | null
    aiQuestion?: string
  }
}
