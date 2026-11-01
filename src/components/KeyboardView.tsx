import React, { useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundEffects';
import { hapticsService } from '../services/haptics';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  CornerDownLeft, Delete, Delete as BackspaceIcon, 
  Sparkles, Grid, Hash, Volume2, VolumeX 
} from 'lucide-react';

export const KeyboardView: React.FC = () => {
  // Modifiers
  const [shiftActive, setShiftActive] = useState<boolean>(false);
  const [capsLock, setCapsLock] = useState<boolean>(false);
  const [ctrlActive, setCtrlActive] = useState<boolean>(false);
  const [altActive, setAltActive] = useState<boolean>(false);
  const [winActive, setWinActive] = useState<boolean>(false);

  // Sub-views
  const [showFKeys, setShowFKeys] = useState<boolean>(true);
  const [showNumpad, setShowNumpad] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(!soundService.enabled);

  // Send key tap
  const handleKeyTap = useCallback((key: string, soundType: 'standard' | 'space' | 'enter' | 'modifier' = 'standard') => {
    soundService.playKeyClick(soundType);
    hapticsService.light();

    // Check if modifiers are held
    const activeModifiers = {
      ctrl: ctrlActive,
      shift: shiftActive || capsLock,
      alt: altActive,
      win: winActive,
    };

    let effectiveChar = key;
    if (key.length === 1) {
      const isUpper = (shiftActive && !capsLock) || (!shiftActive && capsLock);
      effectiveChar = isUpper ? key.toUpperCase() : key.toLowerCase();
    }

    socketService.send('KEY_TAP', {
      key: effectiveChar,
      modifiers: activeModifiers,
    });

    // Auto release non-locking shift after letter
    if (shiftActive && !capsLock) {
      setShiftActive(false);
    }
    // Auto release one-shot ctrl/alt/win if tapped in combo
    if (ctrlActive) setCtrlActive(false);
    if (altActive) setAltActive(false);
    if (winActive) setWinActive(false);
  }, [shiftActive, capsLock, ctrlActive, altActive, winActive]);

  // Modifiers toggle
  const toggleModifier = (mod: 'shift' | 'caps' | 'ctrl' | 'alt' | 'win') => {
    soundService.playKeyClick('modifier');
    hapticsService.medium();
    if (mod === 'shift') setShiftActive(!shiftActive);
    if (mod === 'caps') setCapsLock(!capsLock);
    if (mod === 'ctrl') {
      const next = !ctrlActive;
      setCtrlActive(next);
      socketService.send(next ? 'KEY_DOWN' : 'KEY_UP', { key: 'ctrl' });
    }
    if (mod === 'alt') {
      const next = !altActive;
      setAltActive(next);
      socketService.send(next ? 'KEY_DOWN' : 'KEY_UP', { key: 'alt' });
    }
    if (mod === 'win') {
      const next = !winActive;
      setWinActive(next);
      socketService.send(next ? 'KEY_DOWN' : 'KEY_UP', { key: 'win' });
    }
  };

  const isUpperCase = (shiftActive && !capsLock) || (!shiftActive && capsLock);

  const numRow = [
    { base: '`', shift: '~' },
    { base: '1', shift: '!' },
    { base: '2', shift: '@' },
    { base: '3', shift: '#' },
    { base: '4', shift: '$' },
    { base: '5', shift: '%' },
    { base: '6', shift: '^' },
    { base: '7', shift: '&' },
    { base: '8', shift: '*' },
    { base: '9', shift: '(' },
    { base: '0', shift: ')' },
    { base: '-', shift: '_' },
    { base: '=', shift: '+' },
  ];

  const qwertyRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
  const qwertyRow2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
  const qwertyRow3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-2 md:p-6 space-y-3 select-none">
      {/* Top Toolbar: F-Keys toggle, Numpad toggle, Sound switch */}
      <div className="flex items-center justify-between bg-[#181b26] border border-[#292a2f] rounded-xl px-3 md:px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFKeys(!showFKeys)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              showFKeys
                ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff]'
                : 'bg-[#1e1f25] border-[#292a2f] text-[#b9cacb] hover:text-[#e3e1e9]'
            }`}
          >
            F1 - F12
          </button>

          <button
            onClick={() => setShowNumpad(!showNumpad)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
              showNumpad
                ? 'bg-[#b026ff]/15 border-[#b026ff] text-[#efceff]'
                : 'bg-[#1e1f25] border-[#292a2f] text-[#b9cacb] hover:text-[#e3e1e9]'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Numpad</span>
          </button>
        </div>

        {/* Audio click feedback toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const next = !soundService.enabled;
              soundService.enabled = next;
              setSoundMuted(!next);
            }}
            title="Toggle mechanical key audio clicks"
            className="p-1.5 rounded-lg bg-[#1e1f25] border border-[#292a2f] text-[#b9cacb] hover:text-[#00f0ff] transition-colors cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-[#ffb4ab]" /> : <Volume2 className="w-4 h-4 text-[#05ffa1]" />}
          </button>

          <span className="font-telemetry text-xs text-[#b9cacb] hidden sm:inline">
            Active: <strong className="text-[#00f0ff]">{capsLock ? 'CAPS LOCK' : isUpperCase ? 'SHIFT' : 'LOWER'}</strong>
          </span>
        </div>
      </div>

      {/* Function Keys Row (F1 to F12 + Esc + Ins + Del) */}
      {showFKeys && (
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1 md:gap-1.5 p-1.5 md:p-2 bg-[#12141c] border border-[#222634] rounded-xl overflow-x-auto">
          <button
            onClick={() => handleKeyTap('esc', 'modifier')}
            className="keycap-tactile py-2 rounded-lg border border-[#38393f] font-telemetry text-xs font-semibold text-[#ffb4ab] hover:border-[#ff2a55] transition-all cursor-pointer"
          >
            Esc
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
            <button
              key={`f${num}`}
              onClick={() => handleKeyTap(`f${num}`, 'modifier')}
              className="keycap-tactile py-2 rounded-lg border border-[#292a2f] font-telemetry text-xs font-medium text-[#b9cacb] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all cursor-pointer"
            >
              F{num}
            </button>
          ))}
          <button
            onClick={() => handleKeyTap('delete', 'modifier')}
            className="keycap-tactile py-2 rounded-lg border border-[#38393f] font-telemetry text-xs font-semibold text-[#b9cacb] hover:text-[#ffb4ab] transition-all cursor-pointer"
          >
            Del
          </button>
        </div>
      )}

      {/* Main Keyboard Body or Numpad */}
      {!showNumpad ? (
        <div className="flex flex-col gap-1.5 md:gap-2 p-2 md:p-3 bg-[#12141c] border border-[#222634] rounded-2xl shadow-xl">
          {/* Row 1: Numbers & Symbols */}
          <div className="flex gap-1 md:gap-1.5">
            {numRow.map((item) => (
              <button
                key={item.base}
                onClick={() => handleKeyTap(shiftActive ? item.shift : item.base)}
                className="keycap-tactile flex-1 py-3 md:py-3.5 rounded-lg border border-[#292a2f] flex flex-col items-center justify-center font-telemetry active:scale-[0.97] transition-all cursor-pointer"
              >
                <span className="text-[10px] text-[#b9cacb] leading-none">{item.shift}</span>
                <span className="text-xs md:text-sm font-semibold text-[#e3e1e9] leading-tight">{item.base}</span>
              </button>
            ))}
            <button
              onClick={() => handleKeyTap('backspace', 'enter')}
              className="keycap-tactile w-14 md:w-20 rounded-lg border border-[#38393f] flex items-center justify-center text-[#ffb4ab] hover:border-[#ff2a55]/60 active:scale-[0.97] transition-all cursor-pointer"
            >
              <BackspaceIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2: Tab + QWERTY 1 */}
          <div className="flex gap-1 md:gap-1.5">
            <button
              onClick={() => handleKeyTap('tab', 'modifier')}
              className="keycap-tactile w-12 md:w-16 rounded-lg border border-[#292a2f] font-telemetry text-xs font-medium text-[#b9cacb] active:scale-[0.97] transition-all cursor-pointer"
            >
              Tab
            </button>
            {qwertyRow1.map((char) => (
              <button
                key={char}
                onClick={() => handleKeyTap(char)}
                className="keycap-tactile flex-1 py-3.5 md:py-4 rounded-lg border border-[#292a2f] font-headline font-semibold text-sm md:text-base text-[#e3e1e9] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 active:scale-[0.97] transition-all cursor-pointer"
              >
                {isUpperCase ? char.toUpperCase() : char}
              </button>
            ))}
            <button
              onClick={() => handleKeyTap('\\')}
              className="keycap-tactile w-10 md:w-14 rounded-lg border border-[#292a2f] font-telemetry text-xs text-[#b9cacb] active:scale-[0.97] transition-all cursor-pointer"
            >
              \
            </button>
          </div>

          {/* Row 3: Caps Lock + QWERTY 2 + Enter */}
          <div className="flex gap-1 md:gap-1.5">
            <button
              onClick={() => toggleModifier('caps')}
              className={`w-14 md:w-20 rounded-lg border font-telemetry text-xs font-semibold active:scale-[0.97] transition-all cursor-pointer ${
                capsLock
                  ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'keycap-tactile border-[#292a2f] text-[#b9cacb]'
              }`}
            >
              Caps
            </button>
            {qwertyRow2.map((char) => (
              <button
                key={char}
                onClick={() => handleKeyTap(char)}
                className="keycap-tactile flex-1 py-3.5 md:py-4 rounded-lg border border-[#292a2f] font-headline font-semibold text-sm md:text-base text-[#e3e1e9] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 active:scale-[0.97] transition-all cursor-pointer"
              >
                {isUpperCase ? char.toUpperCase() : char}
              </button>
            ))}
            <button
              onClick={() => handleKeyTap('enter', 'enter')}
              className="keycap-tactile w-16 md:w-24 rounded-lg border border-[#05ffa1]/50 bg-[#05ffa1]/10 text-[#05ffa1] flex items-center justify-center gap-1 font-headline font-semibold text-xs md:text-sm active:scale-[0.97] transition-all cursor-pointer"
            >
              <CornerDownLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Enter</span>
            </button>
          </div>

          {/* Row 4: Shift + QWERTY 3 + Up Arrow */}
          <div className="flex gap-1 md:gap-1.5">
            <button
              onClick={() => toggleModifier('shift')}
              className={`w-16 md:w-24 rounded-lg border font-telemetry text-xs font-semibold active:scale-[0.97] transition-all cursor-pointer ${
                shiftActive
                  ? 'bg-[#00f0ff]/25 border-[#00f0ff] text-[#dbfcff] shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                  : 'keycap-tactile border-[#292a2f] text-[#b9cacb]'
              }`}
            >
              Shift
            </button>
            {qwertyRow3.map((char) => (
              <button
                key={char}
                onClick={() => handleKeyTap(char)}
                className="keycap-tactile flex-1 py-3.5 md:py-4 rounded-lg border border-[#292a2f] font-headline font-semibold text-sm md:text-base text-[#e3e1e9] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 active:scale-[0.97] transition-all cursor-pointer"
              >
                {isUpperCase ? char.toUpperCase() : char}
              </button>
            ))}
            <button
              onClick={() => handleKeyTap('up', 'modifier')}
              className="keycap-tactile w-12 md:w-16 rounded-lg border border-[#292a2f] flex items-center justify-center text-[#e3e1e9] active:scale-[0.97] transition-all cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 text-[#00f0ff]" />
            </button>
          </div>

          {/* Row 5: Modifiers (Ctrl, Win, Alt) + Space + Arrows (Left, Down, Right) */}
          <div className="flex gap-1 md:gap-1.5">
            <button
              onClick={() => toggleModifier('ctrl')}
              className={`w-12 md:w-16 py-3 rounded-lg border font-telemetry text-xs font-semibold active:scale-[0.97] transition-all cursor-pointer ${
                ctrlActive
                  ? 'bg-[#b026ff]/30 border-[#b026ff] text-[#efceff] shadow-[0_0_12px_rgba(176,38,255,0.5)]'
                  : 'keycap-tactile border-[#292a2f] text-[#b9cacb]'
              }`}
            >
              Ctrl
            </button>
            <button
              onClick={() => toggleModifier('win')}
              className={`w-11 md:w-14 py-3 rounded-lg border font-telemetry text-xs font-semibold active:scale-[0.97] transition-all cursor-pointer ${
                winActive
                  ? 'bg-[#00f0ff]/30 border-[#00f0ff] text-[#dbfcff] shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                  : 'keycap-tactile border-[#292a2f] text-[#b9cacb]'
              }`}
            >
              Win
            </button>
            <button
              onClick={() => toggleModifier('alt')}
              className={`w-11 md:w-14 py-3 rounded-lg border font-telemetry text-xs font-semibold active:scale-[0.97] transition-all cursor-pointer ${
                altActive
                  ? 'bg-[#b026ff]/30 border-[#b026ff] text-[#efceff] shadow-[0_0_12px_rgba(176,38,255,0.5)]'
                  : 'keycap-tactile border-[#292a2f] text-[#b9cacb]'
              }`}
            >
              Alt
            </button>

            {/* Giant Spacebar */}
            <button
              onClick={() => handleKeyTap(' ', 'space')}
              className="keycap-tactile flex-1 py-3 rounded-lg border border-[#292a2f] flex items-center justify-center text-xs font-telemetry text-[#b9cacb] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="opacity-40">Space</span>
            </button>

            {/* Arrow Cluster */}
            <button
              onClick={() => handleKeyTap('left', 'modifier')}
              className="keycap-tactile w-10 md:w-12 rounded-lg border border-[#292a2f] flex items-center justify-center text-[#e3e1e9] active:scale-[0.97] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#00f0ff]" />
            </button>
            <button
              onClick={() => handleKeyTap('down', 'modifier')}
              className="keycap-tactile w-10 md:w-12 rounded-lg border border-[#292a2f] flex items-center justify-center text-[#e3e1e9] active:scale-[0.97] transition-all cursor-pointer"
            >
              <ArrowDown className="w-4 h-4 text-[#00f0ff]" />
            </button>
            <button
              onClick={() => handleKeyTap('right', 'modifier')}
              className="keycap-tactile w-10 md:w-12 rounded-lg border border-[#292a2f] flex items-center justify-center text-[#e3e1e9] active:scale-[0.97] transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-[#00f0ff]" />
            </button>
          </div>
        </div>
      ) : (
        /* Virtual Numpad & Navigation Pad */
        <div className="grid grid-cols-4 gap-2 p-3 bg-[#12141c] border border-[#222634] rounded-2xl max-w-md mx-auto w-full shadow-xl">
          {['Home', 'End', 'PgUp', 'PgDn'].map((nav) => (
            <button
              key={nav}
              onClick={() => handleKeyTap(nav.toLowerCase(), 'modifier')}
              className="keycap-tactile py-3 rounded-lg border border-[#292a2f] font-telemetry text-xs font-semibold text-[#b9cacb] hover:text-[#00f0ff] transition-all cursor-pointer"
            >
              {nav}
            </button>
          ))}
          {['7', '8', '9', '/'].map((k) => (
            <button
              key={k}
              onClick={() => handleKeyTap(k)}
              className="keycap-tactile py-3.5 rounded-lg border border-[#292a2f] font-headline font-bold text-base text-[#e3e1e9] hover:text-[#00f0ff] transition-all cursor-pointer"
            >
              {k}
            </button>
          ))}
          {['4', '5', '6', '*'].map((k) => (
            <button
              key={k}
              onClick={() => handleKeyTap(k)}
              className="keycap-tactile py-3.5 rounded-lg border border-[#292a2f] font-headline font-bold text-base text-[#e3e1e9] hover:text-[#00f0ff] transition-all cursor-pointer"
            >
              {k}
            </button>
          ))}
          {['1', '2', '3', '-'].map((k) => (
            <button
              key={k}
              onClick={() => handleKeyTap(k)}
              className="keycap-tactile py-3.5 rounded-lg border border-[#292a2f] font-headline font-bold text-base text-[#e3e1e9] hover:text-[#00f0ff] transition-all cursor-pointer"
            >
              {k}
            </button>
          ))}
          {['0', '.', '=', '+'].map((k) => (
            <button
              key={k}
              onClick={() => handleKeyTap(k)}
              className="keycap-tactile py-3.5 rounded-lg border border-[#292a2f] font-headline font-bold text-base text-[#e3e1e9] hover:text-[#05ffa1] transition-all cursor-pointer"
            >
              {k}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
