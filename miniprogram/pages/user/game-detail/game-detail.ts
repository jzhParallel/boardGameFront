import { getBoardGameDetail, getBoardGameRule, BoardGame, BoardGameRule, getStoreGameList, StoreGame } from '../../../services/boardGame'
import { DEFAULT_STORE_ID } from '../../../config'

const app = getApp<IAppOption>()

function toRichTextNodes(content: string): string {
  const text = String(content || '').trim()
  if (!text) return ''
  if (/<[a-z][\s\S]*>/i.test(text)) return text
  return text
    .split(/\n{2,}/)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
    .join('')
}

Component({
  data: {
    game: null as BoardGame | null,
    rule: null as BoardGameRule | null,
    ruleNodes: '',
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
        const [game, rule] = await Promise.all([
          getBoardGameDetail(id),
          getBoardGameRule(id).catch(() => ({ gameId: id, content: '' })),
        ])
        const stars = [1, 2, 3, 4, 5].map(i => (i <= game.difficulty ? 1 : 0))
        this.setData({
          game,
          rule,
          ruleNodes: toRichTextNodes(rule.content),
          stars,
          loading: false,
        })

        try {
          const storeGames = await getStoreGameList(this.getCurrentStoreId())
          const sg = storeGames.find(s => s.gameId === id) || null
          this.setData({ storeGame: sg })
        } catch (e) {
          // ignore store inventory errors
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

    getCurrentStoreId(): number {
      return app.globalData.storeId || DEFAULT_STORE_ID
    },
  },
})
