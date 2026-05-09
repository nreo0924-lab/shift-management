export const STORE_ID = import.meta.env.VITE_STORE_ID || 'store-demo'

export const WEEKDAYS = ['日','月','火','水','木','金','土']

export const HOLIDAYS: Record<string,string> = {
  '2026-01-01':'元日','2026-01-12':'成人の日','2026-02-11':'建国記念の日',
  '2026-02-23':'天皇誕生日','2026-03-20':'春分の日','2026-04-29':'昭和の日',
  '2026-05-03':'憲法記念日','2026-05-04':'みどりの日','2026-05-05':'こどもの日',
  '2026-07-20':'海の日','2026-08-11':'山の日','2026-09-21':'敬老の日',
  '2026-09-23':'秋分の日','2026-10-12':'スポーツの日','2026-11-03':'文化の日',
  '2026-11-23':'勤労感謝の日',
}

export const TIME_OPTS = Array.from({length:27},(_,i)=>{
  const t=13*60+i*30
  return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`
})

export const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899']

export function nameColor(name: string) {
  let h=0; for(let i=0;i<name.length;i++) h=name.charCodeAt(i)+((h<<5)-h)
  return COLORS[Math.abs(h)%COLORS.length]
}

export function dk(y:number,m:number,d:number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}
export function todayDk() { const n=new Date(); return dk(n.getFullYear(),n.getMonth(),n.getDate()) }
export function dateDk(d: Date) { return dk(d.getFullYear(),d.getMonth(),d.getDate()) }

export function parseTime(t:string) { const[h,m]=t.split(':').map(Number); return h+m/60 }

export function calcPay(wage:number, type:'part-time'|'full-time', stdHours:number, fixedOT:number, inT:string, outT:string) {
  const s=parseTime(inT); let e=parseTime(outT); if(e<s) e+=24
  const total=e-s, ot=Math.max(0,total-8), ln=Math.max(0,Math.min(e,29)-Math.max(s,22))
  const bh = type==='full-time' ? wage/(stdHours||160) : wage
  const base = type==='part-time' ? (total-ot)*bh : 0
  const otPay = type==='part-time' ? ot*bh*1.25 : 0
  const lnPay = ln*bh*0.25
  return { total, ot, ln, base, otPay, lnPay, pay: base+otPay+lnPay, bh }
}

export function yen(n:number) { return `¥${Math.round(n).toLocaleString('ja-JP')}` }
// --- ここから追記 ---

/**
 * 10日締めに基づいた開始日と終了日を取得する
 * 例: 今日が5月9日なら、4月11日〜5月10日を返す
 */
export function getPayPeriod(d: Date = new Date()) {
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  let start: Date;
  let end: Date;

  if (day <= 10) {
    // 10日以前：先月11日 〜 今月10日
    start = new Date(year, month - 1, 11);
    end = new Date(year, month, 10);
  } else {
    // 11日以降：今月11日 〜 来月10日
    start = new Date(year, month, 11);
    end = new Date(year, month + 1, 10);
  }
  
  return {
    start: dateDk(start),
    end: dateDk(end),
    label: `${start.getMonth() + 1}/${start.getDate()}〜${end.getMonth() + 1}/${end.getDate()}`
  };
}

/**
 * 打刻データに「修正済み」や「労働時間」の情報を付与して整形する
 */
export function formatPunchData(punches: any[], hourlyRate: number) {
  // 日付ごとに「出勤」と「退勤」をペアにする処理（簡易版）
  // ※実際のデータ構造に合わせて調整が必要な場合があります
  return punches.map(p => {
    // 労働時間の計算などは既存の calcPay を活用できます
    // ここでは「修正フラグ」などの基本情報を整理して返します
    return {
      ...p,
      isEdited: p.is_edited || false, // Neonのカラム名に合わせる
      originalTime: p.original_time || null,
      // 表示用の給与計算（時給×時間など）
      displayPay: p.workingHours ? p.workingHours * hourlyRate : 0 
    };
  });
}
// --- ここまで追記 ---
