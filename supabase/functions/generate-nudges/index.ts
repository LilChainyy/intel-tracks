import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origin from environment or default to Lovable preview
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://lovable.dev';

function getCorsHeaders(origin: string | null) {
  // Allow localhost for development, and the configured allowed origin
  const allowedOrigins = [
    ALLOWED_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  // Also allow any lovableproject.com subdomain
  const isLovableProject = origin?.includes('.lovableproject.com') || origin?.includes('.lovable.app');
  const isAllowed = origin && (allowedOrigins.includes(origin) || isLovableProject);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Types
interface UserActivity {
  user_id: string;
  action_type: string;
  ticker: string | null;
  created_at: string;
}

interface MacroEvent {
  event_type: string;
  event_name: string;
  event_date: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate internal function secret for scheduled/cron calls
    const authHeader = req.headers.get('authorization');
    const expectedToken = Deno.env.get('FUNCTION_SECRET');
    
    if (!expectedToken) {
      console.error('FUNCTION_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.warn('Unauthorized request to generate-nudges');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users with their activity
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id');

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No users to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get upcoming macro events (next 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const { data: upcomingEvents } = await supabase
      .from('macro_events')
      .select('*')
      .gte('event_date', now.toISOString().split('T')[0])
      .lte('event_date', sevenDaysFromNow.toISOString().split('T')[0]);

    let nudgesGenerated = 0;

    for (const profile of profiles) {
      // Get user's activity from past week
      const { data: activities } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', profile.id)
        .gte('created_at', oneWeekAgo.toISOString()) as { data: UserActivity[] | null };

      if (!activities) continue;

      // Count activity types
      const externalLinkCount = activities.filter(a => a.action_type === 'external_link').length;
      const viewCount = activities.filter(a => a.action_type === 'view_stock').length;
      const savedTickers = [...new Set(
        activities
          .filter(a => a.action_type === 'save_stock')
          .map(a => a.ticker)
          .filter(Boolean)
      )];

      // Clear old nudges (older than 24 hours)
      await supabase
        .from('user_nudges')
        .delete()
        .eq('user_id', profile.id)
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Generate overtrading warning
      if (externalLinkCount > 5) {
        const existingWarning = await supabase
          .from('user_nudges')
          .select('id')
          .eq('user_id', profile.id)
          .eq('nudge_type', 'overtrading_warning')
          .eq('is_dismissed', false)
          .single();

        if (!existingWarning.data) {
          await supabase
            .from('user_nudges')
            .insert({
              user_id: profile.id,
              nudge_type: 'overtrading_warning',
              message: `You've checked ${externalLinkCount} stocks externally this week. Consider waiting for higher conviction before acting.`,
              expires_at: sevenDaysFromNow.toISOString(),
            });
          nudgesGenerated++;
        }
      }

      // Generate upcoming event nudges for saved stocks
      if (upcomingEvents && upcomingEvents.length > 0 && savedTickers.length > 0) {
        const fedMeeting = upcomingEvents.find((e: MacroEvent) => e.event_type === 'fed_meeting');
        const cpiRelease = upcomingEvents.find((e: MacroEvent) => e.event_type === 'cpi');

        if (fedMeeting) {
          const eventDate = new Date(fedMeeting.event_date);
          const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          const existingNudge = await supabase
            .from('user_nudges')
            .select('id')
            .eq('user_id', profile.id)
            .eq('nudge_type', 'upcoming_event')
            .like('message', '%Fed%')
            .eq('is_dismissed', false)
            .single();

          if (!existingNudge.data) {
            await supabase
              .from('user_nudges')
              .insert({
                user_id: profile.id,
                nudge_type: 'upcoming_event',
                message: `Fed meeting in ${daysUntil} day${daysUntil > 1 ? 's' : ''}. This could impact your saved stocks.`,
                expires_at: eventDate.toISOString(),
              });
            nudgesGenerated++;
          }
        }

        if (cpiRelease) {
          const eventDate = new Date(cpiRelease.event_date);
          const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          const existingNudge = await supabase
            .from('user_nudges')
            .select('id')
            .eq('user_id', profile.id)
            .eq('nudge_type', 'upcoming_event')
            .like('message', '%CPI%')
            .eq('is_dismissed', false)
            .single();

          if (!existingNudge.data) {
            await supabase
              .from('user_nudges')
              .insert({
                user_id: profile.id,
                nudge_type: 'upcoming_event',
                message: `CPI data release in ${daysUntil} day${daysUntil > 1 ? 's' : ''}. Watch for market volatility.`,
                expires_at: eventDate.toISOString(),
              });
            nudgesGenerated++;
          }
        }
      }

      // Inactivity reminder (no views in past 7 days)
      if (viewCount === 0) {
        const existingReminder = await supabase
          .from('user_nudges')
          .select('id')
          .eq('user_id', profile.id)
          .eq('nudge_type', 'inactivity_reminder')
          .eq('is_dismissed', false)
          .single();

        if (!existingReminder.data) {
          await supabase
            .from('user_nudges')
            .insert({
              user_id: profile.id,
              nudge_type: 'inactivity_reminder',
              message: "You haven't checked your stocks this week. See what's happening in the market.",
              expires_at: sevenDaysFromNow.toISOString(),
            });
          nudgesGenerated++;
        }
      }
    }

    console.log(`Generated ${nudgesGenerated} nudges for ${profiles.length} users`);

    return new Response(JSON.stringify({ 
      message: 'Nudges generated successfully',
      usersProcessed: profiles.length,
      nudgesGenerated 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Generate nudges error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
