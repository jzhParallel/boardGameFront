import { getOrderPage, BoardOrder } from '../../../services/order'
import { getUserInfo, isStaff, clearToken } from '../../../utils/auth'
import { DEFAULT_STORE_ID } from '../../../config'

Component({
  data: {
    nickname: '微信用户',
    orders: [] as BoardOrder[],
    loading: true,
    showStaffEntry: false,
    statusMap: { 0: '进行中', 1: '已完成', 2: '已取消' } as Record<number, string>,
  },

  lifetimes: {
    attached() {
      const info = getUserInfo()
      if (info) {
        this.setData({ nickname: info.nickname || '微信用户' })
      }
      this.loadOrders()
    },
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 4 })
      }
      // 每次显示时检查是否为店员
      this.setData({ showStaffEntry: isStaff() })
    },
  },

  methods: {
    async loadOrders() {
      this.setData({ loading: true })
      try {
        const res = await getOrderPage({ storeId: DEFAULT_STORE_ID, size: 20 })
        this.setData({ orders: res.records, loading: false })
      } catch (err) {
        console.warn('加载订单失败:', err)
        this.setData({ loading: false })
      }
    },

    onGoStaff() {
      wx.navigateTo({ url: '/pages/staff/workbench/workbench' })
    },

    onStaffLogin() {
      // 简易店员登录弹窗
      wx.showModal({
        title: '店员登录',
        editable: true,
        placeholderText: '请输入账号',
        success: (res) => {
          if (res.confirm && res.content) {
            wx.showModal({
              title: '输入密码',
              editable: true,
              placeholderText: '请输入密码',
              success: async (res2) => {
                if (res2.confirm && res2.content) {
                  try {
                    const { login } = require('../../../services/auth')
                    await login(res.content!, res2.content!)
                    this.setData({ showStaffEntry: true })
                    wx.showToast({ title: '登录成功', icon: 'success' })
                    setTimeout(() => {
                      wx.navigateTo({ url: '/pages/staff/workbench/workbench' })
                    }, 1000)
                  } catch (e) {
                    wx.showToast({ title: '登录失败', icon: 'none' })
                  }
                }
              },
            })
          }
        },
      })
    },

    onLogout() {
      wx.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            clearToken()
            this.setData({ nickname: '微信用户', orders: [], showStaffEntry: false })
            wx.showToast({ title: '已退出', icon: 'success' })
          }
        },
      })
    },

    onPullDownRefresh() {
      this.loadOrders().then(() => wx.stopPullDownRefresh())
    },
  },
})
