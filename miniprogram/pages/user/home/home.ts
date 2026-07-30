import { getStoreList, Store } from '../../../services/store'
import { isLoggedIn } from '../../../utils/auth'

const app = getApp<IAppOption>()

Component({
  data: {
    store: null as Store | null,
    stores: [] as Store[],
    storeNames: [] as string[],
    selectedStoreIndex: 0,
    loading: true,
    showStoreModal: false,
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
      // 登录守卫：未登录时不发起请求，等待登录流程完成后重新进入
      if (!isLoggedIn()) {
        return
      }
      this.setData({ loading: true })
      try {
        const stores = await getStoreList()
        const store = this.resolveCurrentStore(stores)
        this.setCurrentStore(store, stores)
        this.setData({ loading: false })
      } catch (err) {
        console.warn('加载首页数据失败:', err)
        this.setData({ loading: false })
      }
    },

    resolveCurrentStore(stores: Store[]): Store {
      if (stores.length === 0) {
        throw new Error('当前商户暂无可用店铺')
      }
      const currentStoreId = app.globalData.currentStore?.id || app.globalData.storeId
      return stores.find(store => store.id === currentStoreId) || stores[0]
    },

    setCurrentStore(store: Store, stores = this.data.stores) {
      const selectedStoreIndex = stores.findIndex(item => item.id === store.id)
      app.globalData.currentStore = store
      app.globalData.storeId = store.id
      if (app.globalData.userInfo) {
        app.globalData.userInfo.storeId = store.id
      }
      this.setData({
        store,
        stores,
        storeNames: stores.map(item => item.storeName),
        selectedStoreIndex: selectedStoreIndex >= 0 ? selectedStoreIndex : 0,
        showStoreModal: false,
      })
    },

    onOpenStoreModal() {
      if (this.data.stores.length === 0) {
        wx.showToast({ title: '暂无可切换门店', icon: 'none' })
        return
      }
      this.setData({ showStoreModal: true })
    },

    onCloseStoreModal() {
      this.setData({ showStoreModal: false })
    },

    noop() {},

    onStoreSelect(e: WechatMiniprogram.BaseEvent) {
      const index = Number(e.currentTarget.dataset.index)
      const store = this.data.stores[index]
      if (!store) {
        return
      }
      this.setCurrentStore(store)
    },

    onStoreChange(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
      const index = Number(e.detail.value)
      const store = this.data.stores[index]
      if (!store) {
        return
      }
      this.setCurrentStore(store)
    },

    onQuickAction(e: any) {
      const { path } = e.currentTarget.dataset
      if (path === '/pages/user/reservation/reservation') {
        const storeId = this.data.store?.id || app.globalData.currentStore?.id || app.globalData.storeId
        wx.navigateTo({ url: `${path}?storeId=${storeId}` })
        return
      }
      wx.navigateTo({ url: path })
    },

    onPullDownRefresh() {
      this.loadData().then(() => {
        wx.stopPullDownRefresh()
      })
    },
  },
})
