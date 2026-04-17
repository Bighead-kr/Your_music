import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to include 'track_id' property if needed by the frontend
    const transformedTracks = tracks.map(t => ({
      ...t,
      track_id: t.id,
      distance: 0 // No distance for library view
    }));

    return NextResponse.json(transformedTracks);
  } catch (error: any) {
    console.error('Fetch tracks error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
