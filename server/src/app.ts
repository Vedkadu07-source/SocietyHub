import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from './config/env.js'
import { readDatabase, updateDatabase } from './utils/jsonDb.js'
import { createId } from './utils/id.js'
import type { AuthPayload, Database, PublicUser, Role } from './types.js'

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message)
  }
}

declare global {
  namespace Express {
    interface Request { auth?: AuthPayload }
  }
}

const app = express()
app.use(helmet())
app.use(cors({ origin: env.clientUrl.split(',').map(origin => origin.trim()), credentials: false }))
app.use(express.json({ limit: '100kb' }))
app.use((request, _response, next) => {
  console.info(`${request.method} ${request.path}`)
  next()
})

const emailSchema = z.string().trim().email().max(254)
const passwordSchema = z.string().min(8).max(128)
const roleSchema = z.enum(['committee', 'resident'])
const categories = ['Plumbing', 'Electrical', 'Civil', 'Lift', 'Security', 'Community'] as const
const priorities = ['Low', 'Medium', 'High', 'Critical'] as const
const complaintStatuses = ['Open', 'In Progress', 'Resolved', 'Pending Response'] as const
const noticeCategories = ['Meeting', 'Event', 'Maintenance', 'Policy', 'Finance'] as const
const noticePriorities = ['Normal', 'High', 'Urgent'] as const
const paymentModes = ['UPI', 'Bank Transfer', 'Net Banking', 'Cheque', 'Cash'] as const
const paymentStatuses = ['Paid', 'Pending', 'Failed'] as const

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request', result.error.flatten())
  return result.data
}

function success(response: Response, data: unknown, status = 200): void {
  response.status(status).json({ success: true, data })
}

function publicUser(user: Database['users'][number]): PublicUser {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

function createToken(user: Database['users'][number]): string {
  return jwt.sign({ userId: user.id, role: user.role, societyId: user.societyId, residentId: user.residentId }, env.jwtSecret, { subject: user.id, expiresIn: '8h' })
}

function authenticate(request: Request, _response: Response, next: NextFunction): void {
  const authorization = request.headers.authorization
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'))
  try {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & AuthPayload
    if (!payload.userId || !roleSchema.safeParse(payload.role).success || !payload.societyId) {
      throw new Error('Invalid token claims')
    }
    request.auth = { userId: payload.userId, role: payload.role, societyId: payload.societyId, residentId: payload.residentId ?? null }
    next()
  } catch {
    next(new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token'))
  }
}

function authorize(...roles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.auth) return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'))
    if (!roles.includes(request.auth.role)) return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action'))
    next()
  }
}

function scoped<T extends { societyId: string }>(records: T[], societyId: string): T[] {
  return records.filter(record => record.societyId === societyId)
}

function paginate<T>(records: T[], request: Request): { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } } {
  const page = Math.max(1, Number(request.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 20))
  const start = (page - 1) * limit
  return { data: records.slice(start, start + limit), pagination: { page, limit, total: records.length, totalPages: Math.ceil(records.length / limit) } }
}

function recordActivity(database: Database, societyId: string, actorId: string, action: string, type: Database['activities'][number]['type']): void {
  database.activities.unshift({ id: createId('ACT'), societyId, actorId, action, type, createdAt: new Date().toISOString() })
}

function csvCell(value: unknown): string {
  const raw = String(value ?? '')
  const text = /^[\t\r ]*[=+\-@]/.test(raw) ? `'${raw}` : raw
  return `"${text.replaceAll('"', '""')}"`
}

function sendCsv(response: Response, filename: string, headers: string[], rows: unknown[][]): void {
  const content = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')
  response.setHeader('Content-Type', 'text/csv; charset=utf-8')
  response.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  response.send(content)
}

app.get('/api/health', (_request, response) => success(response, { message: 'SocietyHub API is running' }))

app.post('/api/auth/register', async (request, response) => {
  const input = parse(z.object({ name: z.string().trim().min(2).max(100), email: emailSchema, phone: z.string().trim().min(7).max(24), password: passwordSchema, unit: z.string().trim().min(2).max(12) }), request.body)
  const created = await updateDatabase(async database => {
    const society = database.societies[0]
    if (!society) throw new ApiError(503, 'NOT_READY', 'Society registration is not available')
    if (database.users.some(user => user.email.toLowerCase() === input.email.toLowerCase())) throw new ApiError(409, 'EMAIL_EXISTS', 'An account with this email already exists')
    const resident = database.residents.find(item => item.societyId === society.id && item.unit.toLowerCase() === input.unit.toLowerCase())
    if (!resident || resident.userId) throw new ApiError(409, 'UNIT_UNAVAILABLE', 'This unit cannot be registered')
    const user = { id: createId('USR'), name: input.name, email: input.email.toLowerCase(), phone: input.phone, passwordHash: await bcrypt.hash(input.password, 12), role: 'resident' as const, societyId: society.id, residentId: resident.id, createdAt: new Date().toISOString() }
    user && database.users.push(user)
    resident.userId = user.id
    resident.name = user.name
    resident.phone = user.phone
    resident.email = user.email
    return user
  })
  success(response, { token: createToken(created), user: publicUser(created) }, 201)
})

