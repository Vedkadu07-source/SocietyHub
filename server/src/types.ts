export type Role = 'committee' | 'resident'
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Pending Response'
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type ComplaintCategory = 'Plumbing' | 'Electrical' | 'Civil' | 'Lift' | 'Security' | 'Community'
export type NoticeCategory = 'Meeting' | 'Event' | 'Maintenance' | 'Policy' | 'Finance'
export type NoticePriority = 'Normal' | 'High' | 'Urgent'
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed'
export type PaymentMode = 'UPI' | 'Bank Transfer' | 'Net Banking' | 'Cheque' | 'Cash'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  passwordHash: string
  role: Role
  societyId: string
  residentId: string | null
  createdAt: string
}

export type PublicUser = Omit<User, 'passwordHash'>

export interface Society {
  id: string
  name: string
  address: string
  totalUnits: number
  wings: number
  maintenancePerUnit: number
  corpusBalance: number
  reserveFund: number
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
  status: PaymentStatus
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

export interface MonthlyCollection {
  societyId: string
  month: string
  shortMonth: string
  amount: number
}

export interface Database {
  users: User[]
  societies: Society[]
  residents: Resident[]
  complaints: Complaint[]
  notices: Notice[]
  payments: Payment[]
  transactions: Transaction[]
  activities: Activity[]
  monthlyCollections: MonthlyCollection[]
}

export interface AuthPayload {
  userId: string
  role: Role
  societyId: string
  residentId: string | null
}