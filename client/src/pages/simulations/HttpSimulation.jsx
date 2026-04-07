import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const HTTP_QUIZ = [
  { q: 'HTTP primarily uses which transport protocol and default port?', options: ['TCP port 80', 'TCP port 443', 'UDP port 53', 'UDP port 80'], answer: 0, difficulty: 'easy' },
  { q: 'HTTPS (Secure HTTP) uses which port by default?', options: ['80', '443', '21', '22'], answer: 1, difficulty: 'easy' },
  { q: 'Which HTTP method is designed to retrieve data without modifying the server state?', options: ['POST', 'PUT', 'GET', 'DELETE'], answer: 2, difficulty: 'easy' },
  { q: 'Which HTTP method is typically used to create a new resource on the server?', options: ['GET', 'POST', 'PATCH', 'HEAD'], answer: 1, difficulty: 'medium' },
  { q: 'What does an HTTP 404 status code mean?', options: ['Internal Server Error', 'Unauthorized', 'Not Found', 'OK'], answer: 2, difficulty: 'easy' },
  { q: 'HTTP 500-level status codes indicate an error on the...', options: ['Client-side', 'Network router', 'Server-side', 'DNS resolver'], answer: 2, difficulty: 'medium' },
  { q: 'Which HTTP header is typically used to send credentials (like a bearer token) to the server?', options: ['Content-Type', 'Authorization', 'User-Agent', 'Accept'], answer: 1, difficulty: 'medium' },
  { q: 'An HTTP status code of 301 indicates...', options: ['Moved Permanently (Redirect)', 'Created', 'Forbidden', 'Bad Request'], answer: 0, difficulty: 'hard' },
  { q: 'Is the HTTP protocol inherently stateful or stateless?', options: ['Stateful', 'Stateless (each request is independent)', 'Stateful only over HTTPS', 'It depends on the port'], answer: 1, difficulty: 'medium' },
  { q: 'What mechanism is commonly used to maintain state (like a logged-in user) over stateless HTTP?', options: ['TCP Keep-Alive', 'Cookies / Session Tokens', 'MAC Addresses', 'IPsec'], answer: 1, difficulty: 'hard' },
];

const METHODS = ['GET', 'POST', 'DELETE'];
const STATUS_CODES = { GET: { code: 200, text: 'OK' }, POST: { code: 201, text: 'Created' }, DELETE: { code: 204, text: 'No Content' } };

