Component({
  properties: {
    type: { type: String, value: 'text' },
    role: { type: String, value: 'ai' },
    content: { type: String, value: '' },
    userAvatar: {
      type: String,
      value: '',
      observer() {
        this.setData({ avatarBroken: false })
      },
    },
    gameName: { type: String, value: '' },
    gamePlayers: { type: String, value: '' },
    gameDifficulty: { type: Number, value: 3 },
  },

  data: {
    avatarBroken: false,
  },

  methods: {
    onAvatarError() {
      this.setData({ avatarBroken: true })
    },

    onCardTap() {
      this.triggerEvent('cardtap', { name: this.data.gameName })
    },
  },
})
