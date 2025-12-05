import React, { useState } from 'react';
import { Upload, Film, Wand2, Scissors, Download, Play, Settings, CheckCircle, FileVideo, Layers, Zap, Activity } from 'lucide-react';

// --- CONFIGURATION ---
// ใส่ API KEY ของคุณที่นี่เมื่อนำไป deploy จริง
const CONFIG = {
  TOPAZ_API_KEY: "3f5f73b8-538e-43ff-8f77-ecb322bc4a16", 
  ECHOWAVE_API_KEY: "7247ea8228f2a094c21e42226cb12cb2d3a0b626d88bea0ccf418439d0af4cac",
  TOPAZ_ENDPOINT: "https://api.topazlabs.com/v1/video/enhance",
  ECHOWAVE_ENDPOINT: "https://api.echowave.io/v1/render"
};

// --- COMPONENTS ---
const FORMATS = ['MP4', 'MKV', 'AVI', 'TS', 'WEBM', 'M3U8'];

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", disabled = false, icon: Icon, className = "" }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export default function App() {
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState('enhance');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const [outputFormat, setOutputFormat] = useState('MP4');

  // AI Settings
  const [aiModel, setAiModel] = useState('auto');
  const [upscaleFactor, setUpscaleFactor] = useState(2);

  // Edit Settings
  const [editTool, setEditTool] = useState('compress');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target?.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResultUrl(null);
      setProgress(0);
      setStatusMessage('File loaded successfully');
    }
  };

  const simulateProcessing = () => {
    setProcessing(true);
    setProgress(0);
    setResultUrl(null);

    const steps = activeTab === 'enhance' 
      ? ['Analyzing Video Frames...', 'Applying Topaz AI Model...', 'Upscaling Resolution...', 'Encoding Output...']
      : ['Parsing Video...', 'Applying Edit Operations...', 'Rendering with FFMPEG...', 'Finalizing...'];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessing(false);
          setResultUrl("mock_url");
          setStatusMessage("Processing Complete!");
          return 100;
        }
        if (prev % 25 === 0 && currentStep < steps.length) {
          setStatusMessage(steps[currentStep]);
          currentStep++;
        }
        return prev + 1;
      });
    }, 50); 
  };

  const handleProcess = () => {
    if (!file) return;
    console.log(`Processing with ${activeTab} mode.`);
    simulateProcessing();
  };

  const renderEnhanceControls = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Wand2 size={16} className="text-blue-400" />
          AI Model Selection (Topaz Engine)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'auto', label: 'Auto Enhance', desc: 'General improvement' },
            { id: 'upscale', label: 'AI Upscale', desc: 'Increase resolution' },
            { id: 'clear', label: 'Video Clear', desc: 'Denoise & De-block' },
            { id: 'unblur', label: 'Motion Unblur', desc: 'Sharpen movement' },
            { id: 'optical', label: 'Optical Flow', desc: 'Smoother FPS' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setAiModel(mode.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                aiModel === mode.id 
                  ? 'bg-blue-600/20 border-blue-500 text-white' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <div className="font-medium">{mode.label}</div>
              <div className="text-xs opacity-70">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {aiModel === 'upscale' && (
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-300">Upscale Factor (x{upscaleFactor})</label>
           <input 
             type="range" min="1" max="4" step="1" 
             value={upscaleFactor}
             onChange={(e) => setUpscaleFactor(e.target.value)}
             className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
           />
           <div className="flex justify-between text-xs text-slate-500">
             <span>Original</span>
             <span>2x (HD)</span>
             <span>4x (4K)</span>
           </div>
        </div>
      )}
    </div>
  );

  const renderToolControls = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Scissors size={16} className="text-emerald-400" />
          Editing Tools (Echowave Engine)
        </label>
        <div className="flex flex-wrap gap-2">
          {['compress', 'trim', 'split'].map((tool) => (
            <button
              key={tool}
              onClick={() => setEditTool(tool)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize border transition-all ${
                editTool === tool
                  ? 'bg-emerald-600/20 border-emerald-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'
              }`}
            >
              {tool} Video
            </button>
          ))}
        </div>
      </div>

      {editTool === 'trim' && (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Start: {trimStart}s</span>
            <span>End: {trimEnd}s</span>
          </div>
          <div className="flex gap-4">
             <div className="flex-1">
               <label className="text-xs text-slate-500">Start Time</label>
               <input 
                 type="number" value={trimStart} onChange={(e) => setTrimStart(e.target.value)}
                 className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
               />
             </div>
             <div className="flex-1">
               <label className="text-xs text-slate-500">End Time</label>
               <input 
                 type="number" value={trimEnd} onChange={(e) => setTrimEnd(e.target.value)}
                 className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
               />
             </div>
          </div>
        </div>
      )}
      
      {editTool === 'compress' && (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">
            Compress video file size while maintaining quality using H.264 optimization.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center">
              <Film className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              AI Video Studio
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1"><Zap size={12} /> TOPAZ ENGINE</span>
            <span className="h-4 w-[1px] bg-slate-700"></span>
            <span className="flex items-center gap-1"><Layers size={12} /> ECHOWAVE API</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* HERO / UPLOAD SECTION */}
        <section className={`${file ? 'h-auto' : 'h-[60vh]'} transition-all duration-500`}>
          {!file ? (
            <div 
              className="h-full border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer group"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input id="file-upload" type="file" className="hidden" accept=".mp4,.avi,.mkv,.ts,.m3u8,.webm" onChange={handleFileDrop} />
              <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                <Upload size={32} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Upload Video File</h2>
              <p className="text-slate-400 mb-6 text-center max-w-md">
                Drag & drop or click to browse. Supports MP4, AVI, MKV, TS, WEBM.
              </p>
              <div className="flex gap-2 text-xs text-slate-500 font-mono uppercase tracking-wider">
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">Topaz AI</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">FFMPEG</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="aspect-video bg-black relative flex items-center justify-center group">
                 <FileVideo size={64} className="text-slate-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white truncate">{file.name}</h3>
                    <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Video File'}</p>
                 </div>
                 <button onClick={() => setFile(null)} className="absolute top-4 right-4 bg-black/50 hover:bg-red-500/80 p-2 rounded-full backdrop-blur-sm transition-colors text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
            </div>
          )}
        </section>

        {file && (
          <div className="grid lg:grid-cols-3 gap-8 animate-slideUp">
            
            {/* LEFT: CONTROLS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-slate-800 rounded-xl w-fit border border-slate-700">
                <button
                  onClick={() => setActiveTab('enhance')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'enhance' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wand2 size={16} /> AI Enhance
                </button>
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'tools' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scissors size={16} /> Tools
                </button>
              </div>

              {/* Control Panel */}
              <Card>
                {activeTab === 'enhance' ? renderEnhanceControls() : renderToolControls()}

                <div className="mt-8 pt-6 border-t border-slate-700">
                  <div className="flex items-end gap-4 mb-4">
                     <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Output Format</label>
                        <select 
                          value={outputFormat} 
                          onChange={(e) => setOutputFormat(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                     </div>
                  </div>

                  <Button 
                    onClick={handleProcess} 
                    disabled={processing} 
                    variant={activeTab === 'enhance' ? 'primary' : 'success'}
                    className="w-full py-4 text-lg"
                    icon={processing ? Activity : Play}
                  >
                    {processing ? 'Processing...' : `Start ${activeTab === 'enhance' ? 'Enhancement' : 'Editing'}`}
                  </Button>
                </div>
              </Card>
            </div>

            {/* RIGHT: STATUS & LOGS */}
            <div className="space-y-6">
               <Card className="h-full bg-slate-900/50 border-dashed">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Processing Status</h4>
                 
                 {processing || resultUrl ? (
                   <div className="space-y-6">
                     {/* Progress Circle */}
                     <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                          <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            className={`${resultUrl ? 'text-green-500' : 'text-blue-500'} transition-all duration-300`}
                            strokeDasharray={377}
                            strokeDashoffset={377 - (377 * progress) / 100}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-white">{progress}%</span>
                        </div>
                     </div>

                     <div className="text-center">
                        <p className={`text-sm font-medium ${resultUrl ? 'text-green-400' : 'text-blue-400'} animate-pulse`}>
                          {statusMessage}
                        </p>
                        <p className="text-xs text-slate-600 mt-2">Using {activeTab === 'enhance' ? 'Topaz Labs' : 'Echowave'} API</p>
                     </div>

                     {resultUrl && (
                        <div className="pt-6 animate-fadeIn">
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3 mb-4">
                            <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                            <div>
                              <h5 className="font-semibold text-green-400 text-sm">Processing Complete</h5>
                              <p className="text-xs text-green-300/70 mt-1">Video has been optimized and converted to {outputFormat}.</p>
                            </div>
                          </div>
                          <Button variant="secondary" className="w-full" icon={Download}>
                            Download Result
                          </Button>
                        </div>
                     )}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                     <Settings size={48} />
                     <p className="text-sm text-center">Ready to process.<br/>Configure settings and click Start.</p>
                   </div>
                 )}
               </Card>
            </div>

          </div>
        )}
      </main>
      
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-600 text-xs border-t border-slate-800 mt-12">
        <p>© 2024 AI Video Studio. Powered by Topaz Labs & Echowave APIs.</p>
      </footer>
    </div>
  );
}
