import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const [
      { count: trackCount },
      { count: tagCount },
      { count: relationshipCount }
    ] = await Promise.all([
      supabase.from('tracks').select('*', { count: 'exact', head: true }),
      supabase.from('tags').select('*', { count: 'exact', head: true }),
      supabase.from('track_tags').select('*', { count: 'exact', head: true })
    ]);

    return NextResponse.json({
      tracks: trackCount || 0,
      tags: tagCount || 0,
      relationships: relationshipCount || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Debug stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
