import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import { 
  Minus, Square, X, Terminal, FileText, Music, 
  Wifi, Volume2, Search, Play, Pause, SkipForward, SkipBack, Lock, Maximize2 
} from 'lucide-react';

interface EventLog {
  id: string;
  time: string;
  type: string;
  payloadStr: string;
}

export const WindowsSimulator: React.FC = () => {
  // Cursor position inside simulator bounds (percentage 0 - 100)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [cursorClicking, setCursorClicking] = useState<boolean>(false);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  // Active windows states
  const [notepadText, setNotepadText] = useState<string>(
    'Welcome to CyberTactile Windows 11 Receiver.\nTry typing on the keyboard or transferring text now!'
  );
  const [activeWindow, setActiveWindow] = useState<'notepad' | 'terminal' | 'player'>('notepad');
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Media Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playerVolume, setPlayerVolume] = useState<number>(65);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const tracks = [
    { title: 'Cybernetic Horizons', artist: 'Windows 11 Audio Synth', duration: '3:45' },
    { title: 'Low Latency Stream', artist: 'WebSocket Express', duration: '4:12' },
    { title: 'Emerald Link Protocol', artist: 'Packet Audio', duration: '2:58' },
  ];

  // Live Terminal Log
  const [logs, setLogs] = useState<EventLog[]>([
    { id: '1', time: '00:00:01', type: 'AGENT_INIT', payloadStr: 'Windows 11 Receiver listening on port 8765' },
    { id: '2', time: '00:00:02', type: 'LINK_ESTABLISHED', payloadStr: 'Sub-4ms WiFi link confirmed (PIN verified)' },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen to all socketService messages
    const unsubscribe = socketService.onMessage((msg: any) => {
      const timeStr = new Date().toLocaleTimeString();
      const newLog: EventLog = {
        id: Math.random().toString(),
        time: timeStr,
        type: msg.type || 'UNKNOWN',
        payloadStr: JSON.stringify(msg.payload || {}),
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 30)]);

      // Process input effects
      switch (msg.type) {
        case 'MOUSE_MOVE': {
          const dx = (msg.payload?.dx || 0) * 0.18;
          const dy = (msg.payload?.dy || 0) * 0.18;
          setCursorPos((prev) => ({
            x: Math.max(2, Math.min(98, prev.x + dx)),
            y: Math.max(2, Math.min(96, prev.y + dy)),
          }));
          break;
        }

        case 'MOUSE_CLICK': {
          setCursorClicking(true);
          setClickRipple({ x: cursorPos.x, y: cursorPos.y, id: Date.now() });
          setTimeout(() => setCursorClicking(false), 150);
          break;
        }

        case 'KEY_TAP': {
          const key = msg.payload?.key;
          if (!key) break;
          if (key === 'backspace') {
            setNotepadText((prev) => prev.slice(0, -1));
          } else if (key === 'enter') {
            setNotepadText((prev) => prev + '\n');
          } else if (key === 'space' || key === ' ') {
            setNotepadText((prev) => prev + ' ');
          } else if (key === 'tab') {
            setNotepadText((prev) => prev + '  ');
          } else if (key.length === 1) {
            setNotepadText((prev) => prev + key);
          }
          break;
        }

        case 'TEXT_TRANSFER': {
          const text = msg.payload?.text;
          if (text) {
            setNotepadText((prev) => prev + '\n' + text);
          }
          break;
        }

        case 'CLIPBOARD_ACTION': {
          if (msg.payload?.action === 'select_all') {
            // Highlighted state
          }
          break;
        }

        case 'MEDIA_CONTROL': {
          const action = msg.payload?.action;
          if (action === 'play_pause') {
            setIsPlaying((prev) => !prev);
          } else if (action === 'vol_up') {
            setPlayerVolume((prev) => Math.min(100, prev + 5));
          } else if (action === 'vol_down') {
            setPlayerVolume((prev) => Math.max(0, prev - 5));
          } else if (action === 'next') {
            setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
          } else if (action === 'prev') {
            setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
          } else if (action === 'lock') {
            setIsLocked(true);
          }
          break;
        }

        case 'SHORTCUT': {
          const keys = msg.payload?.keys || [];
          if (keys.includes('l') && keys.includes('win')) {
            setIsLocked(true);
          } else if (keys.includes('d') && keys.includes('win')) {
            // Show desktop toggle
            setActiveWindow((prev) => (prev === 'notepad' ? 'terminal' : 'notepad'));
          } else if (keys.includes('tab') && keys.includes('alt')) {
            setActiveWindow((prev) => (prev === 'notepad' ? 'player' : prev === 'player' ? 'terminal' : 'notepad'));
          }
          break;
        }
      }
    });

    return () => unsubscribe();
  }, [cursorPos]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0d0e13] border-2 border-[#222634] rounded-2xl overflow-hidden shadow-2xl relative select-none">
      {/* Windows 11 Desktop Screen Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[480px] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090a0f] overflow-hidden p-3 md:p-6"
      >
        {/* Subtle Windows 11 Bloom Ambient Wallpaper Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#38bdf8]/20 via-[#818cf8]/10 to-transparent" />

        {/* Lock Screen Overlay */}
        {isLocked && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in">
            <Lock className="w-12 h-12 text-[#ffb4ab]" />
            <h2 className="font-headline text-2xl font-bold text-white">Workstation Locked</h2>
            <p className="text-sm text-[#b9cacb]">Press Unlock below or send password</p>
            <button
              onClick={() => setIsLocked(false)}
              className="px-6 py-2 rounded-xl bg-[#00f0ff] text-[#00363a] font-headline font-bold text-sm cursor-pointer shadow-lg shadow-[#00f0ff]/30"
            >
              Unlock Desktop
            </button>
          </div>
        )}

        {/* Floating Windows Stack */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 h-full pb-14">
          {/* Window 1: Notepad (Text & Keystroke Receiver) */}
          <div
            onClick={() => setActiveWindow('notepad')}
            className={`flex flex-col rounded-xl overflow-hidden border transition-all ${
              activeWindow === 'notepad'
                ? 'bg-[#1e1f25]/95 border-[#00f0ff]/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                : 'bg-[#181b26]/75 border-[#292a2f] opacity-85'
            }`}
          >
            {/* Window Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#12141c] border-b border-[#292a2f]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-headline text-xs font-semibold text-[#e3e1e9]">
                  Notepad — Untitled.txt (Live Typing Buffer)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1 hover:bg-white/10 rounded text-[#849495]"><Minus className="w-3 h-3" /></button>
                <button className="p-1 hover:bg-white/10 rounded text-[#849495]"><Square className="w-3 h-3" /></button>
                <button onClick={() => setNotepadText('')} className="p-1 hover:bg-[#ff2a55]/20 hover:text-[#ffb4ab] rounded text-[#849495]"><X className="w-3 h-3" /></button>
              </div>
            </div>

            {/* Notepad Content Area */}
            <div className="flex-1 p-3 font-telemetry text-xs leading-relaxed text-[#e3e1e9] bg-[#121318]/90 overflow-y-auto whitespace-pre-wrap min-h-[160px]">
              {notepadText}
              <span className="inline-block w-1.5 h-3.5 bg-[#00f0ff] ml-0.5 animate-pulse" />
            </div>

            {/* Status bar */}
            <div className="px-3 py-1 bg-[#12141c] border-t border-[#222634] flex items-center justify-between text-[10px] text-[#849495] font-telemetry">
              <span>Ln {notepadText.split('\n').length}, Col {notepadText.length}</span>
              <span>100% · Windows (CRLF) · UTF-8</span>
            </div>
          </div>

          {/* Window 2: Windows Terminal / Packet Telemetry */}
          <div
            onClick={() => setActiveWindow('terminal')}
            className={`flex flex-col rounded-xl overflow-hidden border transition-all ${
              activeWindow === 'terminal'
                ? 'bg-[#1e1f25]/95 border-[#05ffa1]/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                : 'bg-[#181b26]/75 border-[#292a2f] opacity-85'
            }`}
          >
            {/* Terminal Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#12141c] border-b border-[#292a2f]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#05ffa1]" />
                <span className="font-headline text-xs font-semibold text-[#e3e1e9]">
                  PowerShell — Windows Input Telemetry Log
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1 hover:bg-white/10 rounded text-[#849495]"><Minus className="w-3 h-3" /></button>
                <button className="p-1 hover:bg-white/10 rounded text-[#849495]"><Square className="w-3 h-3" /></button>
                <button onClick={() => setLogs([])} className="p-1 hover:bg-[#ff2a55]/20 hover:text-[#ffb4ab] rounded text-[#849495]"><X className="w-3 h-3" /></button>
              </div>
            </div>

            {/* Terminal Feed */}
            <div className="flex-1 p-3 font-telemetry text-[11px] text-[#05ffa1] bg-[#0d0e13]/95 overflow-y-auto space-y-1 min-h-[160px]">
              <div className="text-[#849495] text-[10px]">
                PS C:\Windows\System32&gt; .\CyberTactile-Agent.exe --listen 8765
              </div>
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-tight">
                  <span className="text-[#849495] shrink-0">[{log.time}]</span>
                  <span className="text-[#00f0ff] font-semibold shrink-0">{log.type}</span>
                  <span className="text-[#e3e1e9] truncate">{log.payloadStr}</span>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="px-3 py-1 bg-[#12141c] border-t border-[#222634] flex items-center justify-between text-[10px] text-[#849495] font-telemetry">
              <span>Status: Listening on 127.0.0.1:8765</span>
              <span>Events Logged: {logs.length}</span>
            </div>
          </div>
        </div>

        {/* Media Player Floating Card */}
        <div className="absolute left-6 bottom-16 z-20 hidden sm:flex items-center gap-3 p-2.5 bg-[#181b26]/90 backdrop-blur-md border border-[#292a2f] rounded-xl shadow-lg">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00f0ff]/30 to-[#b026ff]/30 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
            <Music className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="min-w-0 pr-3">
            <div className="font-headline text-xs font-semibold text-[#e3e1e9] truncate">
              {tracks[currentTrackIndex].title}
            </div>
            <div className="text-[10px] text-[#b9cacb]">
              {tracks[currentTrackIndex].artist} · Vol {playerVolume}%
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)}
              className="p-1 hover:text-[#00f0ff] text-[#b9cacb] cursor-pointer"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 hover:text-[#00f0ff] text-[#e3e1e9] cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)}
              className="p-1 hover:text-[#00f0ff] text-[#b9cacb] cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Simulated Cursor with Cyan Trail & Click Ripple */}
        <div
          className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
          style={{
            left: `${cursorPos.x}%`,
            top: `${cursorPos.y}%`,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cyber Pointer Arrow */}
          <svg
            className={`w-5 h-5 drop-shadow-[0_2px_8px_rgba(0,240,255,0.7)] ${
              cursorClicking ? 'scale-90' : 'scale-100'
            } transition-transform`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
              fill="#00f0ff"
              stroke="#00363a"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Click Ripple Wave */}
          {clickRipple && (
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full border-2 border-[#00f0ff] animate-ping pointer-events-none" />
          )}
        </div>

        {/* Windows 11 Taskbar */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#121318]/95 backdrop-blur-xl border-t border-[#292a2f] flex items-center justify-between px-4 z-20">
          {/* Left Weather Widget */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#b9cacb]">
            <span className="text-[#ffb800]">☀️ 72°F</span>
            <span>Clear</span>
          </div>

          {/* Center Pinned App Icons (Windows 11 Centered Taskbar) */}
          <div className="flex items-center gap-1.5 mx-auto">
            {/* Start Button (Windows Logo) */}
            <button
              onClick={() => setActiveWindow(activeWindow === 'notepad' ? 'terminal' : 'notepad')}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer group"
              title="Windows Start"
            >
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-[#00f0ff] rounded-xs" />
                <div className="bg-[#00f0ff] rounded-xs" />
                <div className="bg-[#00f0ff] rounded-xs" />
                <div className="bg-[#00f0ff] rounded-xs" />
              </div>
            </button>

            {/* Search Icon */}
            <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#b9cacb] transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {/* Pinned Notepad */}
            <button
              onClick={() => setActiveWindow('notepad')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeWindow === 'notepad' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'hover:bg-white/10 text-[#b9cacb]'
              }`}
              title="Notepad"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Pinned Terminal */}
            <button
              onClick={() => setActiveWindow('terminal')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeWindow === 'terminal' ? 'bg-[#05ffa1]/20 text-[#05ffa1]' : 'hover:bg-white/10 text-[#b9cacb]'
              }`}
              title="PowerShell Terminal"
            >
              <Terminal className="w-4 h-4" />
            </button>

            {/* Pinned Media Player */}
            <button
              onClick={() => setActiveWindow('player')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeWindow === 'player' ? 'bg-[#b026ff]/20 text-[#b026ff]' : 'hover:bg-white/10 text-[#b9cacb]'
              }`}
              title="Media Player"
            >
              <Music className="w-4 h-4" />
            </button>
          </div>

          {/* Right System Tray (WiFi, Sound, Clock) */}
          <div className="flex items-center gap-3 text-xs font-telemetry text-[#b9cacb]">
            <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5">
              <Wifi className="w-3.5 h-3.5 text-[#05ffa1]" />
              <Volume2 className="w-3.5 h-3.5 text-[#00f0ff]" />
            </div>
            <div className="text-right leading-tight text-[11px]">
              <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-[9px] text-[#849495]">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
