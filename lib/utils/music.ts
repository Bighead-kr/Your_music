/**
 * Normalizes Last.fm tag counts into a 0.0 to 1.0 weight scale.
 * Using Relative Weight: count / max_count_in_set
 */
export function normalizeWeights(tags: { name: string; count: number }[]) {
  if (tags.length === 0) return [];

  const maxCount = Math.max(...tags.map(t => t.count));
  
  return tags.map(tag => ({
    ...tag,
    weight: maxCount > 0 ? parseFloat((tag.count / maxCount).toFixed(4)) : 0,
  }));
}

/**
 * Filters out non-descriptive Last.fm tags (noise).
 * You can expand this blacklist as needed.
 */
export function filterNoiseTags(tags: string[]) {
  const blacklist = [
    'seen live', 'favorites', 'rock', 'alternative', 
    'my music', 'favorite', 'favorite songs', 'epic',
    'owned', 'love it', 'amazing', 'best'
  ];
  return tags.filter(tag => !blacklist.includes(tag.toLowerCase()));
}
