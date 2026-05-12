import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('delivery-accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('delivery-refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/token/refresh`,
            { refreshToken },
          )
          localStorage.setItem('delivery-accessToken', data.data.accessToken)
          localStorage.setItem('delivery-refreshToken', data.data.refreshToken)
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api(original)
        } catch {
          localStorage.removeItem('delivery-accessToken')
          localStorage.removeItem('delivery-refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)
