export interface Role {
  id: string
  name: string
  description: string
}

export interface Permission {
  id: string
  action: string
  resource: string
}
