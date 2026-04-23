// Empty types for now as consistency demo doesn't define specific models beyond simple state.
export interface EventLog {
  id: string
  timestamp: string
  action: string
  status: 'pending' | 'success' | 'error'
  detail?: string
}
