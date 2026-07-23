import { getOrderPage, BoardOrder } from '../../../services/order'
import { DEFAULT_STORE_ID } from '../../../config'

interface CustomerSummary {
  name: string
  orderCount: number
  lastOrder: string
}

Component({
  data: {
    customers: [] as CustomerSummary[],
    loading: true,
  },

  lifetimes: {
    attached() {
      this.loadCustomers()
    },
  },

  methods: {
    async loadCustomers() {
      this.setData({ loading: true })
      try {
        const res = await getOrderPage({ storeId: DEFAULT_STORE_ID, size: 200 })
        // 按客户名称聚合
        const map = new Map<string, CustomerSummary>()
        res.records.forEach((order: BoardOrder) => {
          const name = order.customerName || '未知用户'
          const existing = map.get(name)
          if (existing) {
            existing.orderCount++
            if (order.createTime > existing.lastOrder) {
              existing.lastOrder = order.createTime
            }
          } else {
            map.set(name, {
              name,
              orderCount: 1,
              lastOrder: order.createTime || '',
            })
          }
        })
        const customers = Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount)
        this.setData({ customers, loading: false })
      } catch (err) {
        console.warn('加载用户列表失败:', err)
        this.setData({ loading: false })
      }
    },

    onPullDownRefresh() {
      this.loadCustomers().then(() => wx.stopPullDownRefresh())
    },
  },
})
