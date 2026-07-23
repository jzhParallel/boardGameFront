Component({
  properties: {
    /** 桌游名称 */
    name: { type: String, value: '' },
    /** 封面图 */
    cover: { type: String, value: '' },
    /** 最少人数 */
    minPlayers: { type: Number, value: 2 },
    /** 最多人数 */
    maxPlayers: { type: Number, value: 6 },
    /** 游戏时长(分钟) */
    playTime: { type: Number, value: 60 },
    /** 难度 1-5 */
    difficulty: { type: Number, value: 3 },
    /** 分类 */
    category: { type: String, value: '' },
    /** 是否显示"怎么玩"按钮 */
    showAsk: { type: Boolean, value: false },
  },
  data: {
    stars: [] as number[],
  },
  lifetimes: {
    attached() {
      this.updateStars()
    },
  },
  observers: {
    difficulty() {
      this.updateStars()
    },
  },
  methods: {
    updateStars() {
      const d = this.data.difficulty
      this.setData({ stars: [1, 2, 3, 4, 5].map(i => (i <= d ? 1 : 0)) })
    },
    onAsk() {
      this.triggerEvent('ask', { name: this.data.name })
    },
    onTap() {
      this.triggerEvent('tap')
    },
  },
})
