import client from '@/shared/api/client'

// L1: 创建用户
export const createDemoUser = (data: any) => client.post('/api/v1/access/users', data)

// L2: 创建订单
export const createDemoOrder = (data: any) => client.post('/api/v1/orders/', data)

// L3: 跨Cell测试，查审计日志看事件传播
export const queryAuditLogs = () => client.get('/api/v1/audit/entries')

// L4: 设备命令
export const sendDeviceCommand = (deviceId: string, data: any) =>
  client.post(`/api/v1/devices/${deviceId}/commands`, data)

// Generic: 登录触发事件
export const demoLogin = (data: any) => client.post('/api/v1/access/sessions/login', data)
