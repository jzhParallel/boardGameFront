Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/user/home/home',
        text: '首页',
        iconText: '⌂',
      },
      {
        pagePath: '/pages/user/reservation/reservation',
        text: '预约',
        iconText: '▦',
      },
      {
        pagePath: '/pages/user/games/games',
        text: '桌游',
        iconText: '♟',
      },
      {
        pagePath: '/pages/user/ai-assistant/ai-assistant',
        text: 'AI助手',
        iconText: '✦',
      },
      {
        pagePath: '/pages/user/profile/profile',
        text: '我的',
        iconText: '☺',
      },
    ],
  },
  methods: {
    switchTab(e: any) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
    },
  },
})
