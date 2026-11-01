import React, { useState, useRef, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundEffects';
import { hapticsService } from '../services/haptics';
import { Sliders, Lock, Unlock, Compass, MoveVertical, MousePointer } from 'lucide-react';

export const TouchpadView: React.FC = () => {
  const touchpadRef = useRef<HTMLDivElement>(null);
  const [sensitivity, setSensitivity] = useState<number>(1.4);
  const [dragLocked, setDragLocked] = useState<boolean>(false);
  const [airMouseActive, setAirMouseActive] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeTouches, setActiveTouches] = useState<number>(0);

  // Visual particle trail
  const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number; time: number }>>([]);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const twoFingerLastRef = useRef<{ y: number } | null>(null);
  const tapStartRef = useRef<{ time: number; x: number; y: number } | null>(null);

  // Send mouse move
  const sendMove = useCallback((dx: number, dy: number) => {
    socketService.send('MOUSE_MOVE', {
      dx: dx * sensitivity,
      dy: dy * sensitivity,
    });
  }, [sensitivity]);

  // Touchpad touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touches = e.touches;
    setActiveTouches(touches.length);

    if (touches.length === 1) {
      const t = touches[0];
      const rect = touchpadRef.current?.getBoundingClientRect();
      const relX = rect ? t.clientX - rect.left : t.clientX;
      const relY = rect ? t.clientY - rect.top : t.clientY;

      lastTouchRef.current = { x: t.clientX, y: t.clientY };
      tapStartRef.current = { time: Date.now(), x: t.clientX, y: t.clientY };

      setTrail((prev) => [...prev.slice(-12), { id: Date.now(), x: relX, y: relY, time: Date.now() }]);
    } else if (touches.length === 2) {
      const avgY = (touches[0].clientY + touches[1].clientY) / 2;
      twoFingerLastRef.current = { y: avgY };
      tapStartRef.current = { time: Date.now(), x: touches[0].clientX, y: touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touches = e.touches;
    const rect = touchpadRef.current?.getBoundingClientRect();

    if (touches.length === 1 && lastTouchRef.current) {
      const t = touches[0];
      const dx = t.clientX - lastTouchRef.current.x;
      const dy = t.clientY - lastTouchRef.current.y;
      lastTouchRef.current = { x: t.clientX, y: t.clientY };

      sendMove(dx, dy);

      if (rect) {
        const relX = t.clientX - rect.left;
        const relY = t.clientY - rect.top;
        setTrail((prev) => [...prev.slice(-12), { id: Date.now() + Math.random(), x: relX, y: relY, time: Date.now() }]);
      }
    } else if (touches.length === 2 && twoFingerLastRef.current) {
      const avgY = (touches[0].clientY + touches[1].clientY) / 2;
      const dy = avgY - twoFingerLastRef.current.y;
      twoFingerLastRef.current = { y: avgY };

      // Two-finger scroll
      socketService.send('MOUSE_SCROLL', { dx: 0, dy: dy * 1.5 });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touches = e.touches;
    setActiveTouches(touches.length);

    if (tapStartRef.current) {
      const duration = Date.now() - tapStartRef.current.time;
      const moveDist = lastTouchRef.current
        ? Math.hypot(lastTouchRef.current.x - tapStartRef.current.x, lastTouchRef.current.y - tapStartRef.current.y)
        : 0;

      // Detect tap gesture if short duration and minimal movement
      if (duration < 240 && moveDist < 12) {
        if (touches.length === 0 && e.changedTouches.length === 1) {
          // Single tap -> Left Click
          handleLeftClick();
        } else if (e.changedTouches.length === 2 || activeTouches === 2) {
          // Two-finger tap -> Right Click
          handleRightClick();
        }
      }
    }

    if (touches.length === 0) {
      lastTouchRef.current = null;
      twoFingerLastRef.current = null;
      tapStartRef.current = null;
    }
  };

  // Mouse emulation handlers (for testing on desktop browsers)
  const isMouseDownRef = useRef<boolean>(false);
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isMouseDownRef.current = true;
    lastTouchRef.current = { x: e.clientX, y: e.clientY };
    tapStartRef.current = { time: Date.now(), x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !lastTouchRef.current) return;
    const dx = e.clientX - lastTouchRef.current.x;
    const dy = e.clientY - lastTouchRef.current.y;
    lastTouchRef.current = { x: e.clientX, y: e.clientY };
    sendMove(dx, dy);

    const rect = touchpadRef.current?.getBoundingClientRect();
    if (rect) {
      setTrail((prev) => [
        ...prev.slice(-12),
        { id: Date.now() + Math.random(), x: e.clientX - rect.left, y: e.clientY - rect.top, time: Date.now() },
      ]);
    }
  };

  const handleMouseUp = () => {
    if (isMouseDownRef.current && tapStartRef.current) {
      const duration = Date.now() - tapStartRef.current.time;
      if (duration < 200) {
        handleLeftClick();
      }
    }
    isMouseDownRef.current = false;
    lastTouchRef.current = null;
  };

  // Action buttons
  const handleLeftClick = () => {
    soundService.playKeyClick('mouse');
    hapticsService.light();
    socketService.send('MOUSE_CLICK', { button: 'left' });
  };

  const handleRightClick = () => {
    soundService.playKeyClick('mouse');
    hapticsService.medium();
    socketService.send('MOUSE_CLICK', { button: 'right' });
  };

  const handleMiddleClick = () => {
    soundService.playKeyClick('mouse');
    hapticsService.medium();
    socketService.send('MOUSE_CLICK', { button: 'middle' });
  };

  const handleDoubleClick = () => {
    soundService.playKeyClick('mouse');
    hapticsService.doubleTap();
    socketService.send('MOUSE_CLICK', { button: 'left', double: true });
  };

  const toggleDragLock = () => {
    const newState = !dragLocked;
    setDragLocked(newState);
    soundService.playKeyClick('modifier');
    hapticsService.heavy();
    if (newState) {
      socketService.send('MOUSE_PRESS', { button: 'left' });
    } else {
      socketService.send('MOUSE_RELEASE', { button: 'left' });
    }
  };

  // Clean up trail
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTrail((prev) => prev.filter((p) => now - p.time < 350));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-3 md:p-6 space-y-4 select-none">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between bg-[#181b26] border border-[#292a2f] rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-headline text-sm font-semibold text-[#e3e1e9] flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-[#00f0ff]" />
            Precision Touchpad
          </span>
          <span className="text-xs text-[#b9cacb] hidden sm:inline">
            1-Finger Move · 2-Finger Scroll · Tap Click
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Drag Lock Toggle */}
          <button
            onClick={toggleDragLock}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
              dragLocked
                ? 'bg-[#b026ff]/20 border-[#b026ff] text-[#efceff] shadow-[0_0_10px_rgba(176,38,255,0.3)]'
                : 'bg-[#1e1f25] border-[#292a2f] text-[#b9cacb] hover:text-[#e3e1e9]'
            }`}
          >
            {dragLocked ? <Lock className="w-3.5 h-3.5 text-[#b026ff]" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>Drag Lock</span>
          </button>

          {/* Quick Double Click button */}
          <button
            onClick={handleDoubleClick}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1e1f25] border border-[#292a2f] text-[#b9cacb] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all cursor-pointer"
          >
            2x Click
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showSettings
                ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff]'
                : 'bg-[#1e1f25] border-[#292a2f] text-[#b9cacb] hover:text-[#e3e1e9]'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Settings Pane */}
      {showSettings && (
        <div className="bg-[#181b26] border border-[#292a2f] rounded-xl p-4 space-y-3 transition-all animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[#b9cacb] font-medium">Pointer Sensitivity:</span>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-36 accent-[#00f0ff] cursor-pointer"
              />
              <span className="font-telemetry text-[#00f0ff] font-semibold">{sensitivity.toFixed(1)}x</span>
            </div>

            <div className="flex items-center gap-4 text-[#b9cacb]">
              <span>Two-Finger Tap: <strong className="text-[#e3e1e9]">Right Click</strong></span>
              <span>Single Tap: <strong className="text-[#e3e1e9]">Left Click</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Touchpad Surface */}
      <div className="relative flex-1 min-h-[340px] md:min-h-[440px] bg-[#12141c] border-2 border-[#222634] hover:border-[#00f0ff]/40 rounded-2xl overflow-hidden shadow-inner flex flex-col transition-colors">
        {/* Main Glide Area */}
        <div
          ref={touchpadRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing touchpad-surface flex items-center justify-center"
          style={{ touchAction: 'none' }}
        >
          {/* Subtle Cyber Center Crosshair */}
          <div className="pointer-events-none opacity-20 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full border border-dashed border-[#00f0ff] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#00f0ff]" />
            </div>
            <span className="font-telemetry text-[11px] tracking-wider uppercase text-[#00f0ff]">
              Touch Surface Active
            </span>
          </div>

          {/* Dynamic Touch Trails */}
          {trail.map((point) => (
            <div
              key={point.id}
              className="absolute pointer-events-none rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: point.x,
                top: point.y,
                width: 24,
                height: 24,
                background: 'radial-gradient(circle, rgba(0,240,255,0.6) 0%, transparent 70%)',
                boxShadow: '0 0 16px rgba(0,240,255,0.7)',
              }}
            />
          ))}

          {/* Scroll Strip Guide on the Right */}
          <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-white/5 bg-white/[0.01] pointer-events-none flex flex-col items-center justify-center gap-2 text-white/20">
            <MoveVertical className="w-4 h-4" />
            <span className="font-telemetry text-[8px] uppercase rotate-90 tracking-widest">Scroll</span>
          </div>
        </div>

        {/* Physical Mechanical Mouse Buttons at Bottom */}
        <div className="h-16 md:h-20 grid grid-cols-3 gap-1.5 p-2 bg-[#181b26] border-t border-[#292a2f]">
          <button
            onClick={handleLeftClick}
            className="keycap-tactile rounded-xl border border-[#38393f] flex flex-col items-center justify-center text-[#e3e1e9] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="font-headline font-semibold text-sm">Left Click</span>
            <span className="text-[10px] text-[#b9cacb]">Primary</span>
          </button>

          <button
            onClick={handleMiddleClick}
            className="keycap-tactile rounded-xl border border-[#38393f] flex flex-col items-center justify-center text-[#e3e1e9] hover:text-[#05ffa1] hover:border-[#05ffa1]/50 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="font-headline font-semibold text-sm">Middle</span>
            <span className="text-[10px] text-[#b9cacb]">Scroll / Tab</span>
          </button>

          <button
            onClick={handleRightClick}
            className="keycap-tactile rounded-xl border border-[#38393f] flex flex-col items-center justify-center text-[#e3e1e9] hover:text-[#b026ff] hover:border-[#b026ff]/50 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="font-headline font-semibold text-sm">Right Click</span>
            <span className="text-[10px] text-[#b9cacb]">Context</span>
          </button>
        </div>
      </div>
    </div>
  );
};
