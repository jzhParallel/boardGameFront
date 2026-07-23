import { getStoreGameList, StoreGame, getBoardGameDetail, BoardGame } from '../../../services/boardGame'
import { DEFAULT_STORE_ID } from '../../../config'

interface GameItem extends StoreGame {
  gameName?: string
  category?: string
}

Component({
  data: {
    games: [] as GameItem[],
    keyword: '',
    loading: true,
  },

  lifetimes: {
    attached() {
      this.loadGames()
    },
  },

  methods: {
    async loadGames() {
      this.setData({ loading: true })
      try {
        const storeGames = await getStoreGameList(DEFAULT_STORE_ID)
        // 尝试获取桌游名称
        const games: GameItem[] = []
        for (const sg of storeGames) {
          let gameName = `桌游#${sg.gameId}`
          let category = ''
          try {
            const detail: BoardGame = await getBoardGameDetail(sg.gameId)
            gameName = detail.gameName
            category = detail.category
          } catch (e) { /* ignore */ }
          games.push({ ...sg, gameName, category })
        }
        this.setData({ games, loading: false })
      } catch (err) {
        console.warn('加载桌游列表失败:', err)
        this.setData({ loading: false })
      }
    },

    onSearchInput(e: any) {
      this.setData({ keyword: e.detail.value })
    },

    onGameTap(e: any) {
      const { id } = e.currentTarget.dataset
      wx.navigateTo({ url: `/pages/staff/game-detail/game-detail?id=${id}` })
    },

    onScan() {
      wx.scanCode({
        success: (res) => {
          wx.showToast({ title: `扫码结果: ${res.result}`, icon: 'none' })
          // 可根据扫码结果跳转到对应桌游
        },
        fail: () => {
          wx.showToast({ title: '扫码取消', icon: 'none' })
        },
      })
    },

    onPullDownRefresh() {
      this.loadGames().then(() => wx.stopPullDownRefresh())
    },
  },
})
