'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodCanvasProps {
  onCoordsChange: (v: number, a: number) => void;
}

export default function MoodCanvas({ onCoordsChange }: MoodCanvasProps) {
  const [coords, setCoords] = useState({ v: 0, a: 0 });
  const [hoverCoords, setHoverCoords] = useState({ v: 0, a: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCoordsFromEvent = (e: React.PointerEvent | React.MouseEvent) => {
    if (!containerRef.current) return { v: 0, a: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const v = Math.max(-1, Math.min(1, parseFloat(((x / rect.width) * 2 - 1).toFixed(2))));
    const a = Math.max(-1, Math.min(1, parseFloat(((1 - y / rect.height) * 2 - 1).toFixed(2))));
    return { v, a };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const newCoords = getCoordsFromEvent(e);
    setCoords(newCoords);
    onCoordsChange(newCoords.v, newCoords.a);

    // Add ripple
    const id = Date.now();
    setRipples(prev => [...prev, { id, x: (newCoords.v + 1) * 50, y: (1 - newCoords.a) * 50 }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const newCoords = getCoordsFromEvent(e);
    setHoverCoords(newCoords);
    setIsHovering(true);
    
    if (e.buttons > 0) { // Dragging
      setCoords(newCoords);
    }
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    setHoverCoords(getCoordsFromEvent(e));
    setIsHovering(true);
  };

  const handlePointerLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
          당신의 마음은 어디에 있나요?
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          그래프를 클릭하여 현재의 감정을 고정하세요.
        </p>
      </div>

      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="relative w-full aspect-square glass glow cursor-crosshair overflow-hidden touch-none"
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-full h-px bg-white/50" />
          <div className="h-full w-px bg-white/50" />
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-violet-400 font-bold pointer-events-none">활동적 (High Arousal)</div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-blue-400 font-bold pointer-events-none">차분함 (Low Arousal)</div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-widest text-red-400 font-bold pointer-events-none">불쾌 (Low Valence)</div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[10px] uppercase tracking-widest text-green-400 font-bold pointer-events-none">즐거움 (High Valence)</div>

        {/* Ripples */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.5)] z-0"
              style={{ left: ripple.x + '%', top: ripple.y + '%' }}
            />
          ))}
        </AnimatePresence>

        {/* Selected Pointer */}
        <motion.div 
          animate={{ left: (coords.v + 1) * 50 + '%', top: (1 - coords.a) * 50 + '%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 400 }}
          className="absolute -ml-3 -mt-3 w-6 h-6 z-20 pointer-events-none"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-violet-600 animate-pulse opacity-50 blur-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)] border border-violet-400 z-10" />
            <div className="absolute w-8 h-8 rounded-full border border-violet-500/30 animate-spin-slow" />
          </div>
        </motion.div>

        {/* Guide Pointer (Hover) */}
        {isHovering && (
          <motion.div 
            animate={{ left: (hoverCoords.v + 1) * 50 + '%', top: (1 - hoverCoords.a) * 50 + '%' }}
            transition={{ duration: 0 }}
            className="absolute -ml-2 -mt-2 w-4 h-4 z-10 pointer-events-none opacity-60"
          >
            <div className="w-full h-full rounded-full border border-dashed border-white/50 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white/80" />
            </div>
          </motion.div>
        )}

        {/* Dynamic Background Glow */}
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${ (coords.v + 1) * 50 }% ${ (1 - coords.a) * 50 }%, var(--accent-primary, #8B5CF6), transparent 100%)`
          }}
        />
      </div>

      <div className="flex gap-8 text-sm font-mono text-gray-400 glass px-6 py-2 rounded-full">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Valence: <span className={coords.v > 0 ? "text-green-400" : "text-red-400"}>{coords.v}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          Arousal: <span className={coords.a > 0 ? "text-orange-400" : "text-blue-400"}>{coords.a}</span>
        </div>
      </div>
    </div>
  );
}
