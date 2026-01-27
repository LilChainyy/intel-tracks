import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Catalyst } from '@/context/AppContext';
import { fallbackCatalysts } from '@/data/catalysts';

export function useCatalysts() {
  // Initialize with only High impact catalysts
  const [catalysts, setCatalysts] = useState<Catalyst[]>(fallbackCatalysts.filter(c => c.impact === 'High'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCatalysts() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: dbError } = await supabase
          .from('catalysts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (dbError) {
          console.error('Error fetching catalysts:', dbError);
          setError(dbError.message);
          // Fallback to hardcoded data (filtered to High only)
          setCatalysts(fallbackCatalysts.filter(c => c.impact === 'High'));
          return;
        }

        if (data && data.length > 0) {
          // Transform database format to Catalyst format and filter to only "High" impact
          const transformedCatalysts: Catalyst[] = data
            .map((row) => ({
              id: row.id,
              title: row.title,
              description: row.description,
              category: row.category as Catalyst['category'],
              time: row.time,
              icon: row.icon,
              companies: row.companies || [],
              themeId: row.theme_id || '',
              impact: row.impact as Catalyst['impact'],
            }))
            .filter(catalyst => catalyst.impact === 'High'); // Only show High impact

          setCatalysts(transformedCatalysts);
        } else {
          // No data in database yet - use fallback (filtered to High only)
          console.log('No catalysts in database, using fallback data');
          setCatalysts(fallbackCatalysts.filter(c => c.impact === 'High'));
        }
      } catch (err) {
        console.error('Error fetching catalysts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch catalysts');
        // Fallback to hardcoded data on error (filtered to High only)
        setCatalysts(fallbackCatalysts.filter(c => c.impact === 'High'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchCatalysts();
  }, []);

  return { catalysts, isLoading, error };
}

// Function to trigger the Edge Function to fetch fresh catalysts
export async function refreshCatalysts(): Promise<{ success: boolean; error?: string }> {
  try {
    // Use the same Supabase client instance to ensure we're using the correct project
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey) {
      const error = 'Supabase URL or key not configured. Check your .env file.';
      console.error(error);
      return { success: false, error };
    }

    // Log for debugging
    console.log('=== Catalyst Refresh Debug ===');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Expected project ID: joafocyskbvvfltwfefu');
    console.log('Function URL:', `${supabaseUrl}/functions/v1/fetch-catalysts`);
    console.log('============================');

    const response = await fetch(`${supabaseUrl}/functions/v1/fetch-catalysts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
        console.error('Error calling fetch-catalysts:', error);
      } catch {
        const text = await response.text();
        errorMessage = text || errorMessage;
        console.error('Error response:', text);
      }
      return { success: false, error: errorMessage };
    }

    const result = await response.json();
    console.log('Catalysts refreshed successfully:', result);
    
    if (result.success === true) {
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Function returned success: false' };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error refreshing catalysts:', err);
    return { success: false, error: errorMessage };
  }
}
