import { PrismaClient as SqlitePrismaClient } from '@/generated/sqlite'
import { PrismaClient as PostgresPrismaClient } from '@/generated/postgresql'

// The two generated clients are intentionally separate. Prisma engines are
// provider-specific; a PostgreSQL URL must never be passed to a SQLite client.
const isSupabaseEnabled = Boolean(process.env.SUPABASE_DATABASE_URL)

type DatabaseClient = SqlitePrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: DatabaseClient | undefined
}

function createPrismaClient(): DatabaseClient {
  if (isSupabaseEnabled) {
    const url = process.env.SUPABASE_DATABASE_URL
    if (!url || !/^postgres(ql)?:\/\//.test(url)) {
      throw new Error('SUPABASE_DATABASE_URL must be a PostgreSQL connection URL')
    }
    return new PostgresPrismaClient({
      datasourceUrl: url,
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    }) as unknown as DatabaseClient
  }

  const url = process.env.DATABASE_URL
  if (url && !url.startsWith('file:')) {
    throw new Error('DATABASE_URL must be a file: URL when using the SQLite client')
  }
  return new SqlitePrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export function getDatabaseStatus() {
  return {
    provider: isSupabaseEnabled ? 'supabase' : 'sqlite',
    supabaseEnabled: isSupabaseEnabled,
    url: isSupabaseEnabled
      ? maskUrl(process.env.SUPABASE_DATABASE_URL || '')
      : maskUrl(process.env.DATABASE_URL || ''),
  }
}

function maskUrl(url: string): string {
  if (!url) return '(not set)'
  if (url.startsWith('file:')) return 'file:<configured>'
  return url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
}
