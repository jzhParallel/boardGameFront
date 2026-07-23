Component({
  properties: {
    /** 消息类型: text | card | loading */
    type: { type: String, value: 'text' },
    /** 角色: ai | user */
    role: { type: String, value: 'ai' },
    /** 文本内容 */
    content: { type: String, value: '' },
    /** 推荐卡片数据 */
    gameName: { type: String, value: '' },
    gamePlayers: { type: String, value: '' },
    gameDifficulty: { type: Number, value: 3 },
  },
  methods: {
    onCardTap() {
      this.triggerEvent('cardtap', { name: this.data.gameName })
    },
  },
})
