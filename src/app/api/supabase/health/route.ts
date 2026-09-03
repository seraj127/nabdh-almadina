import { NextResponse } from 'next/server'
import { getDatabaseStatus } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const status = getDatabaseStatus()

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseDbUrl = process.env.SUPABASE_DATABASE_URL
  const checks = {
    supabase: {
      configured: !!(supabaseUrl && supabaseKey && supabaseDbUrl),
    },
    database: {
      provider: status.provider,
      supabaseEnabled: status.supabaseEnabled,
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
      'âœ… Supabase environment variables configured',
      'âœ… Database connection will use Supabase PostgreSQL',
      'â„¹ï¸ڈ Run SQL migration: supabase/migrations/001_initial_schema.sql',
      'â„¹ï¸ڈ Seed data: supabase/seed.sql',
    ]
  }

  return [
    '1ï¸ڈâƒ£ Create a Supabase project at https://supabase.com',
    '2ï¸ڈâƒ£ Get your project URL and keys from Project Settings > API',
    '3ï¸ڈâƒ£ Add these to .env:\n' +
      '   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n' +
      '   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...\n' +
      '   SUPABASE_DATABASE_URL=postgresql://postgres:...\n' +
      '   SUPABASE_SERVICE_ROLE_KEY=eyJ...',
    '4ï¸ڈâƒ£ Run SQL migration in Supabase SQL Editor:\n' +
      '   supabase/migrations/001_initial_schema.sql',
    '5ï¸ڈâƒ£ Seed data in Supabase SQL Editor:\n' +
      '   supabase/seed.sql',
    '6ï¸ڈâƒ£ Restart the development server',
  ]
}
