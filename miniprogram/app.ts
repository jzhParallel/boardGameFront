import { isLoggedIn, getUserInfo } from './utils/auth'

App<IAppOption>({
  globalData: {
    userInfo: null,
    storeId: 1, // 默认店铺ID
  },

  onLaunch() {
    // 登录页为入口页，负责登录态校验与微信登录流程
    // 此处仅恢复已有登录态的用户信息
    if (isLoggedIn()) {
      const info = getUserInfo()
      if (info) {
        this.globalData.userInfo = {
          userId: info.userId,
          account: info.account,
          nickname: info.nickname,
          avatar: info.avatar,
          role: info.role,
          tenantId: info.tenantId,
          storeId: info.storeId,
        }
        this.globalData.storeId = info.storeId || 1
      }
    }

    wx.login({
      success: (res) => {
        if (res.code) {
          wxLogin(res.code)
            .then((loginRes) => {
              this.globalData.userInfo = {
                userId: loginRes.userId,
                account: loginRes.account,
                nickname: loginRes.nickname,
                avatar: loginRes.avatar,
                role: loginRes.role,
                tenantId: loginRes.tenantId,
                storeId: loginRes.storeId,
              }
              this.globalData.storeId = loginRes.storeId || 1
            })
            .catch((err) => {
              console.warn('静默登录失败:', err)
            })
        }
      },
    })
  },
})
