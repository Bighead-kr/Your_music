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
      }, { onConflict: 'lastfm_id' }) 
      .select()
      .single();

    if (trackError) throw trackError;

    // 3. Map tags to VA coordinates and save relations
    for (const tag of filteredTags) {
      // Find tag in our Mood Database (tags table)
      const { data: tagMaster } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tag.name)
        .single();

      if (tagMaster) {
        // Save track-tag relationship
        await supabase
          .from('track_tags')
          .upsert({
            track_id: trackData.id,
            tag_id: tagMaster.id,
            weight: tag.weight,
          });
      }
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
