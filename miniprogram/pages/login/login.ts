import { wxLogin } from '../../services/auth'
import { getStoreList, Store } from '../../services/store'
import { getTenantList, Tenant } from '../../services/tenant'
import { DEFAULT_STORE_ID } from '../../config'
import { isLoggedIn, getUserInfo, clearToken } from '../../utils/auth'

const app = getApp<IAppOption>()

Page({
  data: {
    /** 登录状态：selecting 选择商户 | loading 登录中 | error 登录失败 */
    status: 'selecting' as 'selecting' | 'loading' | 'error',
    errorMsg: '',
    tenants: [] as Tenant[],
    tenantNames: ['请选择要登录的商户'],
    selectedTenantIndex: 0,
    selectedTenantId: 0,
    selectedTenantName: '',
    showTenantModal: false,
  },

  async onLoad() {
    // 已有有效登录态，恢复用户信息并直接进入首页
    if (isLoggedIn()) {
      const info = getUserInfo()
      if (info) {
        app.globalData.userInfo = {
          userId: info.userId,
          account: info.account,
          nickname: info.nickname,
          avatar: info.avatar,
          role: info.role,
          tenantId: info.tenantId,
          storeId: info.storeId,
        }
        app.globalData.storeId = info.storeId || 1
      }
      try {
        await this.loadFirstStore()
        wx.switchTab({ url: '/pages/user/home/home' })
      } catch (err: any) {
        console.warn('加载店铺列表失败:', err)
        if (!isLoggedIn()) {
          this.loadTenants()
          return
        }
        await this.restoreTenantSelectionAfterStoreError(err, false)
      }
      return
    }
    // 未登录，先加载商户列表，由用户选择商户后再登录
    this.loadTenants()
  },

  /** 加载可登录商户列表 */
  async loadTenants() {
    this.setData({ status: 'selecting', errorMsg: '' })

    try {
      const tenants = await getTenantList()
      this.setData({
        tenants,
        tenantNames: ['请选择要登录的商户', ...tenants.map((tenant) => tenant.tenantName)],
        selectedTenantIndex: 0,
        selectedTenantId: 0,
        selectedTenantName: '',
        showTenantModal: false,
      })
      if (tenants.length === 0) {
        this.setData({
          status: 'error',
          errorMsg: '暂无可登录商户，请联系管理员',
        })
      }
    } catch (err: any) {
      console.error('加载商户列表失败:', err)
      this.setData({
        status: 'error',
        errorMsg: err?.message || '加载商户列表失败，请重试',
      })
    }
  },

  onOpenTenantModal() {
    if (this.data.tenants.length === 0) {
      wx.showToast({ title: '暂无可选择商户', icon: 'none' })
      return
    }
    this.setData({ showTenantModal: true })
  },

  onCloseTenantModal() {
    this.setData({ showTenantModal: false })
  },

  noop() {},

  onTenantSelect(e: WechatMiniprogram.BaseEvent) {
    const index = Number(e.currentTarget.dataset.index)
    const tenant = this.data.tenants[index]
    if (!tenant) {
      return
    }
    this.setData({
      selectedTenantIndex: index + 1,
      selectedTenantId: tenant.id,
      selectedTenantName: tenant.tenantName,
      errorMsg: '',
      showTenantModal: false,
    })
  },

  /** 选择商户 */
  onTenantChange(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    const index = Number(e.detail.value)
    if (index === 0) {
      this.setData({
        selectedTenantIndex: 0,
        selectedTenantId: 0,
        selectedTenantName: '',
        errorMsg: '',
      })
      return
    }
    const tenant = this.data.tenants[index - 1]
    if (!tenant) {
      return
    }
    this.setData({
      selectedTenantIndex: index,
      selectedTenantId: tenant.id,
      selectedTenantName: tenant.tenantName,
      errorMsg: '',
    })
  },

  /** 触发微信登录流程 */
  async doLogin() {
    if (!this.data.selectedTenantId) {
      wx.showToast({ title: '请先选择商户', icon: 'none' })
      return
    }

    this.setData({ status: 'loading', errorMsg: '' })

    try {
      // 1. 调用 wx.login 获取临时登录凭证 code
      const code = await this.getWxCode()
      // 2. 将 code 发送到后端换取 token
      const loginRes = await wxLogin(code, this.data.selectedTenantId)
      // 3. 更新全局用户信息
      app.globalData.userInfo = {
        userId: loginRes.userId,
        account: loginRes.account,
        nickname: loginRes.nickname,
        avatar: loginRes.avatar,
        role: loginRes.role,
        tenantId: loginRes.tenantId,
        storeId: loginRes.storeId,
      }
      app.globalData.storeId = loginRes.storeId || 1
      await this.loadFirstStore()
      // 4. 登录成功，跳转到目标页面
      this.navigateAfterLogin()
    } catch (err: any) {
      console.error('登录失败:', err)
      await this.restoreTenantSelectionAfterStoreError(err, true)
    }
  },

  /** 获取当前商户第一个店铺 */
  async restoreTenantSelectionAfterStoreError(err: any, keepSelectedTenant: boolean) {
    const errorMsg = err?.message || '登录后加载店铺列表失败，请选择其他商户或稍后重试'
    this.clearFailedLoginState()

    if (this.data.tenants.length === 0) {
      await this.loadTenants()
      if (this.data.status !== 'selecting') {
        return
      }
    }

    this.setData({
      status: 'selecting',
      errorMsg,
      showTenantModal: false,
      ...(keepSelectedTenant
        ? {}
        : {
            selectedTenantIndex: 0,
            selectedTenantId: 0,
            selectedTenantName: '',
          }),
    })
  },

  clearFailedLoginState() {
    clearToken()
    app.globalData.userInfo = null
    app.globalData.currentStore = null
    app.globalData.storeId = DEFAULT_STORE_ID
  },

  async loadFirstStore() {
    const stores = await getStoreList()
    const firstStore = stores[0]
    if (!firstStore) {
      throw new Error('当前商户暂无可用店铺，请联系管理员')
    }
    this.setCurrentStore(firstStore)
  },

  /** 保存当前展示店铺 */
  setCurrentStore(store: Store) {
    app.globalData.currentStore = store
    app.globalData.storeId = store.id
    if (app.globalData.userInfo) {
      app.globalData.userInfo.storeId = store.id
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
    if (this.data.selectedTenantId) {
      this.doLogin()
      return
    }
    this.loadTenants()
  },
})
