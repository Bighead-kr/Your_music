'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MoodCanvasProps {
  onCoordsChange: (v: number, a: number) => void;
}

export default function MoodCanvas({ onCoordsChange }: MoodCanvasProps) {
  const [coords, setCoords] = useState({ v: 0, a: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCoords = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize to -1.0 to 1.0, clamped
    const v = Math.max(-1, Math.min(1, parseFloat(((x / rect.width) * 2 - 1).toFixed(2))));
    const a = Math.max(-1, Math.min(1, parseFloat(((1 - y / rect.height) * 2 - 1).toFixed(2))));
    
    setCoords({ v, a });
    return { v, a };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const newCoords = updateCoords(e);
    if (newCoords) onCoordsChange(newCoords.v, newCoords.a);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) { // Dragging
      updateCoords(e);
    }
  };

  const handlePointerUp = () => {
    onCoordsChange(coords.v, coords.a);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
          당신의 마음은 어디에 있나요?
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          공간을 터치하여 현재의 감정 상태(valence, arousal)를 수치화하세요.
        </p>
      </div>

      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full aspect-square glass glow cursor-crosshair overflow-hidden touch-none"
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-full h-px bg-white" />
          <div className="h-full w-px bg-white" />
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-violet-400 font-bold">활동적 (High Arousal)</div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-blue-400 font-bold">차분함 (Low Arousal)</div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-widest text-red-400 font-bold">불쾌 (Low Valence)</div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[10px] uppercase tracking-widest text-green-400 font-bold">즐거움 (High Valence)</div>

        {/* Interactive Pointer */}
        <motion.div 
          animate={{ x: (coords.v + 1) * 50 + '%', y: (1 - coords.a) * 50 + '%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="absolute -ml-3 -mt-3 w-6 h-6 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] border-2 border-violet-500 z-10"
        />

        {/* Dynamic Background Glow */}
        <div 
          className="absolute inset-0 opacity-30 transition-colors"
          style={{
            background: `radial-gradient(circle at ${ (coords.v + 1) * 50 }% ${ (1 - coords.a) * 50 }%, var(--accent-primary), transparent 70%)`
          }}
        />
      </div>

      <div className="flex gap-8 text-sm font-mono text-gray-300">
        <div>감정 지수 (Valence): <span className={coords.v > 0 ? "text-green-400" : "text-red-400"}>{coords.v}</span></div>
        <div>에너지 레벨 (Arousal): <span className={coords.a > 0 ? "text-orange-400" : "text-blue-400"}>{coords.a}</span></div>
      </div>
    </div>
  );
}
