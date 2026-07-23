import { getStoreDetail, Store } from '../../../services/store'
import { DEFAULT_STORE_ID } from '../../../config'

Component({
  data: {
    store: null as Store | null,
    loading: true,
    quickActions: [
      { icon: '▦', text: '预约', path: '/pages/user/reservation/reservation' },
      { icon: '♟', text: '浏览桌游', path: '/pages/user/games/games' },
    ],
  },

  lifetimes: {
    attached() {
      this.loadData()
    },
  },

  pageLifetimes: {
    show() {
      // 设置 tabBar 选中态
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 0 })
      }
    },
  },

  methods: {
    async loadData() {
      this.setData({ loading: true })
      try {
        const store = await getStoreDetail(DEFAULT_STORE_ID)
        this.setData({ store, loading: false })
      } catch (err) {
        console.warn('加载首页数据失败:', err)
        this.setData({ loading: false })
      }
    },

    onQuickAction(e: any) {
      const { path } = e.currentTarget.dataset
      wx.navigateTo({ url: path })
    },

    onPullDownRefresh() {
      this.loadData().then(() => {
        wx.stopPullDownRefresh()
      })
    },
  },
})
