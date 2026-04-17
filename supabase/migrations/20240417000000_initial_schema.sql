-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tags Table: Stores mood/genre tags with Valence-Arousal coordinates
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'mood', -- 'mood', 'genre', 'style'
    valence FLOAT NOT NULL DEFAULT 0.0, -- Range: -1.0 to 1.0 (Unpleasant to Pleasant)
    arousal FLOAT NOT NULL DEFAULT 0.0, -- Range: -1.0 to 1.0 (Deactivation to Activation)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valence_range CHECK (valence >= -1.0 AND valence <= 1.0),
    CONSTRAINT arousal_range CHECK (arousal >= -1.0 AND arousal <= 1.0)
);

-- 2. Tracks Table: Cached metadata from Last.fm & YouTube
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lastfm_id TEXT UNIQUE, -- MBID or fallback
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    cover_url TEXT,
    youtube_id TEXT,
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Track-Tags (Interaction Table): Weighted association
CREATE TABLE IF NOT EXISTS public.track_tags (
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    weight FLOAT NOT NULL DEFAULT 0.0, -- Normalized weight (0.0 to 1.0)
    PRIMARY KEY (track_id, tag_id)
);

-- 4. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    preferred_genres TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mood Entries: Time-series data of user's emotional state
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    valence FLOAT NOT NULL,
    arousal FLOAT NOT NULL,
    trigger_event TEXT, -- e.g., 'Work', 'Workout', 'Late Night'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT entry_valence_range CHECK (valence >= -1.0 AND valence <= 1.0),
    CONSTRAINT entry_arousal_range CHECK (arousal >= -1.0 AND arousal <= 1.0)
);

-- 6. Indices for Performance
CREATE INDEX idx_tags_coords ON public.tags (valence, arousal);
CREATE INDEX idx_track_tags_weight ON public.track_tags (weight DESC);

-- 7. Advanced SQL: Recommendation Logic Function
-- This function calculates the weighted average VA of a track based on its tags
-- then finds tracks closest to the target input coordinates.
CREATE OR REPLACE FUNCTION get_recommendations(
    target_v FLOAT, 
    target_a FLOAT, 
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    track_id UUID,
    title TEXT,
    artist TEXT,
    cover_url TEXT,
    youtube_id TEXT,
    distance FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH track_va AS (
        -- Calculate weighted average coordinates for each track
        SELECT 
            tt.track_id,
            SUM(t.valence * tt.weight) / SUM(tt.weight) as avg_v,
            SUM(t.arousal * tt.weight) / SUM(tt.weight) as avg_a
        FROM track_tags tt
        JOIN tags t ON tt.tag_id = t.id
        GROUP BY tt.track_id
    )
    SELECT 
        tr.id,
        tr.title,
        tr.artist,
        tr.cover_url,
        tr.youtube_id,
        -- Euclidean Distance: sqrt((v1-v2)^2 + (a1-a2)^2)
        SQRT(POWER(tva.avg_v - target_v, 2) + POWER(tva.avg_a - target_a, 2)) as dist
    FROM track_va tva
    JOIN tracks tr ON tva.track_id = tr.id
    ORDER BY dist ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
