import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const ICMP_QUIZ = [
  { q: 'ICMP stands for...', options: ['Internet Control Message Protocol', 'Internal Connection Management Protocol', 'IP Communication Module', 'Internet Cache Method'], answer: 0, difficulty: 'easy' },
  { q: 'The standard "ping" command uses which ICMP message types?', options: ['Type 3 and 11', 'Type 8 (Echo Request) and Type 0 (Echo Reply)', 'Type 1 and 2', 'Type 5 and 6'], answer: 1, difficulty: 'medium' },
  { q: 'What does the IP TTL (Time To Live) field prevent?', options: ['Data corruption', 'Packets looping infinitely in the network', 'DNS spoofing', 'Password theft'], answer: 1, difficulty: 'easy' },
  { q: 'What network tool creatively uses ICMP and TTL expiration to map a network path?', options: ['nslookup', 'traceroute / tracert', 'netstat', 'ifconfig'], answer: 1, difficulty: 'medium' },
  { q: 'ICMP is considered to operate at which OSI layer?', options: ['Transport (L4)', 'Network (L3)', 'Data Link (L2)', 'Application (L7)'], answer: 1, difficulty: 'easy' },
  { q: 'If a router doesn\'t know how to reach a destination, what ICMP message does it send back?', options: ['Type 0 (Echo Reply)', 'Type 11 (Time Exceeded)', 'Type 3 (Destination Unreachable)', 'Type 8 (Echo Request)'], answer: 2, difficulty: 'hard' },
  { q: 'When a router drops a packet because the TTL hits 0, what ICMP message is sent back?', options: ['Destination Unreachable', 'Time Exceeded', 'Echo Reply', 'Source Quench'], answer: 1, difficulty: 'hard' },
  { q: 'Does ICMP use TCP or UDP for transport?', options: ['TCP', 'UDP', 'Neither, it is encapsulated directly in an IP packet', 'Both'], answer: 2, difficulty: 'hard' },
  { q: 'What does "RTT" stand for in a ping response?', options: ['Router Time To', 'Round Trip Time', 'Remote Terminal Test', 'Routing Table Transfer'], answer: 1, difficulty: 'easy' },
  { q: 'An ICMP Redirect message is used to...', options: ['Inform a host of a better first-hop router for a destination', 'Block an IP address', 'Ping multiple hosts', 'Change a MAC address'], answer: 0, difficulty: 'medium' },
];

