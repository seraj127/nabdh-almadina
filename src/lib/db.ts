import { PrismaClient } from '@prisma/client'

// ─── Database Configuration ─────────────────────────────────
// Supports both SQLite (local) and PostgreSQL/Supabase (production)
// When SUPABASE_DATABASE_URL is set, uses Supabase PostgreSQL
// Otherwise falls back to SQLite via DATABASE_URL

const isSupabaseEnabled = !!(
  process.env.SUPABASE_DATABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const datasourceUrl = isSupabaseEnabled
    ? process.env.SUPABASE_DATABASE_URL
    : process.env.DATABASE_URL

  return new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// ─── Database Status Check ──────────────────────────────────
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
  if (url.startsWith('file:')) return url
  // Mask password in PostgreSQL URLs
  return url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
}
