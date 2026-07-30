import { getAiReply, streamReply } from '../../../mock/ai'
import { getUserInfo } from '../../../utils/auth'
import { resolveAssetUrl } from '../../../utils/asset'

interface Message {
  id: number
  role: 'ai' | 'user'
  type: 'text' | 'card' | 'loading'
  content: string
  gameName?: string
  gamePlayers?: string
  gameDifficulty?: number
}

Component({
  data: {
    messages: [] as Message[],
    inputValue: '',
    canSend: false,
    isTyping: false,
    msgId: 0,
    scrollTop: 0,
    userAvatar: '',
  },

  lifetimes: {
    attached() {
      this.loadUserAvatar()
      this.addMessage({
        role: 'ai',
        type: 'text',
        content:
          '你好，我是桌游小助手。\n\n你可以直接问我：\n- 桌游规则怎么理解\n- 哪款桌游适合几个人玩\n- 桌游在店里的位置\n\n比如试试“卡坦岛怎么玩”或“推荐两人桌游”。',
      })
    },
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 1 })
      }
      this.loadUserAvatar()

      const app = getApp()
      const question = (app.globalData as any).aiQuestion
      if (question) {
        ;(app.globalData as any).aiQuestion = ''
        setTimeout(() => this.handleSend(question), 300)
      }
    },
  },

  methods: {
    loadUserAvatar() {
      const info = getUserInfo()
      this.setData({ userAvatar: resolveAssetUrl(info?.avatar) })
    },

    addMessage(msg: Omit<Message, 'id'>) {
      const id = this.data.msgId + 1
      const messages = [...this.data.messages, { ...msg, id }]
      this.setData({ messages, msgId: id })
      this.scrollToBottom()
    },

    updateLastMessage(content: string) {
      const messages = [...this.data.messages]
      const last = messages[messages.length - 1]
      if (last) {
        last.content = content
        this.setData({ messages })
      }
    },

    scrollToBottom() {
      setTimeout(() => {
        this.setData({ scrollTop: this.data.messages.length * 500 })
      }, 50)
    },

    onInput(e: any) {
      const inputValue = e.detail.value
      this.setData({
        inputValue,
        canSend: !!inputValue.trim() && !this.data.isTyping,
      })
    },

    handleSend(text?: string) {
      const content = (text || this.data.inputValue).trim()
      if (!content || this.data.isTyping) return

      this.addMessage({ role: 'user', type: 'text', content })
      this.setData({ inputValue: '', canSend: false, isTyping: true })
      this.addMessage({ role: 'ai', type: 'loading', content: '' })

      setTimeout(() => {
        const reply = getAiReply(content)
        const messages = [...this.data.messages]
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          type: 'text',
          content: '',
        }
        this.setData({ messages })

        streamReply(
          reply.reply,
          (partial) => {
            this.updateLastMessage(partial)
            this.scrollToBottom()
          },
          () => {
            if (reply.game) {
              this.addMessage({
                role: 'ai',
                type: 'card',
                content: '',
                gameName: reply.game.name,
                gamePlayers: reply.game.players,
                gameDifficulty: reply.game.difficulty,
              })
            }
            this.setData({
              isTyping: false,
              canSend: !!this.data.inputValue.trim(),
            })
          }
        )
      }, 800)
    },

    onSend() {
      this.handleSend()
    },

    onCardTap(e: any) {
      const { name } = e.detail
      wx.showToast({ title: `查看《${name}》详情`, icon: 'none' })
    },
  },
})
