export interface ConfigItem {
  key: string
  value: string
  version: number
  description?: string
  updatedAt?: string
}

export interface SetConfigRequest {
  value: string
  description?: string
}

export interface CreateConfigRequest {
  key: string
  value: string
  description?: string
}

export interface CreateConfigRequest {
  key: string
  value: string
  description?: string
}
