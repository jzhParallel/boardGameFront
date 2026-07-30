interface TimeSlot {
  time: string
  status: 'available' | 'occupied' | 'reserved' | 'expired' | 'selected'
}

Component({
  properties: {
    /** 营业开始时间 如 "10:00" */
    startTime: { type: String, value: '10:00' },
    /** 营业结束时间 如 "22:00" */
    endTime: { type: String, value: '22:00' },
    /** 当前选择日期 YYYY-MM-DD */
    selectedDate: { type: String, value: '' },
    /** 已占用时段列表 如 ["10:00","10:30"] */
    occupiedSlots: { type: Array, value: [] as string[] },
    /** 我的已预约时段列表 如 ["10:00","10:30"] */
    myReservedSlots: { type: Array, value: [] as string[] },
  },
  data: {
    slots: [] as TimeSlot[],
    selectedStart: '',
    selectedEnd: '',
  },
  lifetimes: {
    attached() {
      this.generateSlots()
    },
  },
  observers: {
    'occupiedSlots, myReservedSlots, selectedDate, startTime, endTime'() {
      this.generateSlots()
    },
  },
  methods: {
    generateSlots() {
      const { startTime, endTime, occupiedSlots, myReservedSlots } = this.data
      const slots: TimeSlot[] = []
      const [sh, sm] = startTime.split(':').map(Number)
      const [eh, em] = endTime.split(':').map(Number)
      let current = sh * 60 + sm
      const end = eh * 60 + em

      while (current < end) {
        const h = Math.floor(current / 60)
        const m = current % 60
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        const isOccupied = (occupiedSlots as string[]).includes(time)
        const isReserved = (myReservedSlots as string[]).includes(time)
        const isExpired = this.isExpiredSlot(time)
        slots.push({
          time,
          status: isExpired ? 'expired' : isReserved ? 'reserved' : isOccupied ? 'occupied' : 'available',
        })
        current += 30
      }
      this.setData({ slots, selectedStart: '', selectedEnd: '' })
    },

    onSlotTap(e: any) {
      const { index } = e.currentTarget.dataset
      const slots = [...this.data.slots]
      const slot = slots[index]

      if (this.isBlockedSlot(slot.status)) return

      // 如果没选开始，或已经选了连续段，重新开始选
      if (!this.data.selectedStart || this.data.selectedEnd) {
        // 重置之前的选择
        slots.forEach(s => {
          if (s.status === 'selected') s.status = 'available'
        })
        slots[index].status = 'selected'
        this.setData({ slots, selectedStart: slot.time, selectedEnd: '' })
        this.triggerEvent('change', { start: slot.time, end: '' })
        return
      }

      // 选了开始，尝试扩展到当前
      const startIdx = slots.findIndex(s => s.time === this.data.selectedStart)
      // 检查中间是否有occupied
      const from = Math.min(startIdx, index)
      const to = Math.max(startIdx, index)
      for (let i = from; i <= to; i++) {
        if (this.isBlockedSlot(slots[i].status)) {
          wx.showToast({ title: '所选时段包含不可预约时间', icon: 'none' })
          return
        }
      }

      // 选中范围
      slots.forEach(s => {
        if (s.status === 'selected') s.status = 'available'
      })
      for (let i = from; i <= to; i++) {
        slots[i].status = 'selected'
      }

      // 计算结束时间（最后一个选中时段+30分钟）
      const lastSlot = slots[to]
      const [lh, lm] = lastSlot.time.split(':').map(Number)
      let endMin = lh * 60 + lm + 30
      const endH = Math.floor(endMin / 60)
      const endM = endMin % 60
      const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`

      this.setData({ slots, selectedEnd: endStr })
      this.triggerEvent('change', { start: this.data.selectedStart, end: endStr })
    },

    isBlockedSlot(status: TimeSlot['status']): boolean {
      return status === 'occupied' || status === 'reserved' || status === 'expired'
    },

    isExpiredSlot(time: string): boolean {
      if (!this.isToday(this.data.selectedDate)) return false
      return this.timeToMinutes(time) < this.getCurrentMinutes()
    },

    isToday(date: string): boolean {
      if (!date) return false
      const now = new Date()
      const y = now.getFullYear()
      const m = (now.getMonth() + 1).toString().padStart(2, '0')
      const d = now.getDate().toString().padStart(2, '0')
      return date === `${y}-${m}-${d}`
    },

    getCurrentMinutes(): number {
      const now = new Date()
      return now.getHours() * 60 + now.getMinutes()
    },

    timeToMinutes(time: string): number {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    },
  },
})
