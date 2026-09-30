import {
  activityFeed,
  complaints as sourceComplaints,
  monthlyCollection,
  myComplaints,
  myPayments,
  notices as sourceNotices,
  residents as sourceResidents,
  transactions as sourceTransactions,
} from '../../src/lib/data.js'
import type { Activity, Complaint, Database, Notice, Payment, Resident, Transaction, User } from './types.js'

const societyId = 'SOC-001'
const now = new Date().toISOString()
const demoPasswordHash = '$2b$12$5ENBNt1yVJaXuXV0HHwEte2DGzgm6A0Cl3Lz883Wd.qQRc/Hebv36'
const parseDate = (date: string): string => {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? now : parsed.toISOString()
}

export async function createSeedDatabase(): Promise<Database> {
  const residents: Resident[] = sourceResidents.map((resident, index) => ({
    id: resident.id,
    societyId,
    userId: null,
    name: resident.name,
    unit: resident.unit,
    phone: resident.phone,
    email: `${resident.name.toLowerCase().replaceAll(' ', '.')}@sunriseheights.local`,
    maintenance: resident.maintenance,
    status: resident.status as Resident['status'],
    lastPayment: resident.lastPayment,
    createdAt: now,
  }))
  residents.push({
    id: 'R011', societyId, userId: 'USR-002', name: 'Arjun Sharma', unit: 'A-204',
    phone: '+91 90000 00002', email: 'resident@societyhub.local', maintenance: 2500,
    status: 'Paid', lastPayment: '02 Aug 2026', createdAt: now,
  })

  const users: User[] = [
    {
      id: 'USR-001', name: 'Priya Malhotra', email: 'committee@societyhub.local', phone: '+91 90000 00001',
      passwordHash: demoPasswordHash, role: 'committee', societyId, residentId: null, createdAt: now,
    },
    {
      id: 'USR-002', name: 'Arjun Sharma', email: 'resident@societyhub.local', phone: '+91 90000 00002',
      passwordHash: demoPasswordHash, role: 'resident', societyId, residentId: 'R011', createdAt: now,
    },
  ]

  const residentByName = new Map(residents.map(resident => [resident.name, resident]))
  const complaints: Complaint[] = sourceComplaints.map((complaint, index) => {
    const resident = residentByName.get(complaint.resident) ?? residents[0]
    return {
      ...complaint,
      societyId,
      residentId: resident.id,
      category: complaint.category as Complaint['category'],
      priority: complaint.priority as Complaint['priority'],
      status: complaint.status as Complaint['status'],
      createdAt: parseDate(complaint.date),
      updatedAt: parseDate(complaint.date),
    }
  })
  for (const [index, complaint] of myComplaints.entries()) {
    complaints.push({
      id: `SR-ARJ-${index + 1}`, societyId, residentId: 'R011', unit: 'A-204', resident: 'Arjun Sharma',
      issue: complaint.issue, category: 'Community', priority: 'Medium',
      status: complaint.status as Complaint['status'], date: complaint.date, response: complaint.response,
      createdAt: parseDate(complaint.date), updatedAt: parseDate(complaint.date),
    })
  }

  const notices: Notice[] = sourceNotices.map((notice, index) => ({
    ...notice,
    societyId,
    category: notice.category as Notice['category'],
    priority: notice.priority as Notice['priority'],
    content: notice.preview,
    authorId: 'USR-001',
    createdAt: parseDate(notice.date),
    updatedAt: parseDate(notice.date),
    archived: false,
  }))

  const payments: Payment[] = []
  const transactions: Transaction[] = sourceTransactions.map(transaction => {
    const resident = residentByName.get(transaction.resident) ?? residents[0]
    const payment: Payment = {
      id: `PAY-${transaction.id.slice(4)}`, residentId: resident.id, societyId,
      month: 'September 2026', amount: transaction.amount,
      mode: transaction.mode as Payment['mode'], date: transaction.date,
      status: transaction.status === 'Completed' ? 'Paid' : transaction.status as Payment['status'],
      receipt: `#REC-${transaction.id.slice(-4)}`, createdAt: parseDate(transaction.date),
    }
    payments.push(payment)
    return {
      ...transaction,
      societyId,
      residentId: resident.id,
      category: transaction.category as Transaction['category'],
      mode: transaction.mode as Transaction['mode'],
      status: transaction.status as Transaction['status'],
      createdAt: parseDate(transaction.date),
    }
  })
  for (const payment of myPayments) {
    const seededPayment: Payment = {
      id: `PAY-${payment.id.slice(4)}`, residentId: 'R011', societyId,
      month: payment.month, amount: payment.amount, mode: payment.mode as Payment['mode'],
      date: payment.date, status: payment.status as Payment['status'], receipt: payment.receipt,
      createdAt: parseDate(payment.date),
    }
    payments.push(seededPayment)
    transactions.push({
      id: seededPayment.id.replace('PAY-', 'TXN-'), societyId, residentId: 'R011',
      resident: 'Arjun Sharma', unit: 'A-204', category: 'Maintenance', mode: seededPayment.mode,
      amount: seededPayment.amount, date: seededPayment.date,
      status: seededPayment.status === 'Paid' ? 'Completed' : seededPayment.status,
      createdAt: seededPayment.createdAt,
    })
  }

  const activities: Activity[] = activityFeed.map((activity, index) => ({
    id: `ACT-00${index + 1}`, societyId, action: activity.action,
    type: activity.type as Activity['type'], actorId: 'USR-001',
    createdAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
  }))

  return {
    users,
    societies: [{
      id: societyId, name: 'Sunrise Heights', address: 'Sunrise Heights, Mumbai, Maharashtra',
      totalUnits: 247, wings: 4, maintenancePerUnit: 2950, corpusBalance: 2418500, reserveFund: 573500,
    }],
    residents,
    complaints,
    notices,
    payments,
    transactions,
    activities,
    monthlyCollections: monthlyCollection.map(item => ({
      societyId,
      month: `${new Date(`${item.month} 1, 2026`).toLocaleString('en', { month: 'long' })} 2026`,
      shortMonth: item.month,
      amount: item.amount,
    })),
  }
}