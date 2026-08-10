import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    // Test database connection via Prisma
    let dbStatus = 'unknown'
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient({
        datasourceUrl: supabaseDbUrl,
      })
      await prisma.$queryRaw`SELECT 1`
      await prisma.$disconnect()
      dbStatus = 'connected'
    } catch (dbError) {
      dbStatus = `error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
    }

    const isConnected = dbStatus === 'connected'

    return NextResponse.json({
      success: isConnected,
      message: isConnected
        ? '✅ تم الاتصال بـ Supabase بنجاح! قاعدة البيانات تعمل بشكل صحيح.'
        : `⚠️ تم الاتصال بـ Supabase Auth لكن قاعدة البيانات لم تستجب: ${dbStatus}`,
      details: {
        auth: authError ? `error: ${authError.message}` : 'connected (no active session - normal)',
        database: dbStatus,
        url: supabaseUrl,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `❌ فشل الاتصال بـ Supabase: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
    }, { status: 500 })
  }
}
