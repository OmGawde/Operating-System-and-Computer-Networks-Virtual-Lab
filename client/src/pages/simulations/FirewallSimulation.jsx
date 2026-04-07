import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const FW_QUIZ = [
  { q: 'Firewalls inspect packets based on...', options: ['Only source IP', 'Rules matching source, destination, port, and protocol', 'Only the payload content', 'Time of day only'], answer: 1, difficulty: 'easy' },
  { q: 'What is the default policy if no rule matches in a typical enterprise firewall?', options: ['Allow all', 'Deny all (implicit deny)', 'Ask user', 'Forward back to sender'], answer: 1, difficulty: 'easy' },
  { q: 'Which firewall type tracks the state of active network connections?', options: ['Packet filter', 'Stateful firewall', 'Proxy firewall', 'NAT'], answer: 1, difficulty: 'medium' },
  { q: 'What does ACL stand for?', options: ['Access Control List', 'Active Connection Log', 'Automatic Control Layer', 'Address Cache List'], answer: 0, difficulty: 'easy' },
  { q: 'Port 443 is used for...', options: ['HTTP', 'HTTPS', 'FTP', 'SSH'], answer: 1, difficulty: 'easy' },
  { q: 'A "Stateless" firewall makes decisions based on...', options: ['The full TCP handshake', 'Previous packets in the stream', 'Individual packet headers only (isolated from context)', 'User identity'], answer: 2, difficulty: 'medium' },
  { q: 'What is the purpose of a DMZ (Demilitarized Zone) in firewall architecture?', options: ['To block all traffic automatically', 'To host public-facing servers securely away from the internal network', 'To speed up internet access', 'To encrypt traffic'], answer: 1, difficulty: 'medium' },
  { q: 'Which firewall operates up at OSI Layer 7, understanding web traffic and app behavior?', options: ['Packet Filtering Firewall', 'Circuit-Level Gateway', 'Next-Generation Firewall (NGFW) / WAF', 'Hardware Firewall'], answer: 2, difficulty: 'hard' },
  { q: 'If a firewall rule says "Deny TCP Any Any Eq 22", what is being blocked?', options: ['Web traffic', 'Email', 'SSH', 'Ping'], answer: 2, difficulty: 'hard' },
  { q: 'In firewall rule processing, rules are typically evaluated...', options: ['Top to bottom (first match wins)', 'Bottom to top', 'Randomly', 'Most restrictive first automatically'], answer: 0, difficulty: 'medium' },
];

const DEFAULT_RULES = [
  { id: 1, action: 'allow', src: '192.168.1.0/24', port: 443, proto: 'TCP', label: 'HTTPS Traffic' },
  { id: 2, action: 'deny', src: 'Any', port: 21, proto: 'TCP', label: 'FTP Blocked' },
  { id: 3, action: 'allow', src: 'Any', port: 0, proto: 'ICMP', label: 'Ping Allowed' },
  { id: 4, action: 'deny', src: '10.0.0.0/8', port: 22, proto: 'TCP', label: 'SSH from 10.x Blocked' },
];

const TEST_PACKETS = [
  { src: '192.168.1.50', dst: 'Server', port: 443, proto: 'TCP', label: 'HTTPS Request' },
  { src: '192.168.1.50', dst: 'Server', port: 21, proto: 'TCP', label: 'FTP Upload' },
  { src: '10.0.0.5', dst: 'Server', port: 22, proto: 'TCP', label: 'SSH Login' },
  { src: '172.16.0.1', dst: 'Server', port: 80, proto: 'TCP', label: 'HTTP Request' },
  { src: '192.168.1.10', dst: 'Server', port: 0, proto: 'ICMP', label: 'Ping' },
];

function checkPacket(packet, rules) {
  for (const rule of rules) {
    const portMatch = rule.port === 0 || rule.port === packet.port;
    const protoMatch = rule.proto === packet.proto;
    const srcMatch = rule.src === 'Any' || packet.src.startsWith(rule.src.split('/')[0].split('.').slice(0, 2).join('.'));
    if (portMatch && protoMatch && srcMatch) return { rule, result: rule.action };
  }
  return { rule: null, result: 'deny' }; // Default deny
}

