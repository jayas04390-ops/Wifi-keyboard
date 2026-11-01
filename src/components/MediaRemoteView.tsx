import React, { useState } from 'react';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundEffects';
import { hapticsService } from '../services/haptics';
import { 
  Volume2, VolumeX, Volume1, Play, Pause, SkipForward, SkipBack, 
  Square, Sun, Moon, Lock, Presentation, Maximize2, MonitorOff, ChevronRight, ChevronLeft 
} from 'lucide-react';

export const MediaRemoteView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(65);
  const [brightness, setBrightness] = useState<number>(80);
  const [feedback, setFeedback] = useState<string>('');

  const sendMedia = (action: any, label?: string) => {
    soundService.playKeyClick('mouse');
    hapticsService.light();
    socketService.send('MEDIA_CONTROL', { action });
    if (label) {
      setFeedback(label);
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handlePlayPause = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    sendMedia('play_pause', next ? 'Playback Resumed' : 'Playback Paused');
  };

  const handleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sendMedia('mute', next ? 'Audio Muted' : 'Audio Unmuted');
  };

  const handleVolumeChange = (newVal: number) => {
    const clamped = Math.max(0, Math.min(100, newVal));
    const isUp = clamped > volume;
    setVolume(clamped);
    sendMedia(isUp ? 'vol_up' : 'vol_down');
  };

  const handleBrightnessChange = (delta: number) => {
    const next = Math.max(0, Math.min(100, brightness + delta));
    setBrightness(next);
    sendMedia(delta > 0 ? 'brightness_up' : 'brightness_down', `Brightness ${next}%`);
  };

  const sendKey = (key: string, label: string) => {
    soundService.playKeyClick('modifier');
    hapticsService.medium();
    socketService.send('KEY_TAP', { key });
    setFeedback(label);
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-3 md:p-6 space-y-6 select-none">
      {/* Header status */}
      <div className="flex items-center justify-between bg-[#181b26] border border-[#292a2f] rounded-xl px-4 py-3">
        <div>
          <h2 className="font-headline text-base font-semibold text-[#e3e1e9]">
            Media Player & Presentation Deck
          </h2>
          <p className="text-xs text-[#b9cacb]">
            Control audio playback, system brightness, PowerPoint slides, and sleep mode
          </p>
        </div>

        {feedback && (
          <span className="font-telemetry text-xs font-semibold text-[#00f0ff] bg-[#00f0ff]/10 px-3 py-1 rounded-md border border-[#00f0ff]/30 animate-pulse">
            {feedback}
          </span>
        )}
      </div>

      {/* Main Center Dial: Circular Volume Hub & Playback */}
      <div className="bg-[#12141c] border border-[#222634] rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-xl">
        {/* Glowing Tactile Wheel Center */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-[#252834] flex items-center justify-center bg-gradient-to-br from-[#1a1c24] to-[#121318] shadow-[0_0_30px_rgba(0,0,0,0.6)]">
          {/* Subtle Outer Dial Ring */}
          <div className="absolute inset-2 rounded-full border border-dashed border-[#00f0ff]/30 flex items-center justify-center">
            {/* Center Play/Pause Mega Button */}
            <button
              onClick={handlePlayPause}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#00a8b5] text-[#00363a] flex items-center justify-center shadow-lg shadow-[#00f0ff]/30 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
            </button>
          </div>

          {/* Volume percentage badge at top of wheel */}
          <div className="absolute -top-3 px-3 py-1 bg-[#181b26] border border-[#00f0ff]/50 rounded-full font-telemetry text-xs font-bold text-[#00f0ff] shadow-md">
            VOL {isMuted ? 'MUTED' : `${volume}%`}
          </div>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => sendMedia('prev', 'Previous Track')}
            className="keycap-tactile p-3.5 rounded-xl border border-[#292a2f] text-[#e3e1e9] hover:text-[#00f0ff] transition-all cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handleMute}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-[#ff2a55]/20 border-[#ff2a55] text-[#ffb4ab]'
                : 'keycap-tactile border-[#292a2f] text-[#e3e1e9] hover:text-[#00f0ff]'
            }`}
            title="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-[#ff2a55]" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => sendMedia('next', 'Next Track')}
            className="keycap-tactile p-3.5 rounded-xl border border-[#292a2f] text-[#e3e1e9] hover:text-[#00f0ff] transition-all cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => sendMedia('stop', 'Playback Stopped')}
            className="keycap-tactile p-3.5 rounded-xl border border-[#292a2f] text-[#e3e1e9] hover:text-[#ffb4ab] transition-all cursor-pointer"
            title="Stop Playback"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Smooth Volume Slider */}
        <div className="w-full max-w-md mt-6 flex items-center gap-4 px-2">
          <button
            onClick={() => handleVolumeChange(volume - 5)}
            className="text-xs font-telemetry text-[#b9cacb] hover:text-[#00f0ff] cursor-pointer"
          >
            -5
          </button>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#00f0ff] cursor-pointer"
          />
          <button
            onClick={() => handleVolumeChange(volume + 5)}
            className="text-xs font-telemetry text-[#b9cacb] hover:text-[#00f0ff] cursor-pointer"
          >
            +5
          </button>
        </div>
      </div>

      {/* Presentation Controller Row */}
      <div className="bg-[#181b26] border border-[#292a2f] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#b9cacb] uppercase tracking-wider font-telemetry flex items-center gap-1.5">
            <Presentation className="w-4 h-4 text-[#05ffa1]" />
            PowerPoint / Slides Remote Mode
          </span>
          <span className="text-[11px] text-[#849495]">F5 · PageUp / PageDown · B</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => sendKey('f5', 'Presentation Started (F5)')}
            className="keycap-tactile py-3 rounded-lg border border-[#292a2f] flex items-center justify-center gap-2 text-xs font-medium text-[#e3e1e9] hover:text-[#05ffa1] transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-[#05ffa1]" />
            <span>Start Slideshow (F5)</span>
          </button>

          <button
            onClick={() => sendKey('page_up', 'Previous Slide')}
            className="keycap-tactile py-3 rounded-lg border border-[#292a2f] flex items-center justify-center gap-2 text-xs font-medium text-[#e3e1e9] hover:text-[#00f0ff] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#00f0ff]" />
            <span>Prev Slide (PgUp)</span>
          </button>

          <button
            onClick={() => sendKey('page_down', 'Next Slide')}
            className="keycap-tactile py-3 rounded-lg border border-[#292a2f] flex items-center justify-center gap-2 text-xs font-medium text-[#e3e1e9] hover:text-[#00f0ff] transition-all cursor-pointer"
          >
            <span>Next Slide (PgDn)</span>
            <ChevronRight className="w-4 h-4 text-[#00f0ff]" />
          </button>

          <button
            onClick={() => sendKey('b', 'Blank Screen Toggled (B)')}
            className="keycap-tactile py-3 rounded-lg border border-[#292a2f] flex items-center justify-center gap-2 text-xs font-medium text-[#e3e1e9] hover:text-[#ffb800] transition-all cursor-pointer"
          >
            <MonitorOff className="w-4 h-4 text-[#ffb800]" />
            <span>Black Screen (B)</span>
          </button>
        </div>
      </div>

      {/* Display & Power Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Brightness Adjust */}
        <div className="bg-[#181b26] border border-[#292a2f] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sun className="w-5 h-5 text-[#ffb800]" />
            <div>
              <div className="font-headline text-xs font-semibold text-[#e3e1e9]">Screen Brightness</div>
              <div className="font-telemetry text-[11px] text-[#b9cacb]">{brightness}% Display Level</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBrightnessChange(-10)}
              className="keycap-tactile px-3 py-1.5 rounded-lg border border-[#292a2f] text-xs font-semibold text-[#e3e1e9] hover:text-[#ffb800] cursor-pointer"
            >
              -10%
            </button>
            <button
              onClick={() => handleBrightnessChange(10)}
              className="keycap-tactile px-3 py-1.5 rounded-lg border border-[#292a2f] text-xs font-semibold text-[#e3e1e9] hover:text-[#ffb800] cursor-pointer"
            >
              +10%
            </button>
          </div>
        </div>

        {/* Lock & Sleep Workstation */}
        <div className="bg-[#181b26] border border-[#292a2f] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-[#ffb4ab]" />
            <div>
              <div className="font-headline text-xs font-semibold text-[#e3e1e9]">Security & Power</div>
              <div className="font-telemetry text-[11px] text-[#b9cacb]">Windows 11 Workstation</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => sendMedia('lock', 'Windows 11 Workstation Locked')}
              className="keycap-tactile px-3 py-1.5 rounded-lg border border-[#292a2f] text-xs font-semibold text-[#ffb4ab] hover:border-[#ff2a55] cursor-pointer"
            >
              Lock PC
            </button>
            <button
              onClick={() => sendMedia('sleep', 'System Sleep Requested')}
              className="keycap-tactile px-3 py-1.5 rounded-lg border border-[#292a2f] text-xs font-semibold text-[#b9cacb] hover:text-[#00f0ff] cursor-pointer"
            >
              Sleep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