app.post('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts. Try again later.' } }),
}), async (request, response) => {
  const input = parse(z.object({ email: emailSchema, password: passwordSchema }), request.body)
  const database = await readDatabase()
  const user = database.users.find(item => item.email.toLowerCase() === input.email.toLowerCase())
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect')
  success(response, { token: createToken(user), user: publicUser(user) })
})

app.get('/api/auth/units', async (_request, response) => {
  const database = await readDatabase()
  success(response, database.residents.filter(resident => !resident.userId).map(resident => resident.unit).sort())
})

app.use('/api', (request, response, next) => {
  const publicPaths = ['/health', '/auth/login', '/auth/register', '/auth/units']
  return publicPaths.includes(request.path) ? next() : authenticate(request, response, next)
})

app.param('id', (_request, _response, next, id: string) => {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) return next(new ApiError(400, 'VALIDATION_ERROR', 'Invalid ID'))
  next()
})

app.get('/api/auth/me', async (request, response) => {
  const database = await readDatabase()
  const user = database.users.find(item => item.id === request.auth!.userId)
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Account no longer exists')
  success(response, publicUser(user))
})

app.get('/api/profile', async (request, response) => {
  const database = await readDatabase()
  const user = database.users.find(item => item.id === request.auth?.userId)
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'Profile not found')
  const resident = user.residentId ? database.residents.find(item => item.id === user.residentId && item.societyId === user.societyId) : null
  success(response, { user: publicUser(user), resident: resident ?? null })
})

app.get('/api/residents/export', authorize('committee'), async (request, response) => {
  const database = await readDatabase()
  const residents = scoped(database.residents, request.auth!.societyId)
  sendCsv(response, 'societyhub-residents.csv', ['id', 'name', 'unit', 'phone', 'email', 'maintenance', 'status', 'lastPayment'], residents.map(item => [item.id, item.name, item.unit, item.phone, item.email, item.maintenance, item.status, item.lastPayment]))
})

app.get('/api/residents', authorize('committee'), async (request, response) => {
  const database = await readDatabase()
  const search = String(request.query.search ?? '').toLowerCase()
  const records = scoped(database.residents, request.auth!.societyId).filter(item => !search || `${item.name} ${item.unit} ${item.phone} ${item.email}`.toLowerCase().includes(search))
  const result = paginate(records, request)
  response.json({ success: true, ...result })
})

app.get('/api/residents/:id', authorize('committee'), async (request, response) => {
  const database = await readDatabase()
  const resident = database.residents.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId)
  if (!resident) throw new ApiError(404, 'NOT_FOUND', 'Resident not found')
  success(response, resident)
})

app.post('/api/residents', authorize('committee'), async (request, response) => {
  const input = parse(z.object({ name: z.string().trim().min(2).max(100), unit: z.string().trim().min(2).max(12), phone: z.string().trim().min(7).max(24), email: emailSchema, maintenance: z.number().positive().max(100000), status: z.enum(['Paid', 'Pending', 'Overdue']).default('Pending') }), request.body)
  const resident = await updateDatabase(database => {
    if (database.residents.some(item => item.societyId === request.auth!.societyId && item.unit.toLowerCase() === input.unit.toLowerCase())) throw new ApiError(409, 'UNIT_EXISTS', 'A resident is already registered to this unit')
    const created = { ...input, id: createId('RES'), societyId: request.auth!.societyId, userId: null, lastPayment: '', createdAt: new Date().toISOString() }
    database.residents.push(created)
    return created
  })
  success(response, resident, 201)
})

app.patch('/api/residents/:id', authorize('committee'), async (request, response) => {
  const input = parse(z.object({ name: z.string().trim().min(2).max(100).optional(), phone: z.string().trim().min(7).max(24).optional(), email: emailSchema.optional(), maintenance: z.number().positive().max(100000).optional(), status: z.enum(['Paid', 'Pending', 'Overdue']).optional() }).strict(), request.body)
  const resident = await updateDatabase(database => {
    const record = database.residents.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId)
    if (!record) throw new ApiError(404, 'NOT_FOUND', 'Resident not found')
    Object.assign(record, input)
    return record
  })
  success(response, resident)
})

