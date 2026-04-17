'use client';

import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';

interface Track {
  track_id: string;
  title: string;
  artist: string;
  cover_url: string;
  youtube_id?: string;
  distance: number;
}

export default function TrackCard({ track, index }: { track: Track; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass group relative overflow-hidden p-3"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={track.cover_url || '/api/placeholder/150/150'} 
          alt={track.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center text-white glow">
            <Play fill="currentColor" size={20} />
          </button>
        </div>
      </div>

      <div className="px-1">
        <h3 className="font-semibold text-sm truncate">{track.title}</h3>
        <p className="text-xs text-gray-500 truncate mb-2">{track.artist}</p>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-[10px] text-violet-400 font-mono">
            Match: {Math.max(0, Math.min(100, Math.round((1 - track.distance) * 100)))}%
          </span>
          {/* {track.youtube_id && (
            <a 
              href={`https://youtube.com/watch?v=${track.youtube_id}`} 
              target="_blank" 
              className="text-gray-500 hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )} */}
        </div>
      </div>
    </motion.div>
  );
}
