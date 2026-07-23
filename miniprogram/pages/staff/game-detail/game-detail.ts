import { getBoardGameDetail, BoardGame, getStoreGameList, StoreGame } from '../../../services/boardGame'
import { put } from '../../../utils/request'
import { DEFAULT_STORE_ID } from '../../../config'

Component({
  data: {
    game: null as BoardGame | null,
    storeGame: null as StoreGame | null,
    loading: true,
  },

  lifetimes: {
    attached() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1] as any
      const id = Number(currentPage.options?.id || 0)
      if (id) this.loadDetail(id)
    },
  },

  methods: {
    async loadDetail(storeGameId: number) {
      this.setData({ loading: true })
      try {
        const storeGames = await getStoreGameList(DEFAULT_STORE_ID)
        const sg = storeGames.find(s => s.id === storeGameId)
        if (sg) {
          this.setData({ storeGame: sg })
          try {
            const game = await getBoardGameDetail(sg.gameId)
            this.setData({ game })
          } catch (e) { /* ignore */ }
        }
        this.setData({ loading: false })
      } catch (err) {
        console.warn('加载详情失败:', err)
        this.setData({ loading: false })
      }
    },

    onScan() {
      wx.scanCode({
        success: (res) => {
          wx.showModal({
            title: '扫码结果',
            content: `条码: ${res.result}\n确认执行借还操作？`,
            success: (r) => {
              if (r.confirm) {
                wx.showToast({ title: '操作成功', icon: 'success' })
              }
            },
          })
        },
      })
    },

    onLend() {
      wx.showModal({
        title: '借出确认',
        content: `确认借出「${this.data.game?.gameName || '桌游'}」？`,
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '已借出', icon: 'success' })
          }
        },
      })
    },

    onReturn() {
      wx.showModal({
        title: '归还确认',
        content: `确认归还「${this.data.game?.gameName || '桌游'}」？`,
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '已归还', icon: 'success' })
          }
        },
      })
    },
  },
})
