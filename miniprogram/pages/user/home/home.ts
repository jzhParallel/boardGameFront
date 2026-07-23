import { getStoreDetail, Store } from '../../../services/store'
import { getSpaceList, Space } from '../../../services/space'
import { DEFAULT_STORE_ID } from '../../../config'

Component({
  data: {
    store: null as Store | null,
    spaces: [] as Space[],
    idleCount: 0,
    loading: true,
    quickActions: [
      { icon: '▦', text: '预约', path: '/pages/user/reservation/reservation' },
      { icon: '♟', text: '浏览桌游', path: '/pages/user/games/games' },
      { icon: '✦', text: 'AI助手', path: '/pages/user/ai-assistant/ai-assistant' },
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
        const storeId = DEFAULT_STORE_ID
        const [store, spaces] = await Promise.all([
          getStoreDetail(storeId),
          getSpaceList(storeId),
        ])
        const idleCount = spaces.filter(s => s.status === 0).length
        this.setData({ store, spaces, idleCount, loading: false })
      } catch (err) {
        console.warn('加载首页数据失败:', err)
        this.setData({ loading: false })
      }
    },

    onQuickAction(e: any) {
      const { path } = e.currentTarget.dataset
      wx.switchTab({ url: path })
    },

    onPullDownRefresh() {
      this.loadData().then(() => {
        wx.stopPullDownRefresh()
      })
    },
  },
})
