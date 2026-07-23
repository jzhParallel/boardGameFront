import { getOrderPage, BoardOrder, createOrder, completeOrder, cancelOrder } from '../../../services/order'
import { getSpaceList, Space } from '../../../services/space'
import { DEFAULT_STORE_ID } from '../../../config'

Component({
  data: {
    orders: [] as BoardOrder[],
    spaces: [] as Space[],
    loading: true,
    statusMap: { 0: '进行中', 1: '已完成', 2: '已取消' } as Record<number, string>,
    showCreate: false,
    form: {
      spaceId: 0,
      customerName: '',
      startTime: '',
      endTime: '',
      totalAmount: '',
      remark: '',
    },
  },

  lifetimes: {
    attached() {
      this.loadData()
    },
  },

  methods: {
    async loadData() {
      this.setData({ loading: true })
      try {
        const [ordersRes, spaces] = await Promise.all([
          getOrderPage({ storeId: DEFAULT_STORE_ID, size: 50 }),
          getSpaceList(DEFAULT_STORE_ID),
        ])
        this.setData({ orders: ordersRes.records, spaces, loading: false })
      } catch (err) {
        console.warn('加载预约管理数据失败:', err)
        this.setData({ loading: false })
      }
    },

    onShowCreate() {
      this.setData({
        showCreate: true,
        form: { spaceId: this.data.spaces[0]?.id || 0, customerName: '', startTime: '', endTime: '', totalAmount: '', remark: '' },
      })
    },

    onCloseCreate() {
      this.setData({ showCreate: false })
    },

    onFormInput(e: any) {
      const { field } = e.currentTarget.dataset
      this.setData({ [`form.${field}`]: e.detail.value })
    },

    onSpaceChange(e: any) {
      const idx = Number(e.detail.value)
      this.setData({ 'form.spaceId': this.data.spaces[idx]?.id || 0 })
    },

    async onCreateSubmit() {
      const { form } = this.data
      if (!form.customerName) {
        wx.showToast({ title: '请输入客户名称', icon: 'none' })
        return
      }
      if (!form.startTime || !form.endTime) {
        wx.showToast({ title: '请输入时间', icon: 'none' })
        return
      }
      try {
        await createOrder({
          storeId: DEFAULT_STORE_ID,
          spaceId: form.spaceId,
          customerId: 0,
          customerName: form.customerName,
          startTime: form.startTime,
          endTime: form.endTime,
          totalAmount: Number(form.totalAmount) || 0,
          remark: form.remark,
        })
        wx.showToast({ title: '开单成功', icon: 'success' })
        this.setData({ showCreate: false })
        this.loadData()
      } catch (err) {
        console.warn('开单失败:', err)
      }
    },

    async onComplete(e: any) {
      const { id } = e.currentTarget.dataset
      try {
        await completeOrder(id)
        wx.showToast({ title: '已完成', icon: 'success' })
        this.loadData()
      } catch (err) {
        console.warn('操作失败:', err)
      }
    },

    async onCancel(e: any) {
      const { id } = e.currentTarget.dataset
      wx.showModal({
        title: '确认取消',
        content: '确定要取消该订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await cancelOrder(id)
              wx.showToast({ title: '已取消', icon: 'success' })
              this.loadData()
            } catch (err) {
              console.warn('取消失败:', err)
            }
          }
        },
      })
    },

    onPullDownRefresh() {
      this.loadData().then(() => wx.stopPullDownRefresh())
    },
  },
})
