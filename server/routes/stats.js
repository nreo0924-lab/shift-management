import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { admin } from '../middleware/auth.js'

const router = Router()
const db = new PrismaClient()

function calcPay(staff, inT, outT) {
  const pt = t => { const [h,m]=t.split(':').map(Number); return h+m/60 }
  const s = pt(inT); let e = pt(outT); if (e<s) e+=24
  const total=e-s, ot=Math.max(0,total-8), ln=Math.max(0,Math.min(e,29)-Math.max(s,22))
  const bh = staff.type==='full-time' ? staff.wage/(staff.standardMonthlyHours||160) : staff.wage
  const base  = staff.type==='part-time' ? (total-ot)*bh : 0
  const otPay = staff.type==='part-time' ? ot*bh*1.25 : 0
  const lnPay = ln*bh*0.25
  return { total, ot, ln, pay: base+otPay+lnPay }
}

router.get('/', admin, async (req, res) => {
  try {
    const { from, to } = req.query
    if (!from || !to) return res.status(400).json({ error: 'from and to required' })

    const allStaff = await db.staff.findMany({
      where: { storeId: req.staff.storeId },
      select: { id:true, name:true, type:true, wage:true, fixedOvertimeHours:true, standardMonthlyHours:true },
    })
    const punches = await db.punch.findMany({
      where: { staffId:{ in: allStaff.map(s=>s.id) }, date:{ gte:from, lte:to } },
      orderBy: [{ staffId:'asc' }, { date:'asc' }, { createdAt:'asc' }],
    })

    const staffStats = allStaff.map(staff => {
      const sp = punches.filter(p=>p.staffId===staff.id)
      const byDate = {}
      sp.forEach(p => { if (!byDate[p.date]) byDate[p.date]=[]; byDate[p.date].push(p) })

      let totalHours=0, totalLNHours=0, totalOTHours=0, totalPay=0
      const days = []

      Object.entries(byDate).forEach(([date, logs]) => {
        const ins  = logs.filter(l=>l.type==='in')
        const outs = logs.filter(l=>l.type==='out')
        const pairs = Math.min(ins.length, outs.length)
        let dh=0, dln=0, dot=0, dp=0
        for (let i=0; i<pairs; i++) {
          const c = calcPay(staff, ins[i].time, outs[i].time)
          dh+=c.total; dln+=c.ln; dot+=c.ot; dp+=c.pay
        }
        totalHours+=dh; totalLNHours+=dln; totalOTHours+=dot; totalPay+=dp
        days.push({ date, hours:dh, lnHours:dln, otHours:dot, pay:dp, punches:logs })
      })

      let totalWage
      if (staff.type==='full-time') {
        const bh = staff.wage/(staff.standardMonthlyHours||160)
        const extraOT = Math.max(0, totalOTHours-(staff.fixedOvertimeHours||0))
        totalWage = staff.wage + extraOT*bh*1.25 + totalLNHours*bh*0.25
      } else {
        totalWage = totalPay
      }

      return { staff:{ id:staff.id, name:staff.name, type:staff.type, wage:staff.wage }, totalHours, totalLNHours, totalOTHours, totalWage, days }
    })

    res.json({
      from, to,
      totalWage:  staffStats.reduce((a,s)=>a+s.totalWage,0),
      totalHours: staffStats.reduce((a,s)=>a+s.totalHours,0),
      staff: staffStats,
    })
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }) }
})

export default router
