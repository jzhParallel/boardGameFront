import { getSpaceList, Space } from '../../../services/space'
import { getOrderPage } from '../../../services/order'
import { createOrder } from '../../../services/order'
import { DEFAULT_STORE_ID } from '../../../config'
import { getUserInfo } from '../../../utils/auth'

Component({
  data: {
    dates: [] as { label: string; value: string }[],
    selectedDate: '',
    spaces: [] as Space[],
    selectedSpace: null as Space | null,
    occupiedSlots: [] as string[],
    selectedStart: '',
    selectedEnd: '',
    submitting: false,
    loading: true,
  },

  lifetimes: {
    attached() {
      this.initDates()
      this.loadSpaces()
    },
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 1 })
      }
    },
  },

  methods: {
    /** 生成未来7天日期 */
    initDates() {
      const dates: { label: string; value: string }[] = []
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        const y = d.getFullYear()
        const m = (d.getMonth() + 1).toString().padStart(2, '0')
        const day = d.getDate().toString().padStart(2, '0')
        const value = `${y}-${m}-${day}`
        const label = i === 0 ? '今天' : i === 1 ? '明天' : weekDays[d.getDay()]
        dates.push({ label, value })
      }
      this.setData({ dates, selectedDate: dates[0].value })
    },

    async loadSpaces() {
      this.setData({ loading: true })
      try {
        const spaces = await getSpaceList(DEFAULT_STORE_ID)
        this.setData({ spaces, loading: false })
      } catch (err) {
        console.warn('加载空间失败:', err)
        this.setData({ loading: false })
      }
    },

    onSelectDate(e: any) {
      const { value } = e.currentTarget.dataset
      this.setData({ selectedDate: value, selectedSpace: null, occupiedSlots: [], selectedStart: '', selectedEnd: '' })
    },

    async onSelectSpace(e: any) {
      const { id } = e.currentTarget.dataset
      const space = this.data.spaces.find(s => s.id === id) || null
      this.setData({ selectedSpace: space, occupiedSlots: [], selectedStart: '', selectedEnd: '' })
      if (space) {
        await this.loadOccupiedSlots(space.id)
      }
    },

    /** 通过订单列表计算已占用时段 */
    async loadOccupiedSlots(spaceId: number) {
      try {
        const res = await getOrderPage({ storeId: DEFAULT_STORE_ID, status: 0, size: 100 })
        const occupied: string[] = []
        const dateStr = this.data.selectedDate
        res.records.forEach(order => {
          if (order.spaceId !== spaceId) return
          const start = order.startTime || ''
          const end = order.endTime || ''
          if (!start.startsWith(dateStr)) return
          // 解析时间生成占用时段
          const startMin = this.timeToMinutes(start.substring(11, 16))
          const endMin = this.timeToMinutes(end.substring(11, 16))
          for (let m = startMin; m < endMin; m += 30) {
            occupied.push(this.minutesToTime(m))
          }
        })
        this.setData({ occupiedSlots: occupied })
      } catch (err) {
        console.warn('加载占用时段失败:', err)
      }
    },

    timeToMinutes(t: string): number {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    },

    minutesToTime(min: number): string {
      const h = Math.floor(min / 60)
      const m = min % 60
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    },

    onTimeChange(e: any) {
      const { start, end } = e.detail
      this.setData({ selectedStart: start, selectedEnd: end })
    },

    async onSubmit() {
      const { selectedSpace, selectedDate, selectedStart, selectedEnd } = this.data
      if (!selectedSpace) {
        wx.showToast({ title: '请选择空间', icon: 'none' })
        return
      }
      if (!selectedStart || !selectedEnd) {
        wx.showToast({ title: '请选择时段', icon: 'none' })
        return
      }

      const userInfo = getUserInfo()
      this.setData({ submitting: true })
      try {
        await createOrder({
          storeId: DEFAULT_STORE_ID,
          spaceId: selectedSpace.id,
          customerId: userInfo?.userId || 0,
          customerName: userInfo?.nickname || '微信用户',
          startTime: `${selectedDate}T${selectedStart}:00`,
          endTime: `${selectedDate}T${selectedEnd}:00`,
          totalAmount: 0,
          remark: '用户预约',
        })
        wx.showToast({ title: '预约成功！', icon: 'success' })
        this.setData({ selectedStart: '', selectedEnd: '', occupiedSlots: [] })
        await this.loadOccupiedSlots(selectedSpace.id)
      } catch (err) {
        console.warn('预约失败:', err)
      } finally {
        this.setData({ submitting: false })
      }
    },
  },
})
