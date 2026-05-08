import { useState, useEffect } from 'react'
import { Clock as ClockIcon, LogOut, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../lib/store'
import { todayDk } from '../lib/utils'
import api from '../lib/api'

export default function Clock() {
  const { staff } = useAuth()
  const [now, setNow] = useState(new Date())
  const [punches, setPunches] = useState<any[]>([])
  const [todayShift, setTodayShift] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const today = todayDk()

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [p, s] = await Promise.all([
        api.get(`/api/punches?from=${today}&to=${today}`),
        api.get(`/api/shifts?from=${today}&to=${today}`),
      ])
      setPunches(p.data.filter((x: any) => x.date === today))
      setTodayShift(s.data.find((x: any) => x.staffId === staff?.id && x.date === today) || null)
    } catch {}
  }

  // --- 位置情報チェックのロジック ---
  const STORE_LAT = 35.005112995762076;
  const STORE_LNG = 135.77577479073744;
  const ALLOWED_DISTANCE = 200; // 200m

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const punch = async (type: 'in'|'out') => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('位置情報がサポートされていません');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistance(latitude, longitude, STORE_LAT, STORE_LNG);

        if (distance > ALLOWED_DISTANCE) {
          toast.error(`お店から離れすぎです（約${Math.round(distance)}m）。200m以内で打刻してください。`, { duration: 4000 });
          setLoading(false);
          return;
        }

        try {
          const { data } = await api.post('/api/punches', { type });
          setPunches(p => [...p, data]);
          toast.success(type === 'in' ? `出勤しました！ ${data.time}` : `退勤しました！ ${data.time}`);
        } catch (e: any) {
          toast.error(e.response?.data?.error || 'エラーが発生しました');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        toast.error('位置情報の取得に失敗しました。設定で許可してください。');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const last = punches[punches.length - 1]
  const isClockedIn = last?.type === 'in'
  const time = now.toLocaleTimeString('ja-JP', { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' })
  const date = now.toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', weekday:'short' })

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ textAlign:'center', padding:'20px 0 8px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:48, fontWeight:700, color:'var(--text)', letterSpacing:'-2px', lineHeight:1 }}>{time}</div>
        <div style={{ color:'var(--accent)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.3em', marginTop:10 }}>{date}</div>
      </div>

      {todayShift?.type !== 'off' && todayShift && (
        <div style={{ background:'rgba(0,232,122,0.06)', border:'1px solid rgba(0,232,122,0.2)', borderRadius:'var(--r2)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <CalendarDays size={15} color="var(--green)"/>
            <div>
              <div style={{ fontSize:9, color:'rgba(0,232,122,0.6)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>本日の予定</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:700, marginTop:1 }}>{todayShift.start} — {todayShift.end}</div>
            </div>
          </div>
          <span style={{ fontSize:9, fontWeight:900, color:'var(--green)', background:'rgba(0,232,122,0.1)', padding:'3px 8px', borderRadius:'3px', border:'1px solid rgba(0,232,122,0.2)' }}>{todayShift.type==='eve'?'夜勤':'日勤'}</span>
        </div>
      )}

      {last && (
        <div style={{ textAlign:'center', fontSize:10, fontWeight:700, color:isClockedIn?'var(--green)':'var(--text3)', textTransform:'uppercase', letterSpacing:'0.2em' }}>
          {isClockedIn ? `● 出勤中 — ${last.time}〜` : `○ 退勤済 — ${last.time}`}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[['in','出勤',ClockIcon],['out','退勤',LogOut]].map(([type, label, Icon]: any) => {
          const disabled = type==='in' ? isClockedIn : !isClockedIn
          return (
            <button key={type} onClick={() => punch(type)} disabled={disabled || loading}
              style={{ padding:'26px 16px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, background:disabled?'var(--bg3)':type==='in'?'var(--text)':'#c0202e', color:disabled?'var(--text3)':type==='in'?'var(--bg)':'#fff', border:`2px solid ${disabled?'var(--border)':type==='in'?'var(--text)':'#c0202e'}`, borderRadius:'var(--r2)', opacity:disabled?0.35:1, cursor:disabled?'not-allowed':'pointer', transition:'all 0.15s' }}>
              <Icon size={26}/>
              <span style={{ fontWeight:900, fontSize:15, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
            </button>
          )
        })}
      </div>

      {punches.length > 0 && (
        <div className="card">
          <p style={{ fontSize:9, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:12 }}>本日の打刻履歴</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {punches.map((p:any) => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.12em', padding:'3px 8px', background:p.type==='in'?'rgba(0,232,122,0.1)':'rgba(255,61,90,0.1)', color:p.type==='in'?'var(--green)':'var(--red)', border:`1px solid ${p.type==='in'?'rgba(0,232,122,0.25)':'rgba(255,61,90,0.25)'}`, borderRadius:'3px' }}>{p.type==='in'?'出勤':'退勤'}</span>
                <span style={{ fontFamily:'var(--mono)', fontWeight:700, fontSize:14 }}>{p.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}