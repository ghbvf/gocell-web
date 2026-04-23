export interface Device {
  id: string
  name: string
  macAddress: string
  registeredAt: string
}

export interface DeviceStatus {
  deviceId: string
  online: boolean
  lastSeen: string
  firmwareVersion: string
}

export interface RegisterDeviceRequest {
  name: string
  macAddress: string
}
