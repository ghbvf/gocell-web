import axios from 'axios'
import { message } from 'ant-design-vue'
import { useAuthStore } from '../stores/auth'

const client = axios.create({
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      if (auth.token) {
        auth.logout()
        message.warning('登录凭证已过期或后端已重启重置，请重新登录')
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      message.error('权限不足：该操作要求更高等级的 Role 授权（如 admin 权限）')
    }
    return Promise.reject(error)
  }
)

export default client
