import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ViewCountRequest {
  productId: string;
  storeSlug: string;
  sessionId?: string;
  userAgent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { productId, storeSlug, sessionId, userAgent }: ViewCountRequest = await req.json()

    if (!productId || !storeSlug) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: productId and storeSlug' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get client IP (for analytics)
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    // Record analytics event
    const { error: analyticsError } = await supabaseClient
      .from('analytics_events')
      .insert({
        store_slug: storeSlug,
        event_type: 'product_view',
        product_id: productId,
        session_id: sessionId || `session_${Date.now()}`,
        user_agent: userAgent,
        ip_address: clientIP,
        metadata: {
          timestamp: new Date().toISOString(),
          referrer: req.headers.get('referer')
        }
      })

    if (analyticsError) {
      console.error('Analytics error:', analyticsError)
      // Don't fail the request if analytics fails
    }

    // Increment view count on product
    const { error: updateError } = await supabaseClient.rpc('increment_product_views', {
      product_id: productId
    })

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update view count' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'View count incremented' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})