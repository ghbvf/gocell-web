export interface LoginRequest {
  username: string
  password?: string // Assuming password or other auth methods
}

export interface LoginResponse {
  accessToken: string
}

export interface RegisterRequest {
  username: string
  email?: string
  password?: string
}
