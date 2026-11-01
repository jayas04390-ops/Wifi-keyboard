import React, { useState } from 'react';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundEffects';
import { hapticsService } from '../services/haptics';
import { CustomShortcut } from '../types';
import { 
  Command, Layers, Scissors, Copy, Clipboard, Undo, Redo, 
  Save, Printer, Search, XSquare, Plus, Trash2, Eye, ShieldAlert,
  Sparkles, Camera
} from 'lucide-react';

export const ShortcutsView: React.FC = () => {
  // Preset shortcuts
  const systemShortcuts = [
    { name: 'Show Desktop', keys: ['win', 'd'], desc: 'Minimizes all open windows', icon: Eye, color: '#00f0ff' },
    { name: 'File Explorer', keys: ['win', 'e'], desc: 'Opens Windows 11 Explorer', icon: Command, color: '#00f0ff' },
    { name: 'Lock Workstation', keys: ['win', 'l'], desc: 'Secures PC with lock screen', icon: ShieldAlert, color: '#ffb4ab' },
    { name: 'Task View', keys: ['win', 'tab'], desc: 'Virtual Desktops & Timeline', icon: Layers, color: '#00f0ff' },
    { name: 'Snipping Tool', keys: ['win', 'shift', 's'], desc: 'Take screen rectangular clip', icon: Camera, color: '#05ffa1' },
    { name: 'Task Manager', keys: ['ctrl', 'shift', 'esc'], desc: 'Process monitor & startup', icon: ShieldAlert, color: '#ffb800' },
    { name: 'Switch App', keys: ['alt', 'tab'], desc: 'Next active application window', icon: Layers, color: '#b026ff' },
    { name: 'Close Window', keys: ['alt', 'f4'], desc: 'Closes foreground application', icon: XSquare, color: '#ff2a55' },
  ];

  const editShortcuts = [
    { name: 'Copy', keys: ['ctrl', 'c'], icon: Copy },
    { name: 'Paste', keys: ['ctrl', 'v'], icon: Clipboard },
    { name: 'Cut', keys: ['ctrl', 'x'], icon: Scissors },
    { name: 'Select All', keys: ['ctrl', 'a'], icon: Command },
    { name: 'Undo', keys: ['ctrl', 'z'], icon: Undo },
    { name: 'Redo', keys: ['ctrl', 'y'], icon: Redo },
    { name: 'Save File', keys: ['ctrl', 's'], icon: Save },
    { name: 'Print', keys: ['ctrl', 'p'], icon: Printer },
    { name: 'Find / Search', keys: ['ctrl', 'f'], icon: Search },
    { name: 'Close Tab', keys: ['ctrl', 'w'], icon: XSquare },
  ];

  // User custom shortcuts
  const [customShortcuts, setCustomShortcuts] = useState<CustomShortcut[]>([
    { id: '1', name: 'Open Terminal', keys: ['win', 'x'], color: '#05ffa1' },
    { id: '2', name: 'Windows Run', keys: ['win', 'r'], color: '#00f0ff' },
    { id: '3', name: 'Emoji Picker', keys: ['win', '.'], color: '#efceff' },
  ]);

  // Modal / builder state
  const [showBuilder, setShowBuilder] = useState<boolean>(false);
  const [newShortcutName, setNewShortcutName] = useState<string>('');
  const [customKey, setCustomKey] = useState<string>('');
  const [modCtrl, setModCtrl] = useState<boolean>(true);
  const [modAlt, setModAlt] = useState<boolean>(false);
  const [modShift, setModShift] = useState<boolean>(false);
  const [modWin, setModWin] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const triggerShortcut = (keys: string[], name: string) => {
    soundService.playKeyClick('modifier');
    hapticsService.medium();
    socketService.send('SHORTCUT', { keys, name });
    setFeedbackMsg(`Executed ${keys.join(' + ').toUpperCase()}`);
    setTimeout(() => setFeedbackMsg(''), 2200);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcutName.trim() || !customKey.trim()) return;

    const keys: string[] = [];
    if (modCtrl) keys.push('ctrl');
    if (modAlt) keys.push('alt');
    if (modShift) keys.push('shift');
    if (modWin) keys.push('win');
    keys.push(customKey.trim().toLowerCase());

    const created: CustomShortcut = {
      id: Date.now().toString(),
      name: newShortcutName.trim(),
      keys,
      color: '#00f0ff',
    };

    setCustomShortcuts((prev) => [...prev, created]);
    setShowBuilder(false);
    setNewShortcutName('');
    setCustomKey('');
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomShortcuts((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-3 md:p-6 space-y-6">
      {/* Header and status */}
      <div className="flex items-center justify-between bg-[#181b26] border border-[#292a2f] rounded-xl px-4 py-3">
        <div>
          <h2 className="font-headline text-base font-semibold text-[#e3e1e9]">
            Keyboard Shortcuts & Quick Actions
          </h2>
          <p className="text-xs text-[#b9cacb]">
            One-touch macro triggers for Windows 11 system and editing functions
          </p>
        </div>

        {feedbackMsg ? (
          <span className="font-telemetry text-xs font-semibold text-[#05ffa1] bg-[#05ffa1]/10 px-3 py-1 rounded-md border border-[#05ffa1]/30 animate-pulse">
            {feedbackMsg}
          </span>
        ) : (
          <button
            onClick={() => setShowBuilder(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e1f25] border border-[#292a2f] text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Macro</span>
          </button>
        )}
      </div>

      {/* Windows 11 System Tile Grid */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-[#b9cacb] uppercase tracking-wider font-telemetry">
          Windows 11 Navigation & Power Shortcuts
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {systemShortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.name}
                onClick={() => triggerShortcut(sc.keys, sc.name)}
                className="keycap-tactile p-3.5 rounded-xl border border-[#292a2f] hover:border-[#00f0ff]/50 flex flex-col items-start text-left transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span
                    className="p-1.5 rounded-lg bg-[#12141c] border border-[#222634] group-hover:border-[#00f0ff]/40 transition-colors"
                    style={{ color: sc.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-telemetry text-[11px] font-bold text-[#b9cacb] bg-[#12141c] px-2 py-0.5 rounded border border-[#222634]">
                    {sc.keys.map((k) => k.toUpperCase()).join(' + ')}
                  </span>
                </div>
                <span className="font-headline font-semibold text-sm text-[#e3e1e9] group-hover:text-[#00f0ff] transition-colors">
                  {sc.name}
                </span>
                <span className="text-[11px] text-[#b9cacb] line-clamp-1 mt-0.5">
                  {sc.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Productivity & Editing Actions */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-[#b9cacb] uppercase tracking-wider font-telemetry">
          Productivity & Editing Combos
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {editShortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.name}
                onClick={() => triggerShortcut(sc.keys, sc.name)}
                className="keycap-tactile p-3 rounded-xl border border-[#292a2f] hover:border-[#05ffa1]/50 flex items-center gap-2.5 text-left transition-all active:scale-[0.98] cursor-pointer group"
              >
                <Icon className="w-4 h-4 text-[#b9cacb] group-hover:text-[#05ffa1] shrink-0" />
                <div className="min-w-0">
                  <div className="font-headline text-xs font-semibold text-[#e3e1e9] truncate">
                    {sc.name}
                  </div>
                  <div className="font-telemetry text-[10px] text-[#b9cacb]">
                    {sc.keys.join('+').toUpperCase()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Custom Shortcuts */}
      {customShortcuts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#b9cacb] uppercase tracking-wider font-telemetry">
              Your Custom Shortcuts
            </span>
            <span className="text-[11px] text-[#849495]">{customShortcuts.length} saved</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {customShortcuts.map((cs) => (
              <button
                key={cs.id}
                onClick={() => triggerShortcut(cs.keys, cs.name)}
                className="keycap-tactile p-3 rounded-xl border border-[#292a2f] hover:border-[#b026ff]/50 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#b026ff]" />
                  <div>
                    <div className="font-headline text-xs font-semibold text-[#e3e1e9]">
                      {cs.name}
                    </div>
                    <div className="font-telemetry text-[10px] text-[#efceff]">
                      {cs.keys.join(' + ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div
                  onClick={(e) => handleDeleteCustom(cs.id, e)}
                  title="Delete shortcut"
                  className="p-1 rounded text-[#849495] hover:text-[#ffb4ab] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Shortcut Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#181b26] border border-[#38393f] rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#292a2f]">
              <h3 className="font-headline text-base font-bold text-[#e3e1e9]">
                Create Custom Windows Shortcut
              </h3>
              <button
                onClick={() => setShowBuilder(false)}
                className="text-[#849495] hover:text-[#e3e1e9] text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#b9cacb] mb-1">
                  Shortcut Label / Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quick Screenshot or Open Slack"
                  value={newShortcutName}
                  onChange={(e) => setNewShortcutName(e.target.value)}
                  className="w-full bg-[#12141c] border border-[#292a2f] rounded-lg px-3 py-2 text-sm text-[#e3e1e9] outline-none focus:border-[#00f0ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#b9cacb] mb-2">
                  Select Modifiers:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Ctrl', val: modCtrl, set: setModCtrl },
                    { label: 'Alt', val: modAlt, set: setModAlt },
                    { label: 'Shift', val: modShift, set: setModShift },
                    { label: 'Win', val: modWin, set: setModWin },
                  ].map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => m.set(!m.val)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        m.val
                          ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                          : 'bg-[#12141c] border-[#292a2f] text-[#849495]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#b9cacb] mb-1">
                  Target Key:
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. t, k, enter, f11, del"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full bg-[#12141c] border border-[#292a2f] rounded-lg px-3 py-2 text-sm font-telemetry text-[#00f0ff] outline-none focus:border-[#00f0ff]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#1e1f25] border border-[#292a2f] text-xs font-medium text-[#b9cacb] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#00f0ff] text-[#00363a] text-xs font-headline font-bold shadow-md shadow-[#00f0ff]/20 cursor-pointer"
                >
                  Save Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
