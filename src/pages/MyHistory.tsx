import { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function MyHistory() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const HOURLY_RATE = 1200; // ここにお店の時給を設定してください

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/api/my/punches')
        setHistory(data)
      } catch {
        toast.error('履歴の読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // 10日締め計算のロジック（簡易版：当月の11日〜翌10日分を表示）
  const totalHours = history.reduce((acc, curr) => acc + (curr.workingHours || 0), 0)

  if (loading) return <div style={{ padding: 20, textAlign: 'center', fontSize: 12 }}>読み込み中...</div>

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 10日締め合計カード */}
      <div className="card" style={{ background: 'var(--bg2)', border: '1px solid var(--green)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 900, letterSpacing: '0.2em', marginBottom: 10 }}>
          今期概算給与 (11日〜翌10日)
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
          ¥{Math.floor(totalHours * HOURLY_RATE).toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
          総労働時間: {totalHours.toFixed(1)}h
        </div>
      </div>

      {/* 勤務明細リスト */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 900, color: 'var(--text2)', textTransform: 'uppercase' }}>
          勤務明細（日別）
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--text3)' }}>履歴がありません</div>
        ) : (
          history.map((item, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{item.date}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={10} /> {item.clockIn} - {item.clockOut}
                  {item.is_edited && (
                    <span style={{ color: 'var(--accent)', fontSize: 8, border: '1px solid var(--accent)', padding: '0 4px', borderRadius: 2 }}>修正済</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)' }}>
                  ¥{Math.floor(item.workingHours * HOURLY_RATE).toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)' }}>{item.workingHours.toFixed(1)}h</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}