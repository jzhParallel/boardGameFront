import { getBoardGameDetail, getBoardGameRule, BoardGame, BoardGameRule, getStoreGameList, StoreGame } from '../../../services/boardGame'
import { DEFAULT_STORE_ID } from '../../../config'

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
        const sg = storeGames.find(s => s.id === storeGameId) || null
        if (!sg) {
          this.setData({ loading: false, storeGame: null, game: null, rule: null, ruleNodes: '' })
          return
        }

        const [game, rule] = await Promise.all([
          getBoardGameDetail(sg.gameId),
          getBoardGameRule(sg.gameId).catch(() => ({ gameId: sg.gameId, content: '' })),
        ])

        this.setData({
          storeGame: sg,
          game,
          rule,
          ruleNodes: toRichTextNodes(rule.content),
          loading: false,
        })
      } catch (err) {
        console.warn('加载详情失败:', err)
        this.setData({ loading: false })
      }
    },

    onScan() {
      wx.scanCode({
        success: res => {
          wx.showModal({
            title: '扫码结果',
            content: `条码：${res.result}\n确认执行借还操作吗？`,
            success: result => {
              if (result.confirm) {
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
        success: res => {
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
        success: res => {
          if (res.confirm) {
            wx.showToast({ title: '已归还', icon: 'success' })
          }
        },
      })
    },
  },
})
