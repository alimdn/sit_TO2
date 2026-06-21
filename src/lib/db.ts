/**
 * Database adapter — Supabase-backed implementation that mimics the Prisma Client API.
 *
 * Why: Prisma's connection pooler for Supabase requires SNI/IPv6 that this deployment
 * environment doesn't support. Supabase's PostgREST API works perfectly over HTTPS,
 * so we use the JS SDK and expose a Prisma-compatible interface so existing API
 * routes (which all do `const { db } = await import('@/lib/db')`) keep working
 * unchanged.
 *
 * Supported methods per model: findMany, findUnique, create, update, delete, upsert, count.
 * Filter syntax (subset of Prisma): { where: { field: value, AND?: [], OR?: [] } }
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('[db] Supabase env vars not set — database calls will fail. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.')
}

// Singleton client
let _client: SupabaseClient | null = null
function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return _client
}

// --- Types ---

type PrismaWhere = Record<string, any> & {
  AND?: PrismaWhere[]
  OR?: PrismaWhere[]
  NOT?: PrismaWhere
}

interface FindManyArgs {
  where?: PrismaWhere
  orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>
  take?: number
  skip?: number
  select?: Record<string, boolean>
}

interface FindUniqueArgs {
  where: Record<string, any>
  select?: Record<string, boolean>
}

interface CreateArgs {
  data: Record<string, any>
  select?: Record<string, boolean>
}

interface UpdateArgs {
  where: Record<string, any>
  data: Record<string, any>
  select?: Record<string, boolean>
}

interface DeleteArgs {
  where: Record<string, any>
  select?: Record<string, boolean>
}

interface UpsertArgs {
  where: Record<string, any>
  create: Record<string, any>
  update: Record<string, any>
  select?: Record<string, boolean>
}

interface CountArgs {
  where?: PrismaWhere
}

// --- Filter translator: Prisma where → PostgREST query params ---

function applyFilters(query: any, where?: PrismaWhere): any {
  if (!where) return query
  let q = query

  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND' && Array.isArray(value)) {
      // AND: each filter must match — chain with .and()
      const filters = value.map((f) => buildFilterString(f)).filter(Boolean)
      if (filters.length) {
        q = q.or(filters.join(','))
        // Actually, supabase: .or with comma = OR. For AND we need .and() — but supabase-js uses nested filters.
        // Simpler: apply each AND filter as its own .eq/.contains chain.
        q = query
        for (const f of value) {
          q = applyFilters(q, f)
        }
      }
      continue
    }
    if (key === 'OR' && Array.isArray(value)) {
      const filters = value.map((f) => buildFilterString(f)).filter(Boolean)
      if (filters.length) {
        q = q.or(filters.join(','))
      }
      continue
    }
    if (key === 'NOT' && typeof value === 'object') {
      // NOT: invert each filter
      const inner = buildFilterString(value)
      if (inner) {
        q = q.not(inner.split('.')[0], inner.split('.')[1].split('(')[0], inner.match(/\(([^)]+)\)/)?.[1])
      }
      continue
    }

    if (value === null || value === undefined) {
      q = q.is(key, null)
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Prisma operators: { contains, startsWith, endsWith, gt, lt, gte, lte, in, not, notIn }
      for (const [op, opVal] of Object.entries(value)) {
        switch (op) {
          case 'contains':
            q = q.ilike(key, `%${opVal}%`)
            break
          case 'startsWith':
            q = q.ilike(key, `${opVal}%`)
            break
          case 'endsWith':
            q = q.ilike(key, `%${opVal}`)
            break
          case 'equals':
            q = q.eq(key, opVal)
            break
          case 'gt':
            q = q.gt(key, opVal)
            break
          case 'gte':
            q = q.gte(key, opVal)
            break
          case 'lt':
            q = q.lt(key, opVal)
            break
          case 'lte':
            q = q.lte(key, opVal)
            break
          case 'in':
            if (Array.isArray(opVal) && opVal.length) {
              q = q.in(key, opVal)
            }
            break
          case 'notIn':
            if (Array.isArray(opVal) && opVal.length) {
              q = q.not(key, 'in', `(${opVal.join(',')})`)
            }
            break
          case 'not':
            q = q.neq(key, opVal)
            break
          default:
            // Unknown operator — fall back to eq
            q = q.eq(key, opVal)
        }
      }
    } else {
      // Simple equality
      q = q.eq(key, value)
    }
  }

  return q
}

function buildFilterString(where: PrismaWhere): string {
  // Build a PostgREST filter string for use with .or()
  const parts: string[] = []
  for (const [key, value] of Object.entries(where)) {
    if (value === null || value === undefined) {
      parts.push(`${key}.is.null`)
    } else if (typeof value === 'string') {
      parts.push(`${key}.eq.${value}`)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      parts.push(`${key}.eq.${value}`)
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, opVal] of Object.entries(value)) {
        switch (op) {
          case 'contains':
            parts.push(`${key}.ilike.%${opVal}%`)
            break
          case 'startsWith':
            parts.push(`${key}.ilike.${opVal}%`)
            break
          case 'endsWith':
            parts.push(`${key}.ilike.%${opVal}`)
            break
          case 'gt':
            parts.push(`${key}.gt.${opVal}`)
            break
          case 'lt':
            parts.push(`${key}.lt.${opVal}`)
            break
          case 'gte':
            parts.push(`${key}.gte.${opVal}`)
            break
          case 'lte':
            parts.push(`${key}.lte.${opVal}`)
            break
          case 'in':
            if (Array.isArray(opVal) && opVal.length) {
              parts.push(`${key}.in.(${opVal.join(',')})`)
            }
            break
          default:
            parts.push(`${key}.eq.${opVal}`)
        }
      }
    }
  }
  return parts.join(',')
}

// --- Model adapter ---

function createModelAdapter(table: string) {
  return {
    async findMany(args: FindManyArgs = {}) {
      let query = getClient().from(table).select('*')

      query = applyFilters(query, args.where)

      // orderBy
      if (args.orderBy) {
        const orderArr = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy]
        for (const ord of orderArr) {
          for (const [col, dir] of Object.entries(ord)) {
            query = query.order(col, { ascending: dir === 'asc' })
          }
        }
      }

      // skip/take (pagination)
      if (args.take !== undefined) {
        const limit = args.take
        const offset = args.skip || 0
        query = query.range(offset, offset + limit - 1)
      } else if (args.skip !== undefined) {
        query = query.range(args.skip, args.skip + 999)
      }

      const { data, error } = await query
      if (error) {
        console.error(`[db] ${table}.findMany error:`, error.message)
        throw new Error(error.message)
      }
      return data || []
    },

    async findUnique(args: FindUniqueArgs) {
      let query = getClient().from(table).select('*')
      query = applyFilters(query, args.where)
      // Limit to 1 — findUnique should return at most one row
      query = query.limit(1)
      const { data, error } = await query
      if (error) {
        console.error(`[db] ${table}.findUnique error:`, error.message)
        throw new Error(error.message)
      }
      return (data && data[0]) || null
    },

    async create(args: CreateArgs) {
      // Inject defaults for NOT NULL fields that Prisma would auto-generate
      const data = { ...args.data }
      if (!data.id) {
        // Generate a CUID-like ID
        data.id = `${table.toLowerCase().slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      }
      if (!data.createdAt) {
        data.createdAt = new Date().toISOString()
      }
      // updatedAt is NOT NULL on most tables
      if (!data.updatedAt && table !== 'ContactMessage' && table !== 'Testimonial' && table !== 'FAQ' && table !== 'Payment' && table !== 'SiteSetting') {
        data.updatedAt = new Date().toISOString()
      }
      const { data: result, error } = await getClient()
        .from(table)
        .insert(data)
        .select('*')
        .single()
      if (error) {
        console.error(`[db] ${table}.create error:`, error.message)
        throw new Error(error.message)
      }
      return result
    },

    async update(args: UpdateArgs) {
      let query = getClient().from(table).update(args.data)
      query = applyFilters(query, args.where)
      const { data, error } = await query.select('*')
      if (error) {
        console.error(`[db] ${table}.update error:`, error.message)
        throw new Error(error.message)
      }
      // Prisma returns the first matched row
      return (data && data[0]) || null
    },

    async delete(args: DeleteArgs) {
      let query = getClient().from(table).delete()
      query = applyFilters(query, args.where)
      const { data, error } = await query.select('*')
      if (error) {
        console.error(`[db] ${table}.delete error:`, error.message)
        throw new Error(error.message)
      }
      return (data && data[0]) || null
    },

    async upsert(args: UpsertArgs) {
      // Try to find by where, then update or create
      const existing = await createModelAdapter(table).findUnique({ where: args.where })
      if (existing) {
        return createModelAdapter(table).update({ where: args.where, data: args.update })
      }
      // Create with merge of where + create
      const createData = { ...args.where, ...args.create }
      return createModelAdapter(table).create({ data: createData })
    },

    async count(args: CountArgs = {}) {
      let query = getClient().from(table).select('*', { count: 'exact', head: true })
      query = applyFilters(query, args.where)
      const { count, error } = await query
      if (error) {
        console.error(`[db] ${table}.count error:`, error.message)
        throw new Error(error.message)
      }
      return count || 0
    },
  }
}

// --- Export db object with all Prisma models (camelCase) ---

export const db = {
  user: createModelAdapter('User'),
  template: createModelAdapter('Template'),
  subscriptionPlan: createModelAdapter('SubscriptionPlan'),
  subscription: createModelAdapter('Subscription'),
  payment: createModelAdapter('Payment'),
  order: createModelAdapter('Order'),
  supportTicket: createModelAdapter('SupportTicket'),
  message: createModelAdapter('Message'),
  contactMessage: createModelAdapter('ContactMessage'),
  siteSetting: createModelAdapter('SiteSetting'),
  socialLink: createModelAdapter('SocialLink'),
  testimonial: createModelAdapter('Testimonial'),
  fAQ: createModelAdapter('FAQ'),
  paymentGateway: createModelAdapter('PaymentGateway'),
}

export default db
