import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTrackTags } from '@/lib/lastfm';
import { normalizeWeights, filterNoiseTags } from '@/lib/utils/music';

export async function POST(request: Request) {
  try {
    const { artist, track, youtube_id, cover_url } = await request.json();

    if (!artist || !track) {
      return NextResponse.json({ error: 'Artist and track name are required.' }, { status: 400 });
    }

    // 1. Fetch tags from Last.fm
    const rawTags = await getTrackTags(artist, track);
    const filteredTags = normalizeWeights(rawTags).filter(t => filterNoiseTags([t.name]).length > 0);

    // 2. Insert or Update Track
    const { data: trackData, error: trackError } = await supabase
      .from('tracks')
      .upsert({
        title: track,
        artist: artist,
        // youtube_id: youtube_id,
        cover_url: cover_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'artist, title' }) 
      .select()
      .single();

    if (trackError) throw trackError;

    // 3. Map tags to VA coordinates and save relations (Optimized Bulk Operation)
    const tagNames = filteredTags.map(t => t.name);
    
    // Fetch all matching tags at once
    const { data: tagMasters } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', tagNames);

    if (tagMasters && tagMasters.length > 0) {
      const trackTagsToInsert = tagMasters.map(tm => {
        const tagInfo = filteredTags.find(ft => ft.name === tm.name);
        return {
          track_id: trackData.id,
          tag_id: tm.id,
          weight: tagInfo?.weight || 0,
        };
      });

      // Bulk upsert relationships
      const { error: batchError } = await supabase
        .from('track_tags')
        .upsert(trackTagsToInsert);
        
      if (batchError) console.error('Batch tag link error:', batchError);
    }

    return NextResponse.json({ 
      success: true, 
      track: trackData,
      tags_processed: filteredTags.length 
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
