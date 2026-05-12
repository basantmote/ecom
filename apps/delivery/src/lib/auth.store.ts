import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  role: string | null
  setTokens: (accessToken: string, refreshToken: string, userId: string, role: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      role: null,
      setTokens: (accessToken, refreshToken, userId, role) =>
        set({ accessToken, refreshToken, userId, role }),
      logout: () => set({ accessToken: null, refreshToken: null, userId: null, role: null }),
    }),
    { name: 'delivery-auth' },
  ),
)
