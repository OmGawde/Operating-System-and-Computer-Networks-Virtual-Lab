import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const ARP_QUIZ = [
  { q: 'ARP resolves which type of address to which?', options: ['MAC to IP', 'IP to MAC', 'IP to hostname', 'MAC to hostname'], answer: 1, difficulty: 'easy' },
  { q: 'ARP Requests are sent as...', options: ['Unicast', 'Broadcast', 'Multicast', 'Anycast'], answer: 1, difficulty: 'easy' },
  { q: 'ARP Replies are sent as...', options: ['Broadcast', 'Unicast', 'Multicast', 'Flooding'], answer: 1, difficulty: 'easy' },
  { q: 'What happens when an ARP cache entry expires?', options: ['Connection drops', 'A new ARP broadcast is sent next time communication is needed', 'IP changes', 'Nothing'], answer: 1, difficulty: 'medium' },
  { q: 'ARP operates at which OSI layer?', options: ['Network (L3)', 'Between L2 and L3', 'Transport (L4)', 'Application (L7)'], answer: 1, difficulty: 'medium' },
  { q: 'Which address does a PC use as the destination MAC for an ARP Request?', options: ['00:00:00:00:00:00', 'FF:FF:FF:FF:FF:FF', 'Its own MAC', 'The router\'s MAC'], answer: 1, difficulty: 'medium' },
  { q: 'What is "Gratuitous ARP"?', options: ['Asking for a MAC multiple times', 'An ARP reply sent without being requested (often used for IP conflict detection or HA)', 'Paying for an ARP table', 'A malicious ARP attack'], answer: 1, difficulty: 'hard' },
  { q: 'If Host A wants to ping Host B on a DIFFERENT subnet, whose MAC address does Host A ARP for?', options: ['Host B\'s MAC', 'The Switch\'s MAC', 'The Default Gateway\'s (Router\'s) MAC', 'Its own MAC'], answer: 2, difficulty: 'hard' },
  { q: 'An ARP spoofing/poisoning attack attempts to...', options: ['Delete the ARP cache', 'Associate the attacker\'s MAC with another host\'s IP (like the gateway)', 'Flood the network with pings', 'Change the computer\'s IP address'], answer: 1, difficulty: 'hard' },
  { q: 'How do you view the local ARP cache on a Windows or Linux command line?', options: ['arp -a', 'show arp', 'ipconfig /arp', 'netstat -arp'], answer: 0, difficulty: 'medium' },
];

const DEVICES = [
  { id: 'PCA', ip: '192.168.1.1', mac: '00:0C:29:3A:7B:11', x: 80, y: 80, label: 'PC-A', isSource: true },
  { id: 'PCB', ip: '192.168.1.2', mac: '00:0C:29:4F:8B:22', x: 550, y: 80, label: 'PC-B' },
  { id: 'PCC', ip: '192.168.1.3', mac: '00:0C:29:5E:9C:33', x: 150, y: 380, label: 'PC-C' },
  { id: 'PCD', ip: '192.168.1.4', mac: '00:0C:29:6D:AD:44', x: 480, y: 380, label: 'PC-D' },
];
const SWITCH = { id: 'SW1', x: 315, y: 220, label: 'L2-SWITCH-01' };

const PHASES = [
  { id: 'idle', msg: 'Idle — PC-A wants to send data to PC-B but doesn\'t know its MAC address.',
    whatHappens: 'PC-A has the destination IP address (192.168.1.2) but needs the MAC address to create a proper Ethernet frame. The ARP cache is empty, so ARP must be used to resolve the MAC.',
    analogy: '📮 You know your friend\'s apartment number but not which building they\'re in.',
    keyPoint: 'IP addresses identify devices across networks, but MAC addresses are needed for LOCAL delivery on Ethernet.' },
  { id: 'broadcast', msg: 'ARP Request: PC-A broadcasts "Who has 192.168.1.2?"',
    whatHappens: 'PC-A creates an ARP Request packet with: Sender IP=192.168.1.1, Sender MAC=00:0C:29:3A:7B:11, Target IP=192.168.1.2, Target MAC=FF:FF:FF:FF:FF:FF (broadcast). This is sent as an Ethernet BROADCAST to all devices.',
    analogy: '📢 Shouting in a room: "Who has IP 192.168.1.2? Tell me your MAC address!"',
    keyPoint: 'ARP uses broadcast (FF:FF:FF:FF:FF:FF). Every device on the LAN receives and processes this frame.' },
  { id: 'switch-flood', msg: 'Switch floods ARP request to all ports',
    whatHappens: 'The Layer 2 switch receives the broadcast frame and FLOODS it out all ports except the incoming port. All connected devices receive the ARP Request. The switch also learns PC-A\'s MAC and port mapping.',
    analogy: '📡 The building intercom forwards the message to every apartment.',
    keyPoint: 'Switches always flood broadcast frames. This is why ARP broadcast storms can cause network congestion.' },
  { id: 'reply', msg: 'PC-B responds: "192.168.1.2 is at 00:0C:29:4F:8B:22"',
    whatHappens: 'Only PC-B (owner of 192.168.1.2) responds with a UNICAST ARP Reply containing its MAC address. PC-C and PC-D silently discard the request because the target IP doesn\'t match theirs.',
    analogy: '✋ Only your friend responds: "That\'s me! Here\'s my exact location."',
    keyPoint: 'ARP Reply is UNICAST (sent directly to PC-A), not broadcast. This reduces unnecessary network traffic.' },
  { id: 'cached', msg: 'ARP cache updated — MAC address resolved!',
    whatHappens: 'PC-A stores the mapping (192.168.1.2 → 00:0C:29:4F:8B:22) in its ARP CACHE. Future packets to this IP will use the cached MAC directly, avoiding another ARP broadcast. The cache entry has a TTL (typically 2-20 minutes).',
    analogy: '📝 You write down your friend\'s location so you don\'t have to ask again.',
    keyPoint: 'ARP cache entries expire (TTL). After expiry, a new ARP request is needed. Use "arp -a" in terminal to view your cache!' },
];

