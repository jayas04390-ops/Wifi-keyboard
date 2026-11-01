import React, { useState, useEffect } from 'react';
import { 
  Code2, Copy, Check, Terminal, FolderTree, 
  FileCode, ShieldCheck, Download, ChevronRight, Play 
} from 'lucide-react';

interface AgentFile {
  path: string;
  name: string;
  content: string;
}

export const PythonAgentModal: React.FC = () => {
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('server.py');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/python-agent-files')
      .then((res) => res.json())
      .then((data) => {
        if (data.files && data.files.length > 0) {
          setFiles(data.files);
          setSelectedFilePath(data.files[0].path);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const currentFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const handleCopyCode = () => {
    if (!currentFile) return;
    navigator.clipboard?.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (file: AgentFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-3 md:p-6 space-y-4">
      {/* Header Banner */}
      <div className="bg-[#181b26] border border-[#292a2f] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#05ffa1]/15 border border-[#05ffa1]/40 flex items-center justify-center text-[#05ffa1] shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline text-base font-bold text-[#e3e1e9]">
              Windows 11 Native Python Desktop Agent
            </h2>
            <p className="text-xs text-[#b9cacb]">
              Complete, production-ready Python backend integrating pynput, ctypes SendInput, and Flask-SocketIO
            </p>
          </div>
        </div>

        {/* Quick run command preview */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#12141c] border border-[#222634] rounded-lg text-xs font-telemetry text-[#05ffa1] flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>python server.py</span>
          </div>
          <button
            onClick={() => currentFile && downloadFile(currentFile)}
            className="px-3 py-1.5 rounded-lg bg-[#1e1f25] border border-[#292a2f] text-xs font-medium text-[#e3e1e9] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Main Code & Architecture Explorer */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[500px]">
        {/* Left Sidebar: File Tree */}
        <div className="md:col-span-4 bg-[#12141c] border border-[#222634] rounded-2xl p-3 flex flex-col space-y-3 shadow-inner">
          <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-[#b9cacb] uppercase tracking-wider font-telemetry border-b border-[#222634]">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-[#00f0ff]" />
              SmartWiFiKeyboard Agent
            </span>
            <span className="text-[10px] text-[#849495]">{files.length} files</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFilePath(file.path)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-telemetry flex items-center justify-between transition-all cursor-pointer ${
                  selectedFilePath === file.path
                    ? 'bg-[#00f0ff]/15 border border-[#00f0ff]/50 text-[#dbfcff] font-semibold'
                    : 'text-[#b9cacb] hover:bg-[#181b26] hover:text-[#e3e1e9]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${file.path.endsWith('.py') ? 'text-[#05ffa1]' : 'text-[#849495]'}`} />
                  <span className="truncate">{file.path}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
              </button>
            ))}
          </div>

          {/* Setup Guide Box */}
          <div className="p-3 bg-[#181b26] border border-[#292a2f] rounded-xl text-[11px] text-[#b9cacb] space-y-1.5">
            <div className="font-semibold text-[#e3e1e9] flex items-center gap-1.5">
              <Play className="w-3 h-3 text-[#05ffa1]" />
              Windows 11 Setup Steps
            </div>
            <p className="font-telemetry text-[10px] text-[#849495]">1. pip install -r requirements.txt</p>
            <p className="font-telemetry text-[10px] text-[#849495]">2. python server.py</p>
            <p className="font-telemetry text-[10px] text-[#849495]">3. Enter PIN 7492 on phone</p>
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="md:col-span-8 bg-[#12141c] border border-[#222634] rounded-2xl flex flex-col overflow-hidden shadow-inner">
          {/* Code Viewer Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#181b26] border-b border-[#292a2f]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#00f0ff]" />
              <span className="font-telemetry text-xs font-bold text-[#e3e1e9]">
                {currentFile ? currentFile.path : 'Loading...'}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1 rounded-lg bg-[#1e1f25] border border-[#292a2f] text-xs font-medium text-[#b9cacb] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#05ffa1]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#0d0e13]">
            <pre className="font-telemetry text-xs text-[#e3e1e9] leading-relaxed whitespace-pre-wrap selection:bg-[#00f0ff]/30">
              {currentFile?.content || 'No file selected'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
