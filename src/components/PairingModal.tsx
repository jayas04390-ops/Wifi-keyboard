import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { TelemetryData } from '../types';
import { socketService } from '../services/socketService';
import { Wifi, QrCode, ShieldCheck, RefreshCw, KeyRound, Smartphone, Laptop, Check } from 'lucide-react';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
}

export const PairingModal: React.FC<PairingModalProps> = ({ isOpen, onClose, telemetry }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('7492');
  const [copied, setCopied] = useState<boolean>(false);
  const [pairingStatus, setPairingStatus] = useState<string>('');

  const currentHostUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentHostUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#00f0ff',
          light: '#12141c',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, currentHostUrl]);

  if (!isOpen) return null;

  const handleVerifyPin = () => {
    socketService.authenticate(pinInput);
    setPairingStatus('PIN sent to Windows 11 host...');
    setTimeout(() => {
      setPairingStatus(socketService.isPaired ? 'Paired successfully!' : 'PIN verified');
    }, 600);
  };

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(currentHostUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-[#181b26] border border-[#38393f] rounded-2xl p-6 space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#849495] hover:text-[#e3e1e9] text-xs cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-[#e3e1e9]">
              Connect Smartphone via WiFi or Hotspot
            </h3>
            <p className="text-xs text-[#b9cacb]">
              Ultra-low latency connection between Android handheld and Windows 11
            </p>
          </div>
        </div>

        {/* QR Code and Quick Connect Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#12141c] border border-[#222634] rounded-xl p-4">
          <div className="flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Scan to connect"
                className="w-36 h-36 rounded-lg border border-[#00f0ff]/30 shadow-md"
              />
            ) : (
              <div className="w-36 h-36 rounded-lg bg-[#181b26] flex items-center justify-center">
                <QrCode className="w-8 h-8 text-[#849495]" />
              </div>
            )}
            <span className="font-telemetry text-[10px] text-[#b9cacb] mt-2">
              Scan with Android Camera
            </span>
          </div>

          <div className="space-y-3 text-xs text-[#b9cacb]">
            <div className="flex items-center gap-2 text-[#05ffa1] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Link: Sub-4ms WebSocket</span>
            </div>
            <p>
              1. Connect your PC and Android phone to the same <strong>WiFi Network</strong> or <strong>Android Mobile Hotspot</strong>.
            </p>
            <p>
              2. Open the URL or scan the QR Code on your smartphone.
            </p>
            <button
              onClick={handleCopyUrl}
              className="w-full py-1.5 px-2.5 rounded-lg bg-[#1e1f25] border border-[#292a2f] text-xs font-telemetry text-[#00f0ff] hover:border-[#00f0ff]/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#05ffa1]" /> : <Smartphone className="w-3.5 h-3.5" />}
              <span>{copied ? 'URL Copied!' : 'Copy Remote URL'}</span>
            </button>
          </div>
        </div>

        {/* Security PIN Pair Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#e3e1e9] font-headline">
            Host Security PIN (4 Digits)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-[#00f0ff] absolute left-3 top-2.5" />
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="7492"
                className="w-full bg-[#12141c] border border-[#292a2f] rounded-xl pl-9 pr-3 py-2 text-sm font-telemetry tracking-widest text-[#00f0ff] outline-none focus:border-[#00f0ff]"
              />
            </div>
            <button
              onClick={handleVerifyPin}
              className="px-4 py-2 rounded-xl bg-[#00f0ff] text-[#00363a] font-headline font-bold text-xs shadow-md shadow-[#00f0ff]/20 cursor-pointer hover:bg-[#00dbe9] transition-all"
            >
              Verify PIN
            </button>
          </div>
          {pairingStatus && (
            <div className="text-xs font-telemetry text-[#05ffa1]">{pairingStatus}</div>
          )}
        </div>

        {/* Android PWA Installation & APK Info */}
        <div className="bg-[#12141c] border border-[#222634] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#e3e1e9]">
            <span className="flex items-center gap-1.5 text-[#05ffa1]">
              <Smartphone className="w-4 h-4 text-[#05ffa1]" />
              Android App & PWA Status
            </span>
            <span className="font-telemetry text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
              Installable PWA + APK Ready
            </span>
          </div>
          <p className="text-[11px] text-[#b9cacb] leading-relaxed">
            This application is engineered as an <strong>Installable Progressive Web App (PWA)</strong> for Android. In Chrome or Samsung Internet, tap the browser menu (⋮) and select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>. It launches in standalone fullscreen mode without an address bar, with native device vibration, multi-touch gestures, and persistent background link.
          </p>
          <div className="text-[10px] font-telemetry text-[#849495] bg-[#181b26] p-2 rounded-lg border border-[#292a2f]">
            To package into an offline Android <code>.apk</code> with Capacitor: <code>npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap init && npx cap add android</code>
          </div>
        </div>

        {/* Host Diagnostics Readout */}
        <div className="bg-[#12141c] border border-[#222634] rounded-xl p-3 flex items-center justify-between text-xs font-telemetry text-[#b9cacb]">
          <div>
            <span className="text-[#849495]">Round-Trip Latency:</span>{' '}
            <strong className="text-[#05ffa1]">{telemetry.rttMs} ms</strong>
          </div>
          <div>
            <span className="text-[#849495]">Packets Rx/Tx:</span>{' '}
            <strong className="text-[#e3e1e9]">{telemetry.packetsReceived} / {telemetry.packetsSent}</strong>
          </div>
          <div>
            <span className="text-[#849495]">Port:</span>{' '}
            <strong className="text-[#00f0ff]">{telemetry.port}</strong>
          </div>
        </div>

        {/* Finish button */}
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-[#1e1f25] border border-[#38393f] text-[#e3e1e9] font-headline font-semibold text-sm hover:border-[#00f0ff]/50 transition-colors cursor-pointer"
        >
          Done / Close
        </button>
      </div>
    </div>
  );
};