export default function FirewallSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [rules] = useState(DEFAULT_RULES);
  const [packetIndex, setPacketIndex] = useState(-1);
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState('learn');
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setPacketIndex(prev => {
      if (prev >= TEST_PACKETS.length - 1) { setIsPlaying(false); return prev; }
      const nextIndex = prev + 1;
      const pkt = TEST_PACKETS[nextIndex];
      const { rule, result } = checkPacket(pkt, rules);
      setResults(r => [...r, { packet: pkt, result, matchedRule: rule }]);
      return nextIndex;
    });
  }, [rules]);

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 2000 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setPacketIndex(-1); setResults([]); clearInterval(intervalRef.current); };
  const manualStep = () => { setIsPlaying(false); step(); };
  const allowed = results.filter(r => r.result === 'allow').length;
  const denied = results.filter(r => r.result === 'deny').length;

  return (
    <div className="p-12 min-h-[calc(100vh-4rem)]">
      <h1 className="text-6xl font-black font-headline tracking-tighter text-white mb-2">Firewall Rules</h1>
      <p className="text-on-secondary-container text-lg max-w-2xl mb-8">Configure ACL rules and watch packets get inspected, allowed, or denied.</p>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          {/* Packet Flow */}
          <div className="relative bg-surface-container rounded-xl overflow-hidden min-h-[350px] p-8 flex items-center justify-between">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-lg border border-primary/10">
                <span className="material-symbols-outlined text-3xl text-primary">public</span>
              </div>
              <span className="text-[10px] font-bold text-primary uppercase">Internet</span>
            </div>

            {/* Firewall */}
            <div className="flex flex-col items-center gap-3 mx-8">
              <div className={`w-24 h-32 rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 transition-all ${packetIndex >= 0 ? 'bg-error/10 border-error/40 animate-pulse' : 'bg-surface-container-high border-white/10'}`}>
                <span className="material-symbols-outlined text-4xl text-error">shield</span>
                <span className="text-[10px] font-bold text-error uppercase mt-1">Firewall</span>
              </div>
            </div>

            {/* Current Packet */}
            {packetIndex >= 0 && packetIndex < TEST_PACKETS.length && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className={`px-4 py-2 rounded-lg border ${results[packetIndex]?.result === 'allow' ? 'bg-tertiary/20 border-tertiary/40' : 'bg-error/20 border-error/40'}`}>
                  <span className={`text-xs font-bold ${results[packetIndex]?.result === 'allow' ? 'text-tertiary' : 'text-error'}`}>
                    {results[packetIndex]?.result === 'allow' ? '✓ ALLOWED' : '✗ DENIED'}: {TEST_PACKETS[packetIndex].label}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-lg border border-tertiary/10">
                <span className="material-symbols-outlined text-3xl text-tertiary">dns</span>
              </div>
              <span className="text-[10px] font-bold text-tertiary uppercase">Server</span>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
            </div>
          </div>

          {/* Results Log */}
          <div className="mt-6 bg-surface-container-lowest rounded-xl p-6 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Inspection Log</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded border-l-2 ${r.result === 'allow' ? 'border-tertiary bg-tertiary/5' : 'border-error bg-error/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-sm ${r.result === 'allow' ? 'text-tertiary' : 'text-error'}`}>{r.result === 'allow' ? 'check_circle' : 'cancel'}</span>
                    <span className="font-mono text-[11px] text-on-surface">{r.packet.src}:{r.packet.port} ({r.packet.proto})</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${r.result === 'allow' ? 'text-tertiary' : 'text-error'}`}>{r.result}</span>
                </div>
              ))}
              {results.length === 0 && <p className="text-slate-500 text-xs italic text-center py-4">Press Play to start packet inspection...</p>}
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Active ACL Rules</h3>
                </div>
                <div className="space-y-2">
                  {rules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-surface-container-highest/40 rounded border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-sm ${rule.action === 'allow' ? 'text-tertiary' : 'text-error'}`}>{rule.action === 'allow' ? 'check_circle' : 'cancel'}</span>
                        <span className="font-mono text-[11px] text-on-surface">{rule.action === 'allow' ? 'Allow' : 'Deny'} {rule.src} Port {rule.port || '*'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-tertiary/10 p-4 rounded-lg border border-tertiary/20 text-center">
                  <p className="text-2xl font-bold text-tertiary">{allowed}</p>
                  <p className="text-[10px] font-bold text-tertiary uppercase">Allowed</p>
                </div>
                <div className="bg-error/10 p-4 rounded-lg border border-error/20 text-center">
                  <p className="text-2xl font-bold text-error">{denied}</p>
                  <p className="text-[10px] font-bold text-error uppercase">Denied</p>
                </div>
              </div>
            </>
          )}
          {tab === 'quiz' && <QuizPanel title="Firewall Quiz" questions={FW_QUIZ} />}
        </div>
      </div>
    </div>
  );
}