app.get('/api/complaints/me', authorize('resident'), async (request, response) => {
  const database = await readDatabase()
  const result = paginate(database.complaints.filter(item => item.societyId === request.auth!.societyId && item.residentId === request.auth!.residentId), request)
  response.json({ success: true, ...result })
})

app.get('/api/complaints', authorize('committee'), async (request, response) => {
  const database = await readDatabase()
  const status = request.query.status ? parse(z.enum(complaintStatuses), request.query.status) : undefined
  const category = request.query.category ? parse(z.enum(categories), request.query.category) : undefined
  const search = String(request.query.search ?? '').toLowerCase()
  const records = scoped(database.complaints, request.auth!.societyId).filter(item => (!status || item.status === status) && (!category || item.category === category) && (!search || `${item.id} ${item.unit} ${item.resident} ${item.issue}`.toLowerCase().includes(search)))
  const result = paginate(records, request)
  response.json({ success: true, ...result })
})

app.post('/api/complaints', authorize('resident'), async (request, response) => {
  const input = parse(z.object({ issue: z.string().trim().min(5).max(500), category: z.enum(categories), priority: z.enum(priorities).default('Medium') }), request.body)
  const complaint = await updateDatabase(database => {
    const resident = database.residents.find(item => item.id === request.auth!.residentId && item.societyId === request.auth!.societyId)
    if (!resident) throw new ApiError(404, 'NOT_FOUND', 'Resident profile not found')
    const now = new Date().toISOString()
    const created = { id: createId('SR'), societyId: resident.societyId, residentId: resident.id, unit: resident.unit, resident: resident.name, issue: input.issue, category: input.category, priority: input.priority, status: 'Open' as const, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), response: '', createdAt: now, updatedAt: now }
    database.complaints.unshift(created)
    recordActivity(database, resident.societyId, request.auth!.userId, `Complaint ${created.id} created by ${resident.unit}`, 'complaint')
    return created
  })
  success(response, complaint, 201)
})

app.get('/api/complaints/:id', async (request, response) => {
  const database = await readDatabase()
  const complaint = database.complaints.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId && (request.auth!.role === 'committee' || item.residentId === request.auth!.residentId))
  if (!complaint) throw new ApiError(404, 'NOT_FOUND', 'Complaint not found')
  success(response, complaint)
})

app.patch('/api/complaints/:id', authorize('committee'), async (request, response) => {
  const input = parse(z.object({ status: z.enum(complaintStatuses).optional(), priority: z.enum(priorities).optional(), response: z.string().trim().max(1000).optional() }).strict(), request.body)
  const complaint = await updateDatabase(database => {
    const record = database.complaints.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId)
    if (!record) throw new ApiError(404, 'NOT_FOUND', 'Complaint not found')
    const previousStatus = record.status
    Object.assign(record, input, { updatedAt: new Date().toISOString() })
    if (input.status && input.status !== previousStatus) recordActivity(database, record.societyId, request.auth!.userId, `Complaint ${record.id} marked ${input.status}`, input.status === 'Resolved' ? 'resolved' : 'complaint')
    return record
  })
  success(response, complaint)
})

app.get('/api/notices', async (request, response) => {
  const database = await readDatabase()
  const category = request.query.category ? parse(z.enum(noticeCategories), request.query.category) : undefined
  const includeArchived = request.auth!.role === 'committee' && request.query.archived === 'true'
  const records = scoped(database.notices, request.auth!.societyId).filter(item => (includeArchived || !item.archived) && (!category || item.category === category))
  response.json({ success: true, ...paginate(records, request) })
})

app.get('/api/notices/:id', async (request, response) => {
  const database = await readDatabase()
  const notice = database.notices.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId && (request.auth!.role === 'committee' || !item.archived))
  if (!notice) throw new ApiError(404, 'NOT_FOUND', 'Notice not found')
  success(response, notice)
})

app.post('/api/notices', authorize('committee'), async (request, response) => {
  const input = parse(z.object({ title: z.string().trim().min(4).max(160), category: z.enum(noticeCategories), priority: z.enum(noticePriorities).default('Normal'), preview: z.string().trim().min(5).max(500), content: z.string().trim().min(5).max(5000) }), request.body)
  const notice = await updateDatabase(database => {
    const user = database.users.find(item => item.id === request.auth!.userId)!
    const now = new Date().toISOString()
    const created = { ...input, id: createId('NOT'), societyId: request.auth!.societyId, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), author: user.name, authorId: user.id, createdAt: now, updatedAt: now, archived: false }
    database.notices.unshift(created)
    recordActivity(database, created.societyId, user.id, `Notice posted: ${created.title}`, 'notice')
    return created
  })
  success(response, notice, 201)
})