export default function IcmpSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [pings, setPings] = useState([]);
  const [destIp, setDestIp] = useState('192.168.1.2');
  const [ttl, setTtl] = useState(64);
  const [pingCount, setPingCount] = useState(0);
  const [tab, setTab] = useState('learn');
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setPingCount(prev => {
      if (prev >= 4) { setIsPlaying(false); return prev; }
      const rtt = (Math.random() * 3 + 0.5).toFixed(2);
      const currentTtl = ttl - Math.floor(Math.random() * 3);
      setPings(p => [...p, { seq: prev + 1, rtt, ttl: currentTtl, bytes: 32, status: 'success' }]);
      return prev + 1;
    });
  }, [ttl]);

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 1500 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setPings([]); setPingCount(0); clearInterval(intervalRef.current); };
  const manualStep = () => { setIsPlaying(false); step(); };
  const avgRtt = pings.length ? (pings.reduce((s, p) => s + parseFloat(p.rtt), 0) / pings.length).toFixed(2) : '0.00';

  return (
    <div className="p-12 min-h-[calc(100vh-4rem)]">
      <h1 className="text-6xl font-black font-headline tracking-tighter text-white mb-2">ICMP (Ping)</h1>
      <p className="text-on-secondary-container text-lg max-w-2xl mb-8">Simulate Echo Request/Reply to test network connectivity with TTL and round-trip timing.</p>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="relative bg-surface-container rounded-xl overflow-hidden h-[400px] p-12 flex items-center justify-between">
            <div className="flex flex-col items-center gap-4 z-10">
              <div className="w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-lg border border-primary/10">
                <span className="material-symbols-outlined text-4xl text-primary">computer</span>
              </div>
              <span className="text-[10px] font-bold text-primary uppercase">Source</span>
              <span className="font-mono text-[10px] text-slate-400">192.168.1.1</span>
            </div>

            <div className="flex-1 mx-8 relative">
              <div className="h-px bg-gradient-to-r from-primary/30 to-tertiary/30" />
              {isPlaying && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/20 border border-primary/40 px-4 py-2 rounded-lg animate-pulse">
                  <span className="text-primary text-[10px] font-bold font-mono">ECHO REQUEST → {destIp}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 z-10">
              <div className="w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-lg border border-tertiary/10">
                <span className="material-symbols-outlined text-4xl text-tertiary">computer</span>
              </div>
              <span className="text-[10px] font-bold text-tertiary uppercase">Target</span>
              <span className="font-mono text-[10px] text-slate-400">{destIp}</span>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
            </div>
          </div>

          {/* Terminal Output */}
          <div className="mt-6 bg-surface-container-lowest rounded-xl p-6 border border-white/5">
            <p className="font-mono text-xs text-slate-400 mb-4">$ ping {destIp}</p>
            <div className="space-y-1 font-mono text-xs max-h-40 overflow-y-auto">
              {pings.map((p, i) => (
                <p key={i} className="text-on-secondary-container">
                  Reply from <span className="text-primary">{destIp}</span>: bytes=<span className="text-white">{p.bytes}</span> time=<span className="text-tertiary">{p.rtt}ms</span> TTL=<span className="text-white">{p.ttl}</span>
                </p>
              ))}
              {pingCount >= 4 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-slate-400">--- {destIp} ping statistics ---</p>
                  <p className="text-white">4 packets transmitted, 4 received, <span className="text-tertiary">0% packet loss</span></p>
                  <p className="text-white">avg RTT = <span className="text-tertiary">{avgRtt}ms</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-5">
          <div className="flex bg-surface-container-highest rounded-xl overflow-hidden">
            <button onClick={() => setTab('learn')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 ${tab === 'learn' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">school</span> Learn
            </button>
            <button onClick={() => setTab('quiz')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 ${tab === 'quiz' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">quiz</span> Self-Test
            </button>
          </div>
          {tab === 'learn' && (
            <>
              <div className="bg-surface-container-low p-6 rounded-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5 block font-bold">Target IP</label>
                    <input value={destIp} onChange={e => { setDestIp(e.target.value); reset(); }} className="w-full bg-surface-container-lowest border-none text-sm py-3 px-4 font-mono text-white focus:ring-1 focus:ring-primary rounded" />
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5 block font-bold">Initial TTL</label>
                    <input type="number" value={ttl} onChange={e => setTtl(parseInt(e.target.value))} className="w-full bg-surface-container-lowest border-none text-sm py-3 px-4 font-mono text-white focus:ring-1 focus:ring-primary rounded" />
                  </div>
                </div>
              </div>
              <div className="bg-surface-container p-6 rounded-xl border border-white/5">
                <h3 className="font-headline font-bold text-on-surface mb-3">ICMP Protocol</h3>
                <p className="text-sm text-on-secondary-container leading-relaxed">ICMP is used for diagnostic and error reporting. <code className="text-primary">ping</code> sends Echo Requests and measures round-trip time.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['Packets', `${pings.length}/4`], ['Avg RTT', `${avgRtt}ms`], ['Loss', '0%'], ['TTL', String(ttl)]].map(([label, val]) => (
                  <div key={label} className="bg-surface-container-lowest p-4 rounded-lg">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">{label}</p>
                    <p className="text-lg font-bold text-on-surface">{val}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === 'quiz' && <QuizPanel title="ICMP Quiz" questions={ICMP_QUIZ} />}
        </div>
      </div>
    </div>
  );
}
