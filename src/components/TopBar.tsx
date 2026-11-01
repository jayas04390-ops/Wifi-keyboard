import React from 'react';
import { ViewMode, TelemetryData } from '../types';
import { Wifi, Radio, Code2, MonitorPlay } from 'lucide-react';

interface TopBarProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  telemetry: TelemetryData;
  onOpenPairing: () => void;
  showDesktopSimulator: boolean;
  onToggleSimulator: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  telemetry,
  onOpenPairing,
  showDesktopSimulator,
  onToggleSimulator,
}) => {
  const isConnected = telemetry.status === 'connected' || telemetry.status === 'paired';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121318]/90 backdrop-blur-md border-b border-[#292a2f] px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark (Space Grotesk, single element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff]/20 to-[#05ffa1]/20 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-headline text-lg md:text-xl font-bold tracking-tight text-[#e3e1e9] whitespace-nowrap">
            Cyber<span className="text-[#00f0ff]">Tactile</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#b9cacb]">
          <button
            onClick={() => onSelectView('touchpad')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeView === 'touchpad'
                ? 'text-[#00f0ff] font-semibold border-b-2 border-[#00f0ff]'
                : 'hover:text-[#e3e1e9]'
            }`}
          >
            Touchpad
          </button>
          <button
            onClick={() => onSelectView('keyboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeView === 'keyboard'
                ? 'text-[#00f0ff] font-semibold border-b-2 border-[#00f0ff]'
                : 'hover:text-[#e3e1e9]'
            }`}
          >
            Keyboard
          </button>
          <button
            onClick={() => onSelectView('text_transfer')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeView === 'text_transfer'
                ? 'text-[#00f0ff] font-semibold border-b-2 border-[#00f0ff]'
                : 'hover:text-[#e3e1e9]'
            }`}
          >
            Text Transfer
          </button>
          <button
            onClick={() => onSelectView('shortcuts')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeView === 'shortcuts'
                ? 'text-[#00f0ff] font-semibold border-b-2 border-[#00f0ff]'
                : 'hover:text-[#e3e1e9]'
            }`}
          >
            Shortcuts
          </button>
          <button
            onClick={() => onSelectView('media')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeView === 'media'
                ? 'text-[#00f0ff] font-semibold border-b-2 border-[#00f0ff]'
                : 'hover:text-[#e3e1e9]'
            }`}
          >
            Media Remote
          </button>
          <button
            onClick={() => onSelectView('python_agent')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeView === 'python_agent'
                ? 'text-[#05ffa1] font-semibold border-b-2 border-[#05ffa1]'
                : 'hover:text-[#e3e1e9]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#05ffa1]" />
            Python Agent
          </button>
        </nav>

        {/* Zone 3: Primary Action & Live Telemetry Badge */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Windows 11 Desktop Screen Toggle */}
          <button
            onClick={onToggleSimulator}
            title="Toggle Windows 11 Desktop Live Sandbox"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
              showDesktopSimulator
                ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#dbfcff] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-[#1e1f25] border-[#292a2f] text-[#b9cacb] hover:border-[#38393f] hover:text-[#e3e1e9]'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden sm:inline">Windows 11 Screen</span>
          </button>

          {/* Pairing & WiFi Status Action Button */}
          <button
            onClick={onOpenPairing}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
              isConnected
                ? 'bg-[#181b26] border-[#05ffa1]/40 text-[#05ffa1] hover:border-[#05ffa1] shadow-[0_0_10px_rgba(5,255,161,0.15)]'
                : 'bg-[#181b26] border-[#ff2a55]/40 text-[#ffb4ab] hover:border-[#ff2a55]'
            }`}
          >
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-[#05ffa1]' : 'text-[#ff2a55]'}`} />
            <span className="font-telemetry tracking-tight">
              {isConnected ? `${telemetry.rttMs}ms · Online` : 'Connect'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
