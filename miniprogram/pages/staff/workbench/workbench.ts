import { getOrderPage } from '../../../services/order'
import { DEFAULT_STORE_ID } from '../../../config'

Component({
  data: {
    todayOrders: 0,
    activeOrders: 0,
    actions: [
      { icon: '📝', text: '新预约', path: '/pages/staff/reservation-mgmt/reservation-mgmt' },
      { icon: '📤', text: '借出桌游', path: '/pages/staff/games/games' },
      { icon: '📥', text: '归还桌游', path: '/pages/staff/games/games' },
      { icon: '🎫', text: '核销券', action: 'verify' },
    ],
    showVerify: false,
    verifyCode: '',
    verifyResult: '' as '' | 'success' | 'fail',
  },

  lifetimes: {
    attached() {
      this.loadStats()
    },
  },

  methods: {
    async loadStats() {
      try {
        const res = await getOrderPage({ storeId: DEFAULT_STORE_ID, size: 100 })
        const today = new Date().toISOString().substring(0, 10)
        const todayOrders = res.records.filter(o => (o.createTime || '').startsWith(today)).length
        const activeOrders = res.records.filter(o => o.status === 0).length
        this.setData({ todayOrders, activeOrders })
      } catch (err) {
        console.warn('加载统计失败:', err)
      }
    },

    onActionTap(e: any) {
      const { path, action } = e.currentTarget.dataset
      if (action === 'verify') {
        this.setData({ showVerify: true, verifyCode: '', verifyResult: '' })
        return
      }
      if (path) {
        wx.navigateTo({ url: path })
      }
    },

    onGoReservation() {
      wx.navigateTo({ url: '/pages/staff/reservation-mgmt/reservation-mgmt' })
    },

    onGoGames() {
      wx.navigateTo({ url: '/pages/staff/games/games' })
    },

    // 核销券
    onVerifyInput(e: any) {
      this.setData({ verifyCode: e.detail.value })
    },

    onVerifySubmit() {
      const code = this.data.verifyCode.trim()
      if (!code) {
        wx.showToast({ title: '请输入券码', icon: 'none' })
        return
      }
      // 模拟核销：以 "BG" 开头的券码为有效
      const success = code.toUpperCase().startsWith('BG')
      this.setData({ verifyResult: success ? 'success' : 'fail' })
      if (success) {
        wx.showToast({ title: '核销成功！', icon: 'success' })
      }
    },

    onVerifyClose() {
      this.setData({ showVerify: false, verifyCode: '', verifyResult: '' })
    },
  },
})
