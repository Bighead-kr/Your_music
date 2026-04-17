-- Seed data for Mood Tags with Valence-Arousal coordinates
-- Based on Russell's Circumplex Model of Affect

INSERT INTO public.tags (name, category, valence, arousal) VALUES
-- High Valence, High Arousal (Happy/Excited)
('excited', 'mood', 0.8, 0.8),
('uplifting', 'mood', 0.9, 0.6),
('happy', 'mood', 1.0, 0.4),
('cheerful', 'mood', 0.8, 0.5),
('euphoric', 'mood', 0.9, 0.9),
('party', 'mood', 0.7, 0.9),
('energetic', 'mood', 0.6, 1.0),
('optimistic', 'mood', 0.8, 0.3),

-- Low Valence, High Arousal (Angry/Tense)
('aggressive', 'mood', -0.8, 0.9),
('angry', 'mood', -0.9, 0.8),
('intense', 'mood', -0.4, 0.9),
('dark', 'mood', -0.7, 0.5),
('anxious', 'mood', -0.6, 0.7),
('scary', 'mood', -0.8, 0.6),
('disturbing', 'mood', -0.9, 0.5),
('chaotic', 'mood', -0.5, 0.9),

-- Low Valence, Low Arousal (Sad/Depressed)
('sad', 'mood', -0.9, -0.6),
('melancholy', 'mood', -0.7, -0.4),
('gloomy', 'mood', -0.8, -0.5),
('depressing', 'mood', -1.0, -0.7),
('lonely', 'mood', -0.7, -0.6),
('somber', 'mood', -0.6, -0.3),
('tearful', 'mood', -0.9, -0.3),
('heartbreak', 'mood', -0.8, -0.2),

-- High Valence, Low Arousal (Calm/Relaxed)
('relaxing', 'mood', 0.8, -0.7),
('calm', 'mood', 0.9, -0.8),
('peaceful', 'mood', 1.0, -0.9),
('chill', 'mood', 0.7, -0.6),
('dreamy', 'mood', 0.6, -0.5),
('serene', 'mood', 0.9, -0.7),
('ambient', 'mood', 0.5, -0.8),
('meditative', 'mood', 0.8, -0.9),

-- Focus & Study (Neutral Valence, Low Arousal)
('focus', 'mood', 0.2, -0.3),
('study', 'mood', 0.1, -0.4),
('mellow', 'mood', 0.4, -0.5),
('atmospheric', 'mood', 0.3, -0.2),

-- Genre-based initial tags (mapped to mood clusters)
('rock', 'genre', 0.2, 0.6),
('metal', 'genre', -0.3, 0.9),
('pop', 'genre', 0.6, 0.5),
('jazz', 'genre', 0.5, -0.3),
('classical', 'genre', 0.5, -0.4),
('electronic', 'genre', 0.4, 0.7),
('lofi', 'genre', 0.3, -0.6),
('blues', 'genre', -0.2, -0.3)
ON CONFLICT (name) DO NOTHING;
