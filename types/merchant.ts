export interface MerchantAddress {
  uuid: string
  type: string
  address: string
  networks: Record<string, string[]>
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VirtualAddress {
  receive_address: string
  type: string
  status: number
  last_accessed_date: string
}