export default function HttpSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [method, setMethod] = useState('GET');
  const [phase, setPhase] = useState(0); // 0=idle, 1=dns, 2=tcp, 3=request, 4=response, 5=done
  const [log, setLog] = useState([]);
  const [tab, setTab] = useState('learn');
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setPhase(prev => {
      const next = prev + 1;
      const time = new Date().toLocaleTimeString();
      if (next === 1) setLog(l => [...l, { time, msg: 'DNS Lookup for kinetic.net ... SUCCESS', color: 'text-tertiary' }]);
      else if (next === 2) setLog(l => [...l, { time, msg: 'TCP Three-Way Handshake ... ESTABLISHED', color: 'text-tertiary' }]);
      else if (next === 3) setLog(l => [...l, { time, msg: `Sending HTTP ${method} /api/v1/network/status`, color: 'text-primary' }]);
      else if (next === 4) setLog(l => [...l, { time, msg: `Server Response: ${STATUS_CODES[method].code} ${STATUS_CODES[method].text}`, color: 'text-tertiary' }]);
      else if (next >= 5) { setIsPlaying(false); return 5; }
      return next;
    });
  }, [method]);

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 2000 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setPhase(0); setLog([]); clearInterval(intervalRef.current); };
  const manualStep = () => { setIsPlaying(false); step(); };
  const sendRequest = () => { reset(); setTimeout(() => setIsPlaying(true), 100); };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="p-12 pb-6">
        <h1 className="text-[3.5rem] font-black font-headline text-on-background leading-none tracking-tighter mb-2">HTTP Request-Response</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-surface-container-highest text-primary text-[0.7rem] font-bold uppercase tracking-[0.2em] rounded border border-outline-variant/20">Lab ID: APP-042</span>
          <span className="text-on-surface-variant text-xs font-medium">Topic: Application Layer • Ports 80/443</span>
        </div>
      </section>

      <div className="flex-1 grid grid-cols-12 gap-6 p-12 pt-0">
        <div className="col-span-8 flex flex-col gap-6">
          {/* Main Stage */}
          <div className="relative bg-surface-container rounded-xl overflow-hidden min-h-[400px] border border-outline-variant/10 shadow-2xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #7bd0ff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Client */}
            <div className="absolute left-20 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
              <div className={`w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-lg border transition-colors ${phase >= 3 ? 'border-primary/40' : 'border-primary/10'}`}>
                <span className="material-symbols-outlined text-4xl text-primary">laptop_mac</span>
              </div>
              <div className="text-center">
                <p className="font-headline font-bold text-sm tracking-tight text-white">Client Browser</p>
                <p className="font-mono text-[10px] text-on-surface-variant">192.168.1.104</p>
              </div>
            </div>

            {/* Connection line */}
            <div className="absolute top-1/2 left-[20%] right-[20%] h-px">
              <div className={`w-full h-px transition-all duration-500 ${phase >= 2 ? 'bg-primary/40' : 'bg-surface-container-highest'}`} />
            </div>

            {/* Animated Packet */}
            {phase >= 3 && phase < 5 && (
              <div className="absolute top-[42%] z-10 transition-all duration-1000" style={{ left: phase === 3 ? '30%' : phase === 4 ? '60%' : '45%' }}>
                <div className="px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/40 rounded shadow-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm">mail</span>
                  <span className="font-mono text-[10px] font-bold text-primary">
                    {phase === 3 ? `HTTP ${method} /index.html` : `${STATUS_CODES[method].code} ${STATUS_CODES[method].text}`}
                  </span>
                </div>
              </div>
            )}

            {/* Server */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-lg border border-tertiary/10">
                <div className="absolute -top-3 -right-3 px-2 py-1 bg-surface-container-highest rounded text-[10px] font-mono text-tertiary border border-tertiary/30">PORT 443</div>
                <span className="material-symbols-outlined text-4xl text-tertiary">dns</span>
              </div>
              <div className="text-center">
                <p className="font-headline font-bold text-sm tracking-tight text-white">Application Server</p>
                <p className="font-mono text-[10px] text-on-surface-variant">104.22.1.201</p>
              </div>
            </div>

            {phase >= 5 && (
              <div className="absolute bottom-6 right-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_10px_rgba(74,225,118,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-on-surface-variant">Transfer Complete</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="glass-panel p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between shadow-xl">
            <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
            <div className="flex items-center gap-4">
              <select value={method} onChange={e => { setMethod(e.target.value); reset(); }} className="bg-surface-container-highest border-none text-xs font-bold font-headline uppercase tracking-tight py-2 px-4 rounded-lg text-white">
                {METHODS.map(m => <option key={m}>HTTP {m} Request</option>)}
              </select>
              <button onClick={sendRequest} className="px-6 py-2 bg-gradient-to-r from-primary to-on-primary-container text-on-primary-fixed font-black text-xs uppercase tracking-[0.1em] rounded-lg shadow-lg active:scale-95 transition-all">
                Send Request
              </button>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="col-span-4 flex flex-col gap-5">
          <div className="flex bg-surface-container-highest rounded-xl overflow-hidden shrink-0 mt-0">
            <button onClick={() => setTab('learn')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 ${tab === 'learn' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">school</span> Learn
            </button>
            <button onClick={() => setTab('quiz')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 ${tab === 'quiz' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">quiz</span> Self-Test
            </button>
          </div>
          {tab === 'learn' && (
            <>
              <div className="bg-surface-container-low rounded-xl flex flex-col h-[280px] border border-outline-variant/5">
                <div className="p-4 bg-surface-container flex items-center justify-between rounded-t-xl border-b border-outline-variant/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Packet Inspector</span>
                </div>
                <div className="p-5 flex-1 overflow-y-auto font-mono text-[11px] space-y-4">
                  <div className="space-y-1">
                    <p className="text-on-surface-variant uppercase font-bold text-[9px] tracking-widest mb-2">Request Headers</p>
                    {[['Method', method], ['Path', '/api/v1/network/status'], ['Host', 'kinetic.net'], ['Accept', 'application/json']].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1 border-b border-outline-variant/5">
                        <span className="text-primary/70">{k}:</span>
                        <span className="text-on-surface">{v}</span>
                      </div>
                    ))}
                  </div>
                  {phase >= 4 && (
                    <div className="space-y-1 pt-4 border-t border-white/5">
                      <p className="text-on-surface-variant uppercase font-bold text-[9px] tracking-widest mb-2">Response</p>
                      <div className="flex justify-between py-1">
                        <span className="text-tertiary/70">Status:</span>
                        <span className="text-tertiary font-bold">{STATUS_CODES[method].code} {STATUS_CODES[method].text}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 flex-1">
                <h3 className="font-headline font-bold text-base text-white uppercase tracking-widest text-xs mb-4">Architecture</h3>
                <div className="space-y-4 text-xs leading-relaxed text-on-surface-variant">
                  <div className="p-4 bg-surface-container-low rounded-lg space-y-3">
                    {[['HTTP', 'Unencrypted transfer on port 80.', 'public', 'text-tertiary'], ['HTTPS', 'TLS encrypted on port 443.', 'lock', 'text-primary']].map(([title, desc, icon, color]) => (
                      <div key={title} className="flex items-start gap-3">
                        <span className={`material-symbols-outlined ${color} text-sm mt-0.5`}>{icon}</span>
                        <div><p className="text-white font-bold mb-0.5">{title}</p><p className="text-[10px]">{desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {tab === 'quiz' && <QuizPanel title="HTTP/HTTPS Quiz" questions={HTTP_QUIZ} />}
        </div>
      </div>

      {/* Log Footer */}
      <footer className="mt-auto bg-surface-container-lowest border-t border-outline-variant/10 p-4">
        <div className="max-w-[1400px] mx-auto flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded text-[10px] font-black uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-[12px]">terminal</span> Log
          </div>
          <div className="flex-1 font-mono text-[10px] text-on-surface-variant flex gap-8">
            {log.slice(-3).map((entry, i) => (
              <div key={i} className="flex gap-2">
                <span className={entry.color}>[{entry.time}]</span>
                <span>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
