import { NextResponse } from 'next/server'
import { getDatabaseStatus } from '@/lib/db'

export async function GET() {
  const status = getDatabaseStatus()

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseDbUrl = process.env.SUPABASE_DATABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const checks = {
    supabase: {
      configured: !!(supabaseUrl && supabaseKey && supabaseDbUrl),
      url: supabaseUrl ? '✅ Set' : '❌ Missing',
      anonKey: supabaseKey ? '✅ Set' : '❌ Missing',
      databaseUrl: supabaseDbUrl ? '✅ Set' : '❌ Missing',
      serviceRoleKey: supabaseServiceKey ? '✅ Set' : '⚠️ Missing (optional)',
    },
    database: {
      provider: status.provider,
      supabaseEnabled: status.supabaseEnabled,
      connectionUrl: status.url,
    },
    steps: getSetupSteps(),
  }

  return NextResponse.json(checks)
}

function getSetupSteps() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseDbUrl = process.env.SUPABASE_DATABASE_URL

  if (supabaseUrl && supabaseKey && supabaseDbUrl) {
    return [
      '✅ Supabase environment variables configured',
      '✅ Database connection will use Supabase PostgreSQL',
      'ℹ️ Run SQL migration: supabase/migrations/001_initial_schema.sql',
      'ℹ️ Seed data: supabase/seed.sql',
    ]
  }

  return [
    '1️⃣ Create a Supabase project at https://supabase.com',
    '2️⃣ Get your project URL and keys from Project Settings > API',
    '3️⃣ Add these to .env:\n' +
      '   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n' +
      '   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...\n' +
      '   SUPABASE_DATABASE_URL=postgresql://postgres:...\n' +
      '   SUPABASE_SERVICE_ROLE_KEY=eyJ...',
    '4️⃣ Run SQL migration in Supabase SQL Editor:\n' +
      '   supabase/migrations/001_initial_schema.sql',
    '5️⃣ Seed data in Supabase SQL Editor:\n' +
      '   supabase/seed.sql',
    '6️⃣ Restart the development server',
  ]
}
