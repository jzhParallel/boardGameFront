import { getAiReply, streamReply } from '../../../mock/ai'

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
    isTyping: false,
    msgId: 0,
    scrollTop: 0,
  },

  lifetimes: {
    attached() {
      // 欢迎消息
      this.addMessage({
        role: 'ai',
        type: 'text',
        content: '你好！我是桌游小助手 🎲\n\n我可以帮你：\n• 解答桌游规则\n• 推荐适合的桌游\n• 告诉你桌游在店里的位置\n\n试着问我"卡坦岛怎么玩"或"推荐几款桌游"吧！',
      })
    },
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 1 })
      }
      // 检查是否有从其他页面传来的问题
      const app = getApp()
      const question = (app.globalData as any).aiQuestion
      if (question) {
        ;(app.globalData as any).aiQuestion = ''
        setTimeout(() => this.handleSend(question), 300)
      }
    },
  },

  methods: {
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
      this.setData({ inputValue: e.detail.value })
    },

    handleSend(text?: string) {
      const content = text || this.data.inputValue.trim()
      if (!content || this.data.isTyping) return

      // 添加用户消息
      this.addMessage({ role: 'user', type: 'text', content })
      this.setData({ inputValue: '', isTyping: true })

      // 显示加载态
      this.addMessage({ role: 'ai', type: 'loading', content: '' })

      // 模拟延迟后开始流式回复
      setTimeout(() => {
        const reply = getAiReply(content)
        // 替换 loading 为文本
        const messages = [...this.data.messages]
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          type: 'text',
          content: '',
        }
        this.setData({ messages })

        // 流式输出
        streamReply(
          reply.reply,
          (partial) => {
            this.updateLastMessage(partial)
            this.scrollToBottom()
          },
          () => {
            // 如果有推荐卡片，追加一条
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
            this.setData({ isTyping: false })
          }
        )
      }, 800)
    },

    onSend() {
      this.handleSend()
    },

    onCardTap(e: any) {
      const { name } = e.detail
      wx.showToast({ title: `查看「${name}」详情`, icon: 'none' })
    },
  },
})
