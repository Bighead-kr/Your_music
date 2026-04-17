import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const v = parseFloat(searchParams.get('v') || '0');
  const a = parseFloat(searchParams.get('a') || '0');

  try {
    // Call the PL/pgSQL function defined in migrations
    const { data, error } = await supabase.rpc('get_recommendations', {
      target_v: v,
      target_a: a,
      limit_count: 12
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Recommendation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
