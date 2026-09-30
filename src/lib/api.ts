export type Role = 'committee' | 'resident'
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Pending Response'
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type ComplaintCategory = 'Plumbing' | 'Electrical' | 'Civil' | 'Lift' | 'Security' | 'Community'
export type NoticeCategory = 'Meeting' | 'Event' | 'Maintenance' | 'Policy' | 'Finance'
export type NoticePriority = 'Normal' | 'High' | 'Urgent'
export type PaymentMode = 'UPI' | 'Bank Transfer' | 'Net Banking' | 'Cheque' | 'Cash'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  societyId: string
  residentId: string | null
}

export interface Resident {
  id: string
  societyId: string
  userId: string | null
  name: string
  unit: string
  phone: string
  email: string
  maintenance: number
  status: 'Paid' | 'Pending' | 'Overdue'
  lastPayment: string
  createdAt: string
}

export interface Complaint {
  id: string
  societyId: string
  residentId: string
  unit: string
  resident: string
  issue: string
  category: ComplaintCategory
  priority: ComplaintPriority
  status: ComplaintStatus
  date: string
  response: string
  createdAt: string
  updatedAt: string
}

export interface Notice {
  id: string
  societyId: string
  title: string
  category: NoticeCategory
  priority: NoticePriority
  date: string
  preview: string
  content: string
  author: string
  authorId: string
  createdAt: string
  updatedAt: string
  archived: boolean
}

export interface Payment {
  id: string
  residentId: string
  societyId: string
  month: string
  amount: number
  mode: PaymentMode
  date: string
  status: 'Paid' | 'Pending' | 'Failed'
  receipt: string
  createdAt: string
}

export interface Transaction {
  id: string
  societyId: string
  residentId: string
  resident: string
  unit: string
  category: 'Maintenance' | 'Penalty' | 'Other'
  mode: PaymentMode
  amount: number
  date: string
  status: 'Completed' | 'Pending' | 'Failed'
  createdAt: string
}

export interface Activity {
  id: string
  societyId: string
  action: string
  type: 'complaint' | 'notice' | 'payment' | 'resolved'
  actorId: string
  createdAt: string
}

export interface PageResult<T> {
  data: T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface Dashboard {
  residents: { total: number }
  complaints: { open: number; inProgress: number; resolved: number; pendingResponse: number }
  finance: { currentMonthCollection: number; outstandingDues: number; paidResidents: number; pendingResidents: number; corpusBalance: number; reserveFund: number; collectionRate: number }
  recentNotices: Notice[]
  recentActivity: Activity[]
  monthlyCollections: { societyId: string; month: string; shortMonth: string; amount: number }[]
  society: { id: string; name: string; totalUnits: number; wings: number; maintenancePerUnit: number; corpusBalance: number; reserveFund: number } | null
}

export interface ResidentDashboard {
  resident: Resident
  currentPayment: Payment | null
  recentPayments: Payment[]
  complaints: Complaint[]
  notices: Notice[]
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  error?: { code: string; message: string; details?: unknown }
}

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')
const TOKEN_KEY = 'societyhub-token'

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)
export const saveToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event('societyhub:unauthorized'))
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new Error('Unable to reach SocietyHub. Check that the API server is running.')
  }
  const payload = await response.json() as ApiEnvelope<T>
  if (!response.ok || !payload.success) {
    if (response.status === 401) clearToken()
    throw new Error(payload.error?.message ?? 'The request could not be completed.')
  }
  return payload.data
}

async function list<T>(path: string): Promise<PageResult<T>> {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  } catch {
    throw new Error('Unable to reach SocietyHub. Check that the API server is running.')
  }
  const payload = await response.json() as ApiEnvelope<T[]> & { pagination?: PageResult<T>['pagination']; error?: { message: string } }
  if (!response.ok || !payload.success) {
    if (response.status === 401) clearToken()
    throw new Error(payload.error?.message ?? 'The request could not be completed.')
  }
  return { data: payload.data, pagination: payload.pagination ?? { page: 1, limit: payload.data.length, total: payload.data.length, totalPages: 1 } }
}

async function download(path: string, filename: string): Promise<void> {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  } catch {
    throw new Error('Unable to reach SocietyHub. Check that the API server is running.')
  }
  if (!response.ok) {
    if (response.status === 401) clearToken()
    throw new Error('Unable to export data.')
  }
  const url = URL.createObjectURL(await response.blob())
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const api = {
  async login(email: string, password: string): Promise<User> {
    const result = await request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    saveToken(result.token)
    return result.user
  },
  async register(input: { name: string; email: string; phone: string; password: string; unit: string }): Promise<User> {
    const result = await request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
    saveToken(result.token)
    return result.user
  },
  getCurrentUser: () => request<User>('/auth/me'),
  getAvailableUnits: () => request<string[]>('/auth/units'),
  getProfile: () => request<{ user: User; resident: Resident | null }>('/profile'),
  getDashboard: () => request<Dashboard>('/dashboard'),
  getResidentDashboard: () => request<ResidentDashboard>('/dashboard/me'),
  getResidents: (search = '') => list<Resident>(`/residents?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  createResident: (input: Pick<Resident, 'name' | 'unit' | 'phone' | 'email' | 'maintenance'>) => request<Resident>('/residents', { method: 'POST', body: JSON.stringify(input) }),
  updateResident: (id: string, input: Partial<Pick<Resident, 'name' | 'phone' | 'email' | 'maintenance' | 'status'>>) => request<Resident>(`/residents/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }),
  getComplaints: (query = '') => list<Complaint>(`/complaints?limit=100${query}`),
  getMyComplaints: () => list<Complaint>('/complaints/me?limit=100'),
  createComplaint: (input: { issue: string; category: ComplaintCategory; priority: ComplaintPriority }) => request<Complaint>('/complaints', { method: 'POST', body: JSON.stringify(input) }),
  updateComplaint: (id: string, input: Partial<Pick<Complaint, 'status' | 'priority' | 'response'>>) => request<Complaint>(`/complaints/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }),
  getNotices: (archived = false) => list<Notice>(`/notices?limit=100${archived ? '&archived=true' : ''}`),
  createNotice: (input: Pick<Notice, 'title' | 'category' | 'priority' | 'preview' | 'content'>) => request<Notice>('/notices', { method: 'POST', body: JSON.stringify(input) }),
  updateNotice: (id: string, input: Partial<Pick<Notice, 'title' | 'category' | 'priority' | 'preview' | 'content' | 'archived'>>) => request<Notice>(`/notices/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }),
  getPayments: () => list<Payment>('/payments?limit=100'),
  getMyPayments: () => list<Payment>('/payments/me?limit=100'),
  recordPayment: (input: { residentId: string; month: string; amount: number; mode: PaymentMode; date: string; status: Payment['status'] }) => request<Payment>('/payments', { method: 'POST', body: JSON.stringify(input) }),
  getTransactions: () => list<Transaction>('/transactions?limit=100'),
  getActivities: () => list<Activity>('/activities?limit=100'),
  exportResidents: () => download('/residents/export', 'societyhub-residents.csv'),
  exportTransactions: () => download('/transactions/export', 'societyhub-transactions.csv'),
}