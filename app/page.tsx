'use client';

import { useState, useEffect } from 'react';
import MoodCanvas from '@/components/MoodCanvas';
import TrackCard from '@/components/TrackCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, BarChart3, Info } from 'lucide-react';

export default function Home() {
  const [coords, setCoords] = useState({ v: 0, a: 0 });
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'curation' | 'library'>('curation');
  const [stats, setStats] = useState({ tracks: 0, relationships: 0 });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/debug/stats');
      const data = await res.json();
      if (!data.error) setStats({ tracks: data.tracks, relationships: data.relationships });
    } catch (e) { console.error(e); }
  };

  const fetchRecommendations = async (v: number, a: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recommend?v=${v}&a=${a}`);
      const data = await res.json();
      setTracks(data);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTracks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tracks');
      const data = await res.json();
      setTracks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
    if (viewMode === 'curation') {
      fetchRecommendations(coords.v, coords.a);
    } else {
      fetchAllTracks();
    }
  }, [viewMode]);

  const handleCoordsChange = (v: number, a: number) => {
    setCoords({ v, a });
    fetchRecommendations(v, a);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center glow">
            <Music className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black font-outfit tracking-tight">MoodSync.</h1>
        </div>
        <nav className="flex gap-6 text-sm font-medium text-gray-400 items-center">
          <div className="flex gap-2 mr-4">
            <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded text-violet-400">Lib: {stats.tracks}</span>
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">Rel: {stats.relationships}</span>
          </div>
          <a href="#" className="hover:text-white flex items-center gap-2"><BarChart3 size={16} /> Dashboard</a>
          <a href="#" className="hover:text-white flex items-center gap-2"><Info size={16} /> Methodology</a>
        </nav>
      </header>

      {/* Hero Section & Mood Canvas */}
      <section className="mb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold leading-tight">
              데이터로 읽는 <br />
              현재 당신의 <span className="text-violet-500">진동.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md">
              단순한 장르 추천이 아닙니다. Last.fm의 태그 데이터와 VA 모델을 결합하여, 
              지금 당신의 심리 좌표에 가장 가까운 주파수를 찾습니다.
            </p>
            <div className="pt-4 flex gap-4">
              <div className="glass px-4 py-2 text-xs font-mono">
                <span className="text-gray-500 mr-2">Method:</span> 
                Euclidean Similarity
              </div>
              <div className="glass px-4 py-2 text-xs font-mono">
                <span className="text-gray-500 mr-2">Engine:</span> 
                Postgres RPC
              </div>
            </div>
          </div>
          
          <MoodCanvas onCoordsChange={handleCoordsChange} />
        </div>
      </section>

      {/* Results Section */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex p-1 bg-white/5 rounded-lg w-fit">
              <button 
                onClick={() => setViewMode('curation')}
                className={`px-4 py-1.5 rounded-md text-xs transition-all ${viewMode === 'curation' ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                🎯 맞춤 추천
              </button>
              <button 
                onClick={() => setViewMode('library')}
                className={`px-4 py-1.5 rounded-md text-xs transition-all ${viewMode === 'library' ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                📚 전체 목록
              </button>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{viewMode === 'curation' ? '맞춤형 큐레이션' : '전체 라이브러리'}</h3>
              <p className="text-gray-500 text-sm">
                {viewMode === 'curation' ? '현재 심리 상태에 기반한 추천 결과입니다.' : '데이터베이스에 등록된 모든 곡입니다.'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            Tracks found: {tracks.length}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass aspect-[3/4] animate-pulse rounded-xl" />
              ))}
            </motion.div>
          ) : tracks.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
            >
              {tracks.map((track, i) => (
                <TrackCard key={track.track_id} track={track} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass rounded-3xl"
            >
              <p className="text-gray-500 mb-4">현재 좌표에 매칭되는 음악 데이터가 DB에 없습니다.</p>
              <p className="text-sm text-violet-400">명령어 예시를 참고하여 음악 데이터를 먼저 동기화(Sync)해 주세요!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer Meta */}
      <footer className="mt-32 pt-12 border-t border-white/5 text-center text-gray-600 text-xs">
        <p>© 2024 MoodSync Project. Built for Senior Portfolio.</p>
        <p className="mt-2 italic">Data sourced from Last.fm API and Russell's Circumplex Model.</p>
      </footer>
    </div>
  );
}
