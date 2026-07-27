import { wxLogin } from '../../services/auth'
import { isLoggedIn, getUserInfo } from '../../utils/auth'

const app = getApp<IAppOption>()

Page({
  data: {
    /** 登录状态：loading 登录中 | error 登录失败 */
    status: 'loading' as 'loading' | 'error',
    errorMsg: '',
  },

  onLoad() {
    // 已有有效登录态，恢复用户信息并直接进入首页
    if (isLoggedIn()) {
      const info = getUserInfo()
      if (info) {
        app.globalData.userInfo = {
          userId: info.userId,
          account: info.account,
          nickname: info.nickname,
          role: info.role,
          tenantId: info.tenantId,
          storeId: info.storeId,
        }
        app.globalData.storeId = info.storeId || 1
      }
      wx.switchTab({ url: '/pages/user/home/home' })
      return
    }
    // 未登录，自动触发微信登录流程
    this.doLogin()
  },

  /** 触发微信登录流程 */
  async doLogin() {
    this.setData({ status: 'loading', errorMsg: '' })

    try {
      // 1. 调用 wx.login 获取临时登录凭证 code
      const code = await this.getWxCode()
      // 2. 将 code 发送到后端换取 token
      const loginRes = await wxLogin(code)
      // 3. 更新全局用户信息
      app.globalData.userInfo = {
        userId: loginRes.userId,
        account: loginRes.account,
        nickname: loginRes.nickname,
        role: loginRes.role,
        tenantId: loginRes.tenantId,
        storeId: loginRes.storeId,
      }
      app.globalData.storeId = loginRes.storeId || 1
      // 4. 登录成功，跳转到目标页面
      this.navigateAfterLogin()
    } catch (err: any) {
      console.error('登录失败:', err)
      this.setData({
        status: 'error',
        errorMsg: err?.message || '登录失败，请重试',
      })
    }
  },

  /** 获取微信登录凭证 */
  getWxCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject(new Error('获取微信登录凭证失败'))
          }
        },
        fail: () => reject(new Error('微信登录调用失败')),
      })
    })
  },

  /** 登录成功后的页面跳转 */
  navigateAfterLogin() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      // 由其他页面跳转而来，返回原页面
      wx.navigateBack()
    } else {
      // 直接进入登录页（如应用启动时），跳转到首页
      wx.switchTab({ url: '/pages/user/home/home' })
    }
  },

  /** 重试登录 */
  onRetry() {
    this.doLogin()
  },
})
