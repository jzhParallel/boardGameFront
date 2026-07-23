Component({
  properties: {
    /** 提示文字 */
    text: { type: String, value: '暂无数据' },
    /** 图标文字 */
    icon: { type: String, value: '☕' },
    /** 按钮文字（为空则不显示） */
    btnText: { type: String, value: '' },
  },
  methods: {
    onBtnTap() {
      this.triggerEvent('action')
    },
  },
})
