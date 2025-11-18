import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get provider info
    const { data: provider } = await supabase
      .from('providers')
      .select('id, total_jobs, rating')
      .eq('auth_user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Get lead statistics
    const { data: leadStats } = await supabase
      .from('lead_distributions')
      .select('status')
      .eq('provider_id', provider.id)

    // Calculate stats
    const stats = {
      totalLeads: leadStats?.length || 0,
      activeLeads: leadStats?.filter(l => l.status === 'sent' || l.status === 'viewed').length || 0,
      wonLeads: leadStats?.filter(l => l.status === 'accepted').length || 0,
      revenue: 0, // This would come from completed jobs
      conversionRate: 0
    }

    if (stats.totalLeads > 0) {
      stats.conversionRate = Math.round((stats.wonLeads / stats.totalLeads) * 100)
    }

    // Get recent jobs for revenue calculation
    const { data: jobs } = await supabase
      .from('jobs')
      .select('final_price, status')
      .eq('provider_id', provider.id)
      .eq('status', 'completed')

    if (jobs) {
      stats.revenue = jobs.reduce((sum, job) => sum + (job.final_price || 0), 0)
    }

    return NextResponse.json({
      ...stats,
      rating: provider.rating || 0,
      completedJobs: provider.total_jobs || 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}