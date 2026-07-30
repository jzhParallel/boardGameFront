import { getSpaceAvailable, PricingPackageRule, SpaceVO } from '../../../services/space'
import { createOrder, previewOrderAmount } from '../../../services/order'
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

    async loadSpaces() {
      this.setData({ loading: true })
      try {
        const res = await getSpaceAvailable({
          storeId: DEFAULT_STORE_ID,
          queryDate: this.data.selectedDate,
          size: 100,
        })
        this.setData({
          spaces: res.records.map(item => ({
            ...item,
            pricingText: this.buildPricingText(item),
          })),
          loading: false,
        })
      } catch (err) {
        console.warn('加载空间失败:', err)
        this.setData({ loading: false })
      }
    },

    onSelectDate(e: WechatMiniprogram.BaseEvent) {
      const { value } = e.currentTarget.dataset as { value: string }
      this.setData({ selectedDate: value, selectedSpace: null, occupiedSlots: [], selectedStart: '', selectedEnd: '' })
      this.loadSpaces()
    },

    onSelectSpace(e: WechatMiniprogram.BaseEvent) {
      const { id } = e.currentTarget.dataset as { id: number }
      const space = this.data.spaces.find(s => s.id === id) || null
      this.setData({ selectedSpace: space, selectedStart: '', selectedEnd: '' })
      if (space) this.extractOccupiedSlots(space)
    },

    extractOccupiedSlots(space: SpaceVO) {
      if (!space.orders || space.orders.length === 0) {
        this.setData({ occupiedSlots: [] })
        return
      }
      if (space.capacityControlEnabled && space.maxConcurrentBookings > 0) {
        const countMap: Record<string, number> = {}
        space.orders.forEach(order => {
          this.walkOrderSlots(order.startTime, order.endTime, slot => {
            countMap[slot] = (countMap[slot] || 0) + 1
          })
        })
        const occupied = Object.keys(countMap).filter(slot => countMap[slot] >= space.maxConcurrentBookings)
        this.setData({ occupiedSlots: occupied })
        return
      }
      const occupied: string[] = []
      space.orders.forEach(order => {
        this.walkOrderSlots(order.startTime, order.endTime, slot => occupied.push(slot))
      })
      this.setData({ occupiedSlots: occupied })
    },

    walkOrderSlots(startTime: string, endTime: string, callback: (slot: string) => void) {
      const start = (startTime || '').substring(11, 16)
      const end = (endTime || '').substring(11, 16)
      if (!start || !end) return
      const startMin = this.timeToMinutes(start)
      const endMin = this.timeToMinutes(end)
      for (let m = startMin; m < endMin; m += 30) {
        callback(this.minutesToTime(m))
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

    onTimeChange(e: WechatMiniprogram.CustomEvent<{ start: string; end: string }>) {
      const { start, end } = e.detail
      this.setData({ selectedStart: start, selectedEnd: end })
    },

    async onSubmit() {
      const { selectedSpace, selectedDate, selectedStart, selectedEnd } = this.data
      if (!selectedSpace) {
        wx.showToast({ title: '请选择空间', icon: 'none' })
        return
      }
      if (!selectedStart) {
        wx.showToast({ title: '请选择到店时间', icon: 'none' })
        return
      }
      if (selectedSpace.pricingRuleType !== 'TICKET' && !selectedEnd) {
        wx.showToast({ title: '请选择结束时间', icon: 'none' })
        return
      }

      const matchedPackage = this.resolveMatchedPackage(selectedSpace, selectedStart, selectedEnd)
      if (selectedSpace.pricingRuleType === 'PACKAGE' && !matchedPackage) {
        wx.showToast({ title: '套餐空间请选择已配置的预约时长', icon: 'none' })
        return
      }

      const userInfo = getUserInfo()
      const payload = {
        storeId: DEFAULT_STORE_ID,
        spaceId: selectedSpace.id,
        customerId: userInfo?.userId || 0,
        customerName: userInfo?.nickname || '微信用户',
        startTime: `${selectedDate}T${selectedStart}:00`,
        endTime: selectedEnd ? `${selectedDate}T${selectedEnd}:00` : undefined,
        packageHours: matchedPackage?.hours,
        totalAmount: 0,
        remark: '用户预约',
      }

      this.setData({ submitting: true })
      try {
        const preview = await previewOrderAmount(payload)
        const confirmed = await this.confirmAmount(selectedSpace, preview.totalAmount, preview.pricingDescription, preview.startTime, preview.endTime)
        if (!confirmed) return

        await createOrder({
          ...payload,
          totalAmount: preview.totalAmount,
          endTime: preview.endTime,
        })
        wx.showToast({ title: '预约成功', icon: 'success' })
        this.setData({ selectedStart: '', selectedEnd: '', occupiedSlots: [] })
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

    resolveMatchedPackage(space: SpaceVO, selectedStart: string, selectedEnd: string): PricingPackageRule | undefined {
      if (space.pricingRuleType !== 'PACKAGE' || !selectedStart || !selectedEnd) return undefined
      const duration = this.timeToMinutes(selectedEnd) - this.timeToMinutes(selectedStart)
      return space.packageRules.find(item => item.hours * 60 === duration)
    },

    confirmAmount(space: SpaceVO, amount: number, description: string, startTime: string, endTime: string): Promise<boolean> {
      return new Promise(resolve => {
        wx.showModal({
          title: '确认预约',
          content: `${space.spaceName}\n${description}\n${startTime.replace('T', ' ')} - ${endTime.replace('T', ' ')}\n应支付：¥${Number(amount).toFixed(2)}`,
          confirmText: '确认支付',
          cancelText: '再看看',
          success: res => resolve(Boolean(res.confirm)),
          fail: () => resolve(false),
        })
      })
    },

    buildPricingText(space: SpaceVO) {
      if (space.pricingRuleType === 'PACKAGE') {
        return space.packageRules.map(item => `${item.hours}小时 ¥${item.price}`).join(' / ') || '按套餐计价'
      }
      if (space.pricingRuleType === 'TICKET') {
        return `门票制 ¥${space.ticketPrice || 0}/人，当日不限时`
      }
      return `按时计价 ¥${space.pricePerHour || 0}/小时`
    },
  },
})
