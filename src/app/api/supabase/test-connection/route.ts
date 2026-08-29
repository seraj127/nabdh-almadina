import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseDbUrl = process.env.SUPABASE_DATABASE_URL

    if (!supabaseUrl || !supabaseKey || !supabaseDbUrl) {
      return NextResponse.json({
        success: false,
        message: 'Supabase غير مُعد بالكامل. تأكد من تعيين جميع المتغيرات البيئية المطلوبة في ملف .env',
        missing: [
          !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
          !supabaseKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          !supabaseDbUrl && 'SUPABASE_DATABASE_URL',
        ].filter(Boolean),
      }, { status: 400 })
    }

    // Test Supabase Auth connection
    const supabase = await createClient()
    const { error: authError } = await supabase.auth.getSession()

    // Test database connection via Prisma — report a boolean only,
    // raw driver errors can leak hostnames/credentials internals.
    let dbConnected = false
    try {
      await db.$queryRaw`SELECT 1`
      dbConnected = true
    } catch (dbError) {
      console.error('[SUPABASE_TEST_CONNECTION] DB error:', dbError)
    }

    if (!dbConnected) {
      return NextResponse.json({
        success: false,
        message: '⚠️ تم الاتصال بـ Supabase Auth لكن قاعدة البيانات لم تستجب. راجع سجلات الخادم للتفاصيل.',
        details: {
          auth: authError ? 'error' : 'connected (no active session - normal)',
          database: 'error',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: '✅ تم الاتصال بـ Supabase بنجاح! قاعدة البيانات تعمل بشكل صحيح.',
      details: {
        auth: authError ? 'error' : 'connected (no active session - normal)',
        database: 'connected',
      },
    })
  } catch (error) {
    console.error('[SUPABASE_TEST_CONNECTION]', error)
    return NextResponse.json({
      success: false,
      message: '❌ فشل الاتصال بـ Supabase. راجع سجلات الخادم للتفاصيل.',
    }, { status: 500 })
  }
}
