export interface Command {
  id: string
  deviceId: string
  payload: string
  status: string
  createdAt: string
  ackedAt?: string
}

export interface SendCommandRequest {
  payload: string
}
