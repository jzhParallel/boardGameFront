import { getBoardGameDetail, BoardGame } from '../../../services/boardGame'
import { getStoreGameList, StoreGame } from '../../../services/boardGame'
import { DEFAULT_STORE_ID } from '../../../config'

Component({
  data: {
    game: null as BoardGame | null,
    storeGame: null as StoreGame | null,
    loading: true,
    stars: [] as number[],
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
    async loadDetail(id: number) {
      this.setData({ loading: true })
      try {
        const game = await getBoardGameDetail(id)
        const stars = [1, 2, 3, 4, 5].map(i => (i <= game.difficulty ? 1 : 0))
        this.setData({ game, stars, loading: false })

        // 查询本店库存
        try {
          const storeGames = await getStoreGameList(DEFAULT_STORE_ID)
          const sg = storeGames.find(s => s.gameId === id) || null
          this.setData({ storeGame: sg })
        } catch (e) {
          // 库存查询失败不影响主流程
        }
      } catch (err) {
        console.warn('加载桌游详情失败:', err)
        this.setData({ loading: false })
      }
    },

    onAskAI() {
      const name = this.data.game?.gameName || ''
      getApp().globalData.aiQuestion = `${name}怎么玩？`
      wx.switchTab({ url: '/pages/user/ai-assistant/ai-assistant' })
    },
  },
})
