// server/routes/auth.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { signToken, auth } from '../middleware/auth.js'

const router = Router()
const db = new PrismaClient()

router.get('/store-staff/:storeId', async (req, res) => {
  try {
    const staff = await db.staff.findMany({ where:{ storeId:req.params.storeId }, select:{ id:true, name:true, role:true }, orderBy:{ name:'asc' } })
    res.json(staff)
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.post('/login', async (req, res) => {
  try {
    const { staffId, pin } = req.body
    if (!staffId || !pin) return res.status(400).json({ error: 'staffId and pin required' })
    const staff = await db.staff.findUnique({ where:{ id:staffId }, include:{ store:{ select:{ id:true, name:true } } } })
    if (!staff || !(await bcrypt.compare(pin, staff.pin))) return res.status(401).json({ error: '認証に失敗しました' })
    const { pin:_, ...safe } = staff
    res.json({ token: signToken({ id:staff.id, storeId:staff.storeId, name:staff.name, isAdmin:staff.isAdmin }), staff: safe })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.get('/me', auth, async (req, res) => {
  try {
    const staff = await db.staff.findUnique({ where:{ id:req.staff.id }, include:{ store:{ select:{ id:true, name:true } } } })
    if (!staff) return res.status(404).json({ error: 'Not found' })
    const { pin:_, ...safe } = staff
    res.json(safe)
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.patch('/pin', auth, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body
    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) return res.status(400).json({ error: '4桁の数字を入力してください' })
    const staff = await db.staff.findUnique({ where:{ id:req.staff.id } })
    if (!(await bcrypt.compare(currentPin, staff.pin))) return res.status(401).json({ error: '現在のPINが正しくありません' })
    await db.staff.update({ where:{ id:req.staff.id }, data:{ pin: await bcrypt.hash(newPin, 10) } })
    res.json({ ok: true })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

export default router
