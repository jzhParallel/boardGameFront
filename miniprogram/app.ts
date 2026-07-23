import { wxLogin } from './services/auth'
import { isLoggedIn, getUserInfo } from './utils/auth'

App<IAppOption>({
  globalData: {
    userInfo: null,
    storeId: 1, // 默认店铺ID
  },

  onLaunch() {
    // 静默微信登录
    this.silentLogin()
  },

  /** 微信静默登录 */
  silentLogin() {
    if (isLoggedIn()) {
      // 已有登录态，恢复用户信息
      const info = getUserInfo()
      if (info) {
        this.globalData.userInfo = {
          userId: info.userId,
          account: info.account,
          nickname: info.nickname,
          role: info.role,
          tenantId: info.tenantId,
          storeId: info.storeId,
        }
        this.globalData.storeId = info.storeId || 1
      }
      return
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