app.patch('/api/notices/:id', authorize('committee'), async (request, response) => {
  const input = parse(z.object({ title: z.string().trim().min(4).max(160).optional(), category: z.enum(noticeCategories).optional(), priority: z.enum(noticePriorities).optional(), preview: z.string().trim().min(5).max(500).optional(), content: z.string().trim().min(5).max(5000).optional(), archived: z.boolean().optional() }).strict(), request.body)
  const notice = await updateDatabase(database => {
    const record = database.notices.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId)
    if (!record) throw new ApiError(404, 'NOT_FOUND', 'Notice not found')
    const wasArchived = record.archived
    Object.assign(record, input, { updatedAt: new Date().toISOString() })
    if (input.archived && !wasArchived) recordActivity(database, record.societyId, request.auth!.userId, `Notice archived: ${record.title}`, 'notice')
    return record
  })
  success(response, notice)
})

app.delete('/api/notices/:id', authorize('committee'), async (request, response) => {
  const notice = await updateDatabase(database => {
    const record = database.notices.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId)
    if (!record) throw new ApiError(404, 'NOT_FOUND', 'Notice not found')
    const wasArchived = record.archived
    record.archived = true
    record.updatedAt = new Date().toISOString()
    if (!wasArchived) recordActivity(database, record.societyId, request.auth!.userId, `Notice archived: ${record.title}`, 'notice')
    return record
  })
  success(response, notice)
})

