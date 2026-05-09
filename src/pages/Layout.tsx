import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/store'
import { 
  Clock, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  BarChart2, 
  Users, 
  ClipboardList, // 修正用アイコン
  History      // 履歴用アイコン
} from 'lucide-react'

export default function Layout() {
  const { staff, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 現在のページが選択されているかチェックする関数
  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8eaf2' }}>
      {/* メインコンテンツ */}
      <main style={{ padding: '20px 16px 100px 16px', maxWidth: '600px', margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* 下部ナビゲーションバー */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(20, 22, 35, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #2a2f45',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 5px',
        zIndex: 100
      }}>
        {/* 全員共通：打刻画面 */}
        <Link to="/" style={navItemStyle(isActive('/'))}>
          <Clock size={20} />
          <span style={navLabelStyle}>打刻</span>
        </Link>

        {/* 全員共通：シフト確認 */}
        <Link to="/shift" style={navItemStyle(isActive('/shift'))}>
          <Calendar size={20} />
          <span style={navLabelStyle}>シフト</span>
        </Link>

        {/* ★追加：スタッフ用・給与履歴 */}
        <Link to="/history" style={navItemStyle(isActive('/history'))}>
          <History size={20} />
          <span style={navLabelStyle}>履歴</span>
        </Link>

        {/* 管理者限定メニュー */}
        {staff?.isAdmin && (
          <>
            {/* ★追加：管理者用・勤怠修正 */}
            <Link to="/admin/attendance" style={navItemStyle(isActive('/admin/attendance'))}>
              <ClipboardList size={20} color="#00e87a" />
              <span style={{...navLabelStyle, color: '#00e87a'}}>修正</span>
            </Link>

            <Link to="/admin/stats" style={navItemStyle(isActive('/admin/stats'))}>
              <BarChart2 size={20} color="#00e87a" />
              <span style={{...navLabelStyle, color: '#00e87a'}}>集計</span>
            </Link>
          </>
        )}

        <Link to="/mypage" style={navItemStyle(isActive('/mypage'))}>
          <User size={20} />
          <span style={navLabelStyle}>マイ</span>
        </Link>
      </nav>
    </div>
  )
}

// スタイル定義
const navItemStyle = (active: boolean) => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  textDecoration: 'none',
  gap: '4px',
  color: active ? '#00e87a' : '#8a8f9d',
  transition: '0.2s'
})

const navLabelStyle = {
  fontSize: '10px',
  fontWeight: 700
}