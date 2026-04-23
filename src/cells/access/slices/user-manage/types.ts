export interface User {
  id: string
  username: string
  email: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password?: string
}

export interface PatchUserRequest {
  name?: string
  email?: string
  status?: string
}
