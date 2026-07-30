import { getBoardGamePage, BoardGame } from '../../../services/boardGame'

Component({
  data: {
    games: [] as BoardGame[],
    keyword: '',
    searchFocused: false,
    category: '',
    categories: ['全部', '策略', '派对', '推理', '合作', '卡牌', '桌游'],
    current: 1,
    size: 10,
    total: 0,
    loading: false,
    noMore: false,
  },

  lifetimes: {
    attached() {
      this.loadGames(true)
    },
  },

  methods: {
    async loadGames(reset = false) {
      if (this.data.loading) return
      if (!reset && this.data.noMore) return

      const current = reset ? 1 : this.data.current
      this.setData({ loading: true })

      try {
        const params: any = { current, size: this.data.size }
        if (this.data.keyword) params.keyword = this.data.keyword
        if (this.data.category && this.data.category !== '全部') params.category = this.data.category

        const res = await getBoardGamePage(params)
        const games = reset ? res.records : [...this.data.games, ...res.records]
        this.setData({
          games,
          current: current + 1,
          total: res.total,
          noMore: games.length >= res.total,
          loading: false,
        })
      } catch (err) {
        console.warn('加载桌游失败:', err)
        this.setData({ loading: false })
      }
    },

    onSearchInput(e: any) {
      this.setData({ keyword: e.detail.value })
    },

    onSearchFocus() {
      this.setData({ searchFocused: true })
    },

    onSearchBlur() {
      this.setData({ searchFocused: false })
    },

    onSearch() {
      this.setData({ noMore: false })
      this.loadGames(true)
    },

    onCategoryTap(e: any) {
      const { cat } = e.currentTarget.dataset
      this.setData({ category: cat, noMore: false })
      this.loadGames(true)
    },

    onGameTap(e: any) {
      const { id } = e.currentTarget.dataset
      wx.navigateTo({ url: `/pages/user/game-detail/game-detail?id=${id}` })
    },

    onAskHow(e: any) {
      const { name } = e.detail
      wx.switchTab({ url: '/pages/user/ai-assistant/ai-assistant' })
      // 通过全局事件传递问题
      setTimeout(() => {
        getApp().globalData.aiQuestion = `${name}怎么玩？`
      }, 100)
    },

    onReachBottom() {
      this.loadGames(false)
    },

    onPullDownRefresh() {
      this.setData({ noMore: false })
      this.loadGames(true).then(() => wx.stopPullDownRefresh())
    },
  },
})
