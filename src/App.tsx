import React, { useState, useEffect } from 'react';
import { ViewMode, TelemetryData } from './types';
import { socketService } from './services/socketService';
import { TopBar } from './components/TopBar';
import { TouchpadView } from './components/TouchpadView';
import { KeyboardView } from './components/KeyboardView';
import { TextTransferView } from './components/TextTransferView';
import { ShortcutsView } from './components/ShortcutsView';
import { MediaRemoteView } from './components/MediaRemoteView';
import { WindowsSimulator } from './components/WindowsSimulator';
import { PairingModal } from './components/PairingModal';
import { PythonAgentModal } from './components/PythonAgentModal';
import { 
  MousePointer, Keyboard, ArrowRightLeft, 
  Layers, Disc3, Code2, MonitorPlay 
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('touchpad');
  const [telemetry, setTelemetry] = useState<TelemetryData>(socketService.telemetry);
  const [isPairingOpen, setIsPairingOpen] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(true);

  // Subscribe to telemetry changes
  useEffect(() => {
    const unsub = socketService.subscribe(() => {
      setTelemetry({ ...socketService.telemetry });
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121318] text-[#e3e1e9] flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Bar with Top Bar Contract */}
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        telemetry={telemetry}
        onOpenPairing={() => setIsPairingOpen(true)}
        showDesktopSimulator={showSimulator}
        onToggleSimulator={() => setShowSimulator(!showSimulator)}
      />

      {/* Main Workspace: Split Screen on Large Screens (Remote + Windows Simulator) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col">
        {/* Full-width Python Agent view if active */}
        {activeView === 'python_agent' ? (
          <PythonAgentModal />
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Smartphone Remote Controller (Touchpad, Keyboard, Text, etc.) */}
            <div
              className={`flex flex-col transition-all duration-200 ${
                showSimulator ? 'lg:col-span-7' : 'lg:col-span-12 max-w-4xl mx-auto w-full'
              }`}
            >
              <div className="bg-[#121318] border border-[#222634] rounded-2xl shadow-xl overflow-hidden min-h-[540px] flex flex-col">
                {activeView === 'touchpad' && <TouchpadView />}
                {activeView === 'keyboard' && <KeyboardView />}
                {activeView === 'text_transfer' && <TextTransferView />}
                {activeView === 'shortcuts' && <ShortcutsView />}
                {activeView === 'media' && <MediaRemoteView />}
              </div>
            </div>

            {/* Right Column: Interactive Windows 11 Desktop Simulator */}
            {showSimulator && (
              <div className="lg:col-span-5 hidden lg:flex flex-col sticky top-20">
                <div className="flex items-center justify-between px-3 py-2 bg-[#181b26] border border-[#292a2f] rounded-t-2xl">
                  <span className="font-headline text-xs font-semibold text-[#e3e1e9] flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4 text-[#00f0ff]" />
                    Windows 11 Live Screen Mirror
                  </span>
                  <span className="font-telemetry text-[11px] text-[#05ffa1] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#05ffa1] animate-pulse" />
                    Live Input Sync Active
                  </span>
                </div>
                <WindowsSimulator />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation Tab Bar (375px - 768px thumb zone) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121318]/95 backdrop-blur-lg border-t border-[#292a2f] flex lg:hidden items-center justify-around h-16 px-1">
        <button
          onClick={() => setActiveView('touchpad')}
          className={`flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            activeView === 'touchpad' ? 'text-[#00f0ff]' : 'text-[#849495] hover:text-[#b9cacb]'
          }`}
        >
          <MousePointer className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Touchpad</span>
        </button>

        <button
          onClick={() => setActiveView('keyboard')}
          className={`flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            activeView === 'keyboard' ? 'text-[#00f0ff]' : 'text-[#849495] hover:text-[#b9cacb]'
          }`}
        >
          <Keyboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Keyboard</span>
        </button>

        <button
          onClick={() => setActiveView('text_transfer')}
          className={`flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            activeView === 'text_transfer' ? 'text-[#00f0ff]' : 'text-[#849495] hover:text-[#b9cacb]'
          }`}
        >
          <ArrowRightLeft className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Text Sync</span>
        </button>

        <button
          onClick={() => setActiveView('shortcuts')}
          className={`flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            activeView === 'shortcuts' ? 'text-[#00f0ff]' : 'text-[#849495] hover:text-[#b9cacb]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Shortcuts</span>
        </button>

        <button
          onClick={() => setActiveView('media')}
          className={`flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            activeView === 'media' ? 'text-[#00f0ff]' : 'text-[#849495] hover:text-[#b9cacb]'
          }`}
        >
          <Disc3 className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Media</span>
        </button>

        <button
          onClick={() => setActiveView('python_agent')}
          className={`flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            activeView === 'python_agent' ? 'text-[#05ffa1]' : 'text-[#849495] hover:text-[#b9cacb]'
          }`}
        >
          <Code2 className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Agent</span>
        </button>
      </nav>

      {/* Pairing & WiFi Modal */}
      <PairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