app.get('/api/payments/me', authorize('resident'), async (request, response) => {
  const database = await readDatabase()
  const records = database.payments.filter(item => item.societyId === request.auth!.societyId && item.residentId === request.auth!.residentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  response.json({ success: true, ...paginate(records, request) })
})

app.get('/api/payments', authorize('committee'), async (request, response) => {
  const database = await readDatabase()
  const records = scoped(database.payments, request.auth!.societyId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  response.json({ success: true, ...paginate(records, request) })
})

app.get('/api/payments/:id', async (request, response) => {
  const database = await readDatabase()
  const payment = database.payments.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId && (request.auth!.role === 'committee' || item.residentId === request.auth!.residentId))
  if (!payment) throw new ApiError(404, 'NOT_FOUND', 'Payment not found')
  success(response, payment)
})

app.post('/api/payments', authorize('committee'), async (request, response) => {
  const input = parse(z.object({ residentId: z.string().min(2).max(80), month: z.string().trim().regex(/^(January|February|March|April|May|June|July|August|September|October|November|December) 20\d{2}$/), amount: z.number().positive().max(1000000), mode: z.enum(paymentModes), date: z.string().date(), status: z.enum(paymentStatuses).default('Paid') }), request.body)
  const payment = await updateDatabase(database => {
    const resident = database.residents.find(item => item.id === input.residentId && item.societyId === request.auth!.societyId)
    if (!resident) throw new ApiError(404, 'NOT_FOUND', 'Resident not found')
    if (input.status === 'Paid' && input.amount < resident.maintenance) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Paid maintenance must cover the resident monthly amount')
    }
    const alreadyPaid = database.payments.some(item => item.societyId === resident.societyId && item.residentId === resident.id && item.month.toLowerCase() === input.month.toLowerCase() && item.status === 'Paid')
    if (input.status === 'Paid' && alreadyPaid) {
      throw new ApiError(409, 'PAYMENT_EXISTS', 'A paid maintenance entry already exists for this resident and month')
    }
    const created = { ...input, id: createId('PAY'), societyId: resident.societyId, receipt: `#REC-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() }
    database.payments.unshift(created)
    if (created.status === 'Paid') {
      database.transactions.unshift({ id: createId('TXN'), societyId: resident.societyId, residentId: resident.id, resident: resident.name, unit: resident.unit, category: 'Maintenance', mode: created.mode, amount: created.amount, date: created.date, status: 'Completed', createdAt: created.createdAt })
      resident.status = 'Paid'
      resident.lastPayment = created.date
      const collection = database.monthlyCollections.find(item => item.societyId === resident.societyId && item.month.toLowerCase() === created.month.toLowerCase())
      if (collection) collection.amount += created.amount
      else database.monthlyCollections.push({ societyId: resident.societyId, month: created.month, shortMonth: created.month.slice(0, 3), amount: created.amount })
    }
    const action = created.status === 'Paid'
      ? `₹${created.amount.toLocaleString('en-IN')} received from ${resident.name} (${resident.unit})`
      : `Payment recorded as ${created.status} for ${resident.name} (${resident.unit})`
    recordActivity(database, resident.societyId, request.auth!.userId, action, 'payment')
    return created
  })
  success(response, payment, 201)
})

app.get('/api/transactions/export', authorize('committee'), async (request, response) => {
  const database = await readDatabase()
  const records = scoped(database.transactions, request.auth!.societyId)
  sendCsv(response, 'societyhub-transactions.csv', ['id', 'resident', 'unit', 'category', 'mode', 'amount', 'date', 'status'], records.map(item => [item.id, item.resident, item.unit, item.category, item.mode, item.amount, item.date, item.status]))
})

app.get('/api/transactions', async (request, response) => {
  const database = await readDatabase()
  const records = database.transactions.filter(item => item.societyId === request.auth!.societyId && (request.auth!.role === 'committee' || item.residentId === request.auth!.residentId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  response.json({ success: true, ...paginate(records, request) })
})

app.get('/api/transactions/:id', async (request, response) => {
  const database = await readDatabase()
  const record = database.transactions.find(item => item.id === request.params.id && item.societyId === request.auth!.societyId && (request.auth!.role === 'committee' || item.residentId === request.auth!.residentId))
  if (!record) throw new ApiError(404, 'NOT_FOUND', 'Transaction not found')
  success(response, record)
})

app.get('/api/activities', authorize('committee'), async (request, response) => {
  const database = await readDatabase()
  const records = scoped(database.activities, request.auth!.societyId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  response.json({ success: true, ...paginate(records, request) })
})

function getDashboard(database: Database, societyId: string) {
  const society = database.societies.find(item => item.id === societyId)
  const residents = database.residents.filter(item => item.societyId === societyId)
  const complaints = database.complaints.filter(item => item.societyId === societyId)
  const currentMonth = new Date().toLocaleString('en', { month: 'long', year: 'numeric' })
  const monthlyCollections = database.monthlyCollections.filter(item => item.societyId === societyId)
  const currentCollection = monthlyCollections.find(item => item.month === currentMonth)?.amount ?? 0
  const paidResidents = residents.filter(item => item.status === 'Paid').length
  const pendingResidents = residents.filter(item => item.status !== 'Paid').length
  const outstandingDues = residents.filter(item => item.status !== 'Paid').reduce((sum, item) => sum + item.maintenance, 0)
  return {
    residents: { total: residents.length },
    complaints: {
      open: complaints.filter(item => item.status === 'Open').length,
      inProgress: complaints.filter(item => item.status === 'In Progress').length,
      resolved: complaints.filter(item => item.status === 'Resolved').length,
      pendingResponse: complaints.filter(item => item.status === 'Pending Response').length,
    },
    finance: { currentMonthCollection: currentCollection, outstandingDues, paidResidents, pendingResidents, corpusBalance: society?.corpusBalance ?? 0, reserveFund: society?.reserveFund ?? 0, collectionRate: residents.length ? Math.round(paidResidents / residents.length * 100) : 0 },
    recentNotices: database.notices.filter(item => item.societyId === societyId && !item.archived).slice(0, 5),
    recentActivity: database.activities.filter(item => item.societyId === societyId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    monthlyCollections,
    society: society ?? null,
  }
}

app.get('/api/dashboard', authorize('committee'), async (request, response) => success(response, getDashboard(await readDatabase(), request.auth!.societyId)))

app.get('/api/dashboard/me', authorize('resident'), async (request, response) => {
  const database = await readDatabase()
  const resident = database.residents.find(item => item.id === request.auth!.residentId && item.societyId === request.auth!.societyId)
  if (!resident) throw new ApiError(404, 'NOT_FOUND', 'Resident profile not found')
  success(response, {
    resident,
    currentPayment: database.payments.find(item => item.residentId === resident.id && item.societyId === resident.societyId && item.status === 'Paid') ?? null,
    recentPayments: database.payments.filter(item => item.residentId === resident.id && item.societyId === resident.societyId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    complaints: database.complaints.filter(item => item.residentId === resident.id && item.societyId === resident.societyId),
    notices: database.notices.filter(item => item.societyId === resident.societyId && !item.archived).slice(0, 5),
  })
})

app.use((request, _response, next) => next(new ApiError(404, 'NOT_FOUND', `Route ${request.method} ${request.path} not found`)))

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof ApiError) {
    response.status(error.status).json({ success: false, error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } })
    return
  }
  if (error instanceof z.ZodError) {
    response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: error.flatten() } })
    return
  }
  if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.parse.failed') {
    response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Request body must contain valid JSON' } })
    return
  }
  console.error(error)
  response.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred' } })
})

export default app