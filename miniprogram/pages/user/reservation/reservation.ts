import { getSpaceAvailable, SpaceVO } from '../../../services/space'
import { createOrder } from '../../../services/order'
import { DEFAULT_STORE_ID } from '../../../config'
import { getUserInfo } from '../../../utils/auth'

Component({
  data: {
    dates: [] as { label: string; value: string }[],
    selectedDate: '',
    spaces: [] as SpaceVO[],
    selectedSpace: null as SpaceVO | null,
    occupiedSlots: [] as string[],
    selectedStart: '',
    selectedEnd: '',
    submitting: false,
    loading: true,
  },

  lifetimes: {
    attached() {
      this.initDates()
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
      this.loadSpaces()
    },

    /** 调用后端空闲时间查询接口 */
    async loadSpaces() {
      this.setData({ loading: true })
      try {
        const res = await getSpaceAvailable({
          storeId: DEFAULT_STORE_ID,
          queryDate: this.data.selectedDate,
          size: 100,
        })
        this.setData({ spaces: res.records, loading: false })
      } catch (err) {
        console.warn('加载空间失败:', err)
        this.setData({ loading: false })
      }
    },

    onSelectDate(e: any) {
      const { value } = e.currentTarget.dataset
      this.setData({ selectedDate: value, selectedSpace: null, occupiedSlots: [], selectedStart: '', selectedEnd: '' })
      this.loadSpaces()
    },

    onSelectSpace(e: any) {
      const { id } = e.currentTarget.dataset
      const space = this.data.spaces.find(s => s.id === id) || null
      this.setData({ selectedSpace: space, selectedStart: '', selectedEnd: '' })
      if (space) {
        this.extractOccupiedSlots(space)
      }
    },

    /** 从后端返回的订单列表中提取已占用时段 */
    extractOccupiedSlots(space: SpaceVO) {
      const occupied: string[] = []
      if (space.orders && space.orders.length > 0) {
        space.orders.forEach(order => {
          const start = (order.startTime || '').substring(11, 16)
          const end = (order.endTime || '').substring(11, 16)
          if (!start || !end) return
          const startMin = this.timeToMinutes(start)
          const endMin = this.timeToMinutes(end)
          for (let m = startMin; m < endMin; m += 30) {
            occupied.push(this.minutesToTime(m))
          }
        })
      }
      this.setData({ occupiedSlots: occupied })
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
        // 重新加载空间数据
        await this.loadSpaces()
        const updated = this.data.spaces.find(s => s.id === selectedSpace.id)
        if (updated) {
          this.setData({ selectedSpace: updated })
          this.extractOccupiedSlots(updated)
        }
      } catch (err) {
        console.warn('预约失败:', err)
      } finally {
        this.setData({ submitting: false })
      }
    },
  },
})
