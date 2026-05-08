// src/pages/MyPage.tsx
import { useState } from 'react'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../lib/store'
import api from '../lib/api'

export default function MyPage() {
  const { staff } = useAuth()
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [saving, setSaving] = useState(false)
  if (!staff) return null

  const changePin = async () => {
    if (next.length!==4||!/^\d+$/.test(next)){toast.error('4桁の数字を入力してください');return}
    setSaving(true)
    try { await api.patch('/api/auth/pin',{currentPin:cur,newPin:next}); toast.success('PINを変更しました'); setCur(''); setNext('') }
    catch(e:any){ toast.error(e.response?.data?.error||'変更に失敗しました') }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <h2 style={{ fontSize:14, fontWeight:900 }}>マイページ</h2>
      <div className="card">
        <p className="label" style={{ marginBottom:14 }}>プロフィール</p>
        {[['名前',staff.name,'var(--text)'],['雇用形態',staff.type==='full-time'?'正社員':'アルバイト','var(--text)'],['役割',staff.role,'var(--text)'],[staff.type==='full-time'?'月給':'時給',`¥${staff.wage.toLocaleString()}${staff.type==='full-time'?'':'/h'}`,'var(--accent)'],['権限',staff.isAdmin?'管理者':'スタッフ',staff.isAdmin?'var(--accent)':'var(--text)']].map(([l,v,c])=>(
          <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:11, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</span>
            <span style={{ fontWeight:900, color:c as string, fontSize:13, fontFamily:'var(--mono)' }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}><Lock size={12} color="var(--accent)"/><p className="label" style={{margin:0}}>PINコード変更</p></div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[['現在のPIN',cur,setCur],['新しいPIN',next,setNext]].map(([l,v,fn]:any)=>(
            <div key={l}>
              <label className="label">{l}</label>
              <input type="password" maxLength={4} value={v} onChange={e=>fn(e.target.value)} placeholder="••••" className="input" style={{ fontFamily:'var(--mono)', letterSpacing:'0.3em' }}/>
            </div>
          ))}
          <button className="btn btn-primary" onClick={changePin} disabled={saving||cur.length!==4||next.length!==4} style={{ width:'100%', marginTop:4 }}>{saving?'変更中...':'PINを変更する'}</button>
        </div>
      </div>
    </div>
  )
}