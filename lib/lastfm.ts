const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

export interface LastfmTag {
  name: string;
  count: number;
}

export interface LastfmTrack {
  name: string;
  artist: string;
  image?: string;
  tags?: LastfmTag[];
}

/**
 * Fetch top tags for a specific track to determine its mood/genre profile.
 */
export async function getTrackTags(artist: string, track: string): Promise<LastfmTag[]> {
  const params = new URLSearchParams({
    method: 'track.getTopTags',
    artist,
    track,
    api_key: LASTFM_API_KEY || '',
    format: 'json',
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    const data = await response.json();
    
    if (data.toptags && data.toptags.tag) {
      return data.toptags.tag.map((t: any) => ({
        name: t.name.toLowerCase(),
        count: parseInt(t.count) || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching Last.fm tags:', error);
    return [];
  }
}

/**
 * Search for tracks based on a query (Artist or Title).
 */
export async function searchTracks(query: string): Promise<LastfmTrack[]> {
  const params = new URLSearchParams({
    method: 'track.search',
    track: query,
    api_key: LASTFM_API_KEY || '',
    format: 'json',
    limit: '10',
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    const data = await response.json();
    
    if (data.results && data.results.trackmatches && data.results.trackmatches.track) {
      return data.results.trackmatches.track.map((t: any) => ({
        name: t.name,
        artist: t.artist,
        image: t.image?.[2]?.['#text'], // Extralarge image
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching Last.fm tracks:', error);
    return [];
  }
}
