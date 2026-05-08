import { create } from 'zustand'

export interface Staff {
  id: string; name: string; role: string
  type: 'part-time' | 'full-time'; wage: number
  isAdmin: boolean; fixedOvertimeHours: number; standardMonthlyHours: number
  store?: { id: string; name: string }
}

interface AuthState {
  token: string | null
  staff: Staff | null
  storeStaff: { id: string; name: string; role: string }[]
  setAuth: (token: string, staff: Staff) => void
  logout: () => void
  setStoreStaff: (list: { id: string; name: string; role: string }[]) => void
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('bs_token'),
  staff: (() => { try { return JSON.parse(localStorage.getItem('bs_staff') || 'null') } catch { return null } })(),
  storeStaff: [],
  setAuth: (token, staff) => {
    localStorage.setItem('bs_token', token)
    localStorage.setItem('bs_staff', JSON.stringify(staff))
    set({ token, staff })
  },
  logout: () => {
    localStorage.removeItem('bs_token')
    localStorage.removeItem('bs_staff')
    set({ token: null, staff: null })
  },
  setStoreStaff: (list) => set({ storeStaff: list }),
}))
