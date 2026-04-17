-- Add unique constraint to tracks table for (artist, title) 
-- to support efficient upserting without lastfm_id.
ALTER TABLE public.tracks ADD CONSTRAINT unique_artist_track UNIQUE (artist, title);
