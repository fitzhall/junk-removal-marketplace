import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      )
    }

    // Get provider record for this user
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider account not found' },
        { status: 404 }
      )
    }

    // Get leads distributed to this provider with quotes
    const { data: leadDistributions, error: leadsError } = await supabase
      .from('lead_distributions')
      .select(`
        *,
        quotes (*)
      `)
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    // Transform into lead format
    const leads = (leadDistributions || []).map(dist => {
      const quote = dist.quotes
      return {
        id: quote.id,
        distributionId: dist.id,
        customerName: quote.customer_name || 'Customer',
        customerEmail: quote.customer_email || 'not provided',
        customerPhone: quote.customer_phone || 'not provided',
        address: `${quote.pickup_address || ''}, ${quote.pickup_city || ''}, ${quote.pickup_state || ''} ${quote.pickup_zip || ''}`,
        description: quote.ai_analysis?.summary || 'Junk removal needed',
        preferredDate: quote.preferred_date,
        preferredTime: quote.preferred_time || 'Flexible',
        photos: Array.isArray(quote.photos) ? quote.photos : [],
        items: quote.items || [],
        estimatedValue: quote.estimated_price || quote.price_range_max || 0,
        status: dist.status === 'sent' ? 'new' :
                dist.status === 'viewed' ? 'contacted' :
                dist.status === 'accepted' ? 'won' :
                dist.status === 'declined' ? 'lost' : 'new',
        createdAt: quote.created_at,
        deliveredAt: dist.sent_at,
        urgency: quote.is_urgent ? 'high' : 'medium',
        propertyType: 'Residential'
      }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// Handle lead acceptance/rejection
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { leadId, action, bidAmount, message } = body

    // Update lead status
    const newStatus = action === 'accept' ? 'accepted' : 'declined'
    const { error: updateError } = await supabase
      .from('lead_distributions')
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
        response_message: message,
        bid_amount: bidAmount
      })
      .eq('id', leadId)
      .eq('provider_id', provider.id)

    if (updateError) {
      console.error('Error updating lead:', updateError)
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}