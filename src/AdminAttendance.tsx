import { useState, useEffect } from 'react'
import { Edit2, Check, X, User, History } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function AdminAttendance() {
  const [logs, setLogs] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ time: '' })

  useEffect(() => { fetchAllLogs() }, [])

  const fetchAllLogs = async () => {
    try {
      // 全員の過去ログをAPIから取得
      const { data } = await api.get('/api/admin/punches')
      setLogs(data)
    } catch { toast.error('読み込み失敗') }
  }

  const saveEdit = async (log: any) => {
    try {
      // 修正：元の時間を originalTime として保存し、isEditedをtrueにする
      await api.patch(`/api/admin/punches/${log.id}`, { 
        time: editForm.time,
        isEdited: true,
        originalTime: log.time // 修正前の時間を残す
      })
      toast.success('修正を記録しました')
      setEditingId(null)
      fetchAllLogs()
    } catch { toast.error('保存失敗') }
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: 14, fontWeight: 900, marginBottom: 20 }}>全スタッフ勤怠ログ（修正）</h2>
      {logs.map((log) => (
        <div key={log.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{log.staffName}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{log.date} ({log.type === 'in' ? '出勤' : '退勤'})</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {editingId === log.id ? (
              <div style={{ display: 'flex', gap: 5 }}>
                <input type="time" value={editForm.time} onChange={e => setEditForm({time: e.target.value})} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text)' }} />
                <button onClick={() => saveEdit(log)}><Check size={16} color="var(--green)"/></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {log.isEdited && <span style={{ fontSize: 9, color: 'var(--accent)' }}><History size={10}/> 元: {log.originalTime}</span>}
                <span style={{ fontFamily: 'var(--mono)' }}>{log.time}</span>
                <button onClick={() => { setEditingId(log.id); setEditForm({time: log.time}); }}><Edit2 size={14}/></button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}