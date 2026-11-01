import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundEffects';
import { hapticsService } from '../services/haptics';
import { 
  Send, Zap, Clock, Copy, Clipboard, Scissors, 
  CheckCheck, Trash2, FileText, ArrowRightLeft, Pause, Play 
} from 'lucide-react';

export const TextTransferView: React.FC = () => {
  const [mode, setMode] = useState<'instant' | 'char_by_char'>('instant');
  const [inputText, setInputText] = useState<string>('');
  const [typingSpeed, setTypingSpeed] = useState<number>(35); // characters per second
  const [typingProgress, setTypingProgress] = useState<number>(0);
  const [isTypingActive, setIsTypingActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const typingTimerRef = useRef<number | null>(null);
  const currentCharIndexRef = useRef<number>(0);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  // Quick preset templates
  const presets = [
    { label: 'PowerShell Ping', text: 'Test-NetConnection 192.168.1.1 -Port 80\n' },
    { label: 'Git Status', text: 'git status && git log -n 3 --oneline\n' },
    { label: 'Python One-Liner', text: 'python -c "import sys; print(sys.version)"\n' },
    { label: 'Formatted Note', text: 'Meeting Notes - Windows 11 WiFi Remote:\n1. Input Latency: < 4ms\n2. Status: Verified\n3. Ready for Production deployment.' },
  ];

  // Instant Transfer
  const handleInstantSend = () => {
    if (!inputText) return;
    soundService.playKeyClick('enter');
    hapticsService.medium();

    socketService.send('TEXT_TRANSFER', {
      mode: 'instant',
      text: inputText,
    });

    setStatusMessage(`Transferred ${inputText.length} characters instantly`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Character-by-character typing loop
  const handleCharByCharSend = () => {
    if (!inputText) return;
    if (isTypingActive) return;

    soundService.playKeyClick('modifier');
    hapticsService.light();

    setIsTypingActive(true);
    setIsPaused(false);
    currentCharIndexRef.current = 0;
    setTypingProgress(0);

    const delayMs = Math.max(10, Math.floor(1000 / typingSpeed));

    typingTimerRef.current = window.setInterval(() => {
      const idx = currentCharIndexRef.current;
      if (idx >= inputText.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTypingActive(false);
        setTypingProgress(100);
        setStatusMessage('Sequential typing finished');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      const char = inputText[idx];
      socketService.send('KEY_TAP', { key: char });
      soundService.playKeyClick('standard');
      
      currentCharIndexRef.current = idx + 1;
      setTypingProgress(Math.round(((idx + 1) / inputText.length) * 100));
    }, delayMs);
  };

  const togglePause = () => {
    if (!isTypingActive) return;
    if (isPaused) {
      // Resume
      setIsPaused(false);
      const delayMs = Math.max(10, Math.floor(1000 / typingSpeed));
      typingTimerRef.current = window.setInterval(() => {
        const idx = currentCharIndexRef.current;
        if (idx >= inputText.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          setIsTypingActive(false);
          setTypingProgress(100);
          return;
        }
        const char = inputText[idx];
        socketService.send('KEY_TAP', { key: char });
        soundService.playKeyClick('standard');
        currentCharIndexRef.current = idx + 1;
        setTypingProgress(Math.round(((idx + 1) / inputText.length) * 100));
      }, delayMs);
    } else {
      // Pause
      setIsPaused(true);
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }
  };

  const cancelTyping = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setIsTypingActive(false);
    setIsPaused(false);
    setTypingProgress(0);
    currentCharIndexRef.current = 0;
  };

  // Clipboard Operations
  const handleClipboardAction = (action: 'copy' | 'paste' | 'cut' | 'select_all') => {
    soundService.playKeyClick('mouse');
    hapticsService.light();
    socketService.send('CLIPBOARD_ACTION', { action });
    setStatusMessage(`Executed ${action.toUpperCase()} on Windows 11 host`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handlePasteFromDevice = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        setInputText((prev) => (prev ? prev + '\n' + text : text));
        soundService.playKeyClick('standard');
      }
    } catch {
      setStatusMessage('Clipboard permission denied by browser');
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-3 md:p-6 space-y-4">
      {/* Top Mode Segmented Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#181b26] border border-[#292a2f] rounded-xl p-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#12141c] rounded-lg border border-[#222634]">
          <button
            onClick={() => setMode('instant')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'instant'
                ? 'bg-[#00f0ff] text-[#00363a] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[#b9cacb] hover:text-[#e3e1e9]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Mode 1: Instant Transfer
          </button>

          <button
            onClick={() => setMode('char_by_char')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'char_by_char'
                ? 'bg-[#b026ff] text-[#fff2ff] shadow-[0_0_12px_rgba(176,38,255,0.4)]'
                : 'text-[#b9cacb] hover:text-[#e3e1e9]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Mode 2: Character-by-Character
          </button>
        </div>

        {/* Text statistics */}
        <div className="flex items-center gap-4 text-xs font-telemetry text-[#b9cacb]">
          <span>Chars: <strong className="text-[#00f0ff]">{inputText.length}</strong></span>
          <span>Words: <strong className="text-[#e3e1e9]">{inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</strong></span>
          {statusMessage && (
            <span className="text-[#05ffa1] font-medium animate-pulse">{statusMessage}</span>
          )}
        </div>
      </div>

      {/* Main Textarea Area */}
      <div className="relative flex-1 bg-[#12141c] border border-[#292a2f] rounded-2xl p-3 flex flex-col shadow-inner">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type text, code snippets, PowerShell scripts, or URLs to send to your Windows 11 host..."
          className="w-full flex-1 min-h-[220px] bg-transparent text-[#e3e1e9] font-telemetry text-sm p-2 outline-none resize-none placeholder:text-[#849495]/50"
        />

        {/* Character-by-Character Progress Bar */}
        {isTypingActive && (
          <div className="p-3 bg-[#181b26] border border-[#292a2f] rounded-xl my-2 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-telemetry">
              <span className="text-[#efceff] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#b026ff] animate-ping" />
                {isPaused ? 'Paused' : 'Simulating Live Typing...'}
              </span>
              <span className="text-[#b026ff] font-semibold">{typingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#121318] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f0ff] to-[#b026ff] transition-all duration-75"
                style={{ width: `${typingProgress}%` }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={togglePause}
                className="px-2.5 py-1 text-xs rounded bg-[#1e1f25] border border-[#38393f] text-[#e3e1e9] flex items-center gap-1 cursor-pointer"
              >
                {isPaused ? <Play className="w-3 h-3 text-[#05ffa1]" /> : <Pause className="w-3 h-3 text-[#ffb800]" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={cancelTyping}
                className="px-2.5 py-1 text-xs rounded bg-[#1e1f25] border border-[#ff2a55]/40 text-[#ffb4ab] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bottom Toolbar: Quick Presets + Clear */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#222634]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#849495] font-medium mr-1">Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setInputText(p.text)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#181b26] hover:bg-[#222634] text-[#b9cacb] hover:text-[#00f0ff] border border-[#292a2f] transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePasteFromDevice}
              title="Paste from phone clipboard"
              className="p-1.5 rounded-lg bg-[#181b26] border border-[#292a2f] text-[#b9cacb] hover:text-[#e3e1e9] transition-colors cursor-pointer"
            >
              <Clipboard className="w-4 h-4" />
            </button>
            <button
              onClick={() => setInputText('')}
              title="Clear text"
              className="p-1.5 rounded-lg bg-[#181b26] border border-[#292a2f] text-[#b9cacb] hover:text-[#ffb4ab] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Speed Slider for Mode 2 */}
      {mode === 'char_by_char' && (
        <div className="flex items-center justify-between bg-[#181b26] border border-[#292a2f] rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#b9cacb]">Typing Velocity:</span>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={typingSpeed}
              onChange={(e) => setTypingSpeed(parseInt(e.target.value, 10))}
              className="w-36 md:w-48 accent-[#b026ff] cursor-pointer"
            />
            <span className="font-telemetry text-xs font-semibold text-[#efceff]">{typingSpeed} chars/sec</span>
          </div>
          <span className="text-[11px] text-[#849495] hidden sm:inline">
            Delay: ~{Math.floor(1000 / typingSpeed)}ms per keystroke
          </span>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="flex items-center gap-3">
        {mode === 'instant' ? (
          <button
            onClick={handleInstantSend}
            disabled={!inputText.trim()}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00b4d8] text-[#00363a] font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00f0ff]/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Send to Active Windows Window (Instant)</span>
          </button>
        ) : (
          <button
            onClick={handleCharByCharSend}
            disabled={!inputText.trim() || isTypingActive}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#b026ff] to-[#7928ca] text-[#fff2ff] font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#b026ff]/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Start Character-by-Character Typing</span>
          </button>
        )}
      </div>

      {/* Windows Host Clipboard Controls Bar */}
      <div className="bg-[#181b26] border border-[#292a2f] rounded-xl p-3.5 space-y-2">
        <span className="text-xs font-semibold text-[#b9cacb] uppercase tracking-wider font-telemetry">
          Windows 11 System Clipboard Operations
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleClipboardAction('copy')}
            className="keycap-tactile py-2.5 rounded-lg border border-[#292a2f] flex items-center justify-center gap-2 text-xs font-medium text-[#e3e1e9] hover:text-[#00f0ff] transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Ctrl + C (Copy)</span>
          </button>
          <button
            onClick={() => handleClipboardAction('paste')}
            className="keycap-tactile py-2.5 rounded-lg border border-[#292a2f] flex items-center justify-center gap-2 text-xs font-medium text-[#e3e1e9] hover:text-[#05ffa1] transition-all cursor-pointer"
          >
            <Clipboard className="w-3.5 h-3.5 text-[#05ffa1]" />
            <span>Ctrl + V (Paste)</span>
          </button>
          <button
            onClick={() => handleClipboardAction('cut')}
            className="keycap-tactile py-2.5 rounded-lg border border-[#292a2f] flex items-center justify-center gap-2 text-xs font-medium text-[#e3e1e9] hover:text-[#ffb4ab] transition-all cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5 text-[#ffb4ab]" />
            <span>Ctrl + X (Cut)</span>
          </button>
          <button
            onClick={() => handleClipboardAction('select_all')}
            className="keycap-tactile py-2.5 rounded-lg border border-[#292a2f] flex items-center justify-center gap-2 text-xs font-medium text-[#e3e1e9] hover:text-[#b026ff] transition-all cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#b026ff]" />
            <span>Ctrl + A (Select All)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