export default function ArpSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [arpCache, setArpCache] = useState([]);
  const [destIp, setDestIp] = useState('192.168.1.2');
  const [tab, setTab] = useState('learn');
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setPhaseIndex(prev => {
      if (prev >= PHASES.length - 1) { setIsPlaying(false); return prev; }
      if (prev === 3) {
        const target = DEVICES.find(d => d.ip === destIp);
        if (target) setArpCache(c => [...c.filter(e => e.ip !== destIp), { ip: destIp, mac: target.mac, type: 'Dynamic', ttl: '20 min' }]);
      }
      return prev + 1;
    });
  }, [destIp]);

  const manualStep = () => { setIsPlaying(false); step(); };

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 2500 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setPhaseIndex(0); setArpCache([]); clearInterval(intervalRef.current); };
  const currentPhase = PHASES[phaseIndex];

  return (
    <div className="p-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-5xl font-black font-headline tracking-tighter text-white mb-1">ARP Resolution</h1>
          <p className="text-on-secondary-container max-w-2xl">Watch how devices resolve IP addresses to MAC addresses on a local network. Use <strong className="text-primary">⏭ Step</strong> to advance manually.</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Simulation Stage */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            <div className="bg-surface-container relative overflow-hidden h-[470px] rounded-xl p-8">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #7bd0ff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

              {/* Switch */}
              <div className="absolute" style={{ left: SWITCH.x - 50, top: SWITCH.y - 30 }}>
                <div className="w-28 h-20 bg-surface-container-highest flex flex-col items-center justify-center border border-outline-variant/15 relative rounded-lg">
                  <span className="material-symbols-outlined text-4xl text-primary">hub</span>
                  <p className="text-[10px] font-mono mt-1">{SWITCH.label}</p>
                  {phaseIndex >= 1 && phaseIndex <= 2 && <div className="absolute -top-1 right-2 w-2 h-2 bg-tertiary rounded-full animate-pulse shadow-[0_0_8px_#4ae176]" />}
                </div>
              </div>

              {/* Devices */}
              {DEVICES.map(d => {
                const isTarget = d.ip === destIp;
                const isHighlighted = (phaseIndex === 1 && d.isSource) || (phaseIndex === 2) || (phaseIndex === 3 && isTarget) || (phaseIndex === 4 && (isTarget || d.isSource));
                return (
                  <div key={d.id} className="absolute" style={{ left: d.x - 40, top: d.y - 30 }}>
                    <div className={`p-4 flex flex-col items-center gap-2 transition-all border rounded-lg ${isHighlighted ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10' : 'bg-surface-container-high border-outline-variant/15'}`}>
                      <span className={`material-symbols-outlined text-3xl ${isHighlighted ? 'text-primary' : 'text-slate-400'}`}>computer</span>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-white">{d.label}</p>
                        <p className="text-[10px] font-mono text-primary-fixed-dim">{d.ip}</p>
                      </div>
                      {d.isSource && <div className="absolute -top-2 -right-2 bg-primary text-on-primary text-[8px] font-bold px-1.5 py-0.5 rounded">SRC</div>}
                      {isTarget && phaseIndex >= 3 && <div className="absolute -top-2 -right-2 bg-tertiary text-on-tertiary text-[8px] font-bold px-1.5 py-0.5 rounded">TARGET</div>}
                    </div>
                  </div>
                );
              })}

              {/* ARP Packet */}
              {phaseIndex >= 1 && phaseIndex <= 2 && (
                <div className="absolute bg-tertiary/80 text-on-tertiary px-3 py-1.5 text-[9px] font-bold font-mono shadow-xl flex items-center gap-2 border border-on-tertiary/20 z-20 rounded-lg"
                  style={{ left: phaseIndex === 1 ? 150 : 300, top: phaseIndex === 1 ? 150 : 180, transition: 'all 0.5s ease' }}>
                  <span className="material-symbols-outlined text-xs">mail</span>
                  ARP REQ: WHO HAS {destIp}?
                </div>
              )}
              {phaseIndex >= 3 && phaseIndex < 5 && (
                <div className="absolute bg-primary text-on-primary px-3 py-1.5 text-[9px] font-bold font-mono shadow-xl flex items-center gap-2 z-20 rounded-lg"
                  style={{ left: 350, top: 150, transition: 'all 0.5s ease' }}>
                  <span className="material-symbols-outlined text-xs">mail</span>
                  ARP REPLY: {destIp} IS AT {DEVICES.find(d => d.ip === destIp)?.mac}
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
              </div>
            </div>

            {/* What's Happening */}
            <div className="bg-gradient-to-r from-primary/8 to-transparent p-5 rounded-xl border border-primary/15">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">What's Happening — Step {phaseIndex + 1} of {PHASES.length}</span>
              </div>
              <p className="text-sm text-white leading-relaxed mb-3">{currentPhase.whatHappens}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-container-lowest/60 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-white">Analogy:</strong> {currentPhase.analogy}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs text-on-secondary-container leading-relaxed"><strong className="text-primary">Key Point:</strong> {currentPhase.keyPoint}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
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
                <div className="bg-surface-container-low p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-widest text-white">PC-A ARP Cache</h3><span className="material-symbols-outlined text-primary text-sm">database</span></div>
                  <div className="bg-surface-container-lowest p-0.5 border border-outline-variant/15 overflow-hidden rounded-lg">
                    <table className="w-full text-[11px] font-mono">
                      <thead className="bg-surface-container-highest/50 border-b border-white/5"><tr className="text-on-surface-variant text-left"><th className="px-3 py-2">IP</th><th className="px-3 py-2">MAC</th><th className="px-3 py-2">TTL</th></tr></thead>
                      <tbody className="divide-y divide-white/5">
                        {arpCache.map((e2, i) => <tr key={i} className="hover:bg-white/5"><td className="px-3 py-2 text-primary">{e2.ip}</td><td className="px-3 py-2">{e2.mac}</td><td className="px-3 py-2 text-tertiary/60">{e2.ttl}</td></tr>)}
                        {arpCache.length === 0 && <tr><td colSpan="3" className="px-3 py-4 text-center text-slate-500 italic text-[10px]">Cache empty</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Config</h3>
                  <select value={destIp} onChange={e => { setDestIp(e.target.value); reset(); }} className="w-full bg-surface-container-lowest border-none text-sm py-2 px-3 font-mono text-white rounded-lg">
                    {DEVICES.filter(d => !d.isSource).map(d => <option key={d.id} value={d.ip}>{d.label} ({d.ip})</option>)}
                  </select>
                </div>
                <div className="bg-surface-container p-5 rounded-xl border border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Steps</h3>
                  {PHASES.map((p, i) => (
                    <div key={p.id} className={`flex items-center gap-3 p-2 rounded mb-1 ${i <= phaseIndex ? 'bg-primary/10' : ''}`}>
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold ${i <= phaseIndex ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-slate-400'}`}>{i + 1}</span>
                      <span className={`text-[10px] font-bold uppercase ${i <= phaseIndex ? 'text-white' : 'text-slate-500'}`}>{p.id === 'idle' ? 'Ready' : p.id === 'broadcast' ? 'Broadcast' : p.id === 'switch-flood' ? 'Flood' : p.id === 'reply' ? 'Reply' : 'Cached'}</span>
                      {i < phaseIndex && <span className="material-symbols-outlined text-tertiary text-xs ml-auto">check</span>}
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-br from-[#171f33] to-[#0b1326] p-5 rounded-xl border border-primary/10">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">💡 Pro Tip</span>
                  <p className="text-xs text-slate-300 leading-relaxed">Run <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-primary text-[10px]">arp -a</code> in your terminal!</p>
                </div>
              </>
            )}
            {tab === 'quiz' && <QuizPanel title="ARP Quiz" questions={ARP_QUIZ} />}
          </div>
        </div>
      </div>
    </div>
  );
}
