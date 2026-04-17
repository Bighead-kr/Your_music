import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { count: trackCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true });
  const { count: tagCount } = await supabase.from('tags').select('*', { count: 'exact', head: true });
  const { count: relCount } = await supabase.from('track_tags').select('*', { count: 'exact', head: true });

  console.log(`Tracks: ${trackCount}`);
  console.log(`Tags: ${tagCount}`);
  console.log(`Relationships: ${relCount}`);

  if (relCount === 0) {
    console.log("\n⚠️ WARNING: No track-tag relationships found. Recommendations will be empty.");
    console.log("This usually means Last.fm tags didn't match the tags in your 'tags' table.");
  }
}

check();
