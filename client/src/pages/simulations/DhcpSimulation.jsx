import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const DHCP_QUIZ = [
  { q: 'What does DORA stand for in DHCP?', options: ['Discover, Offer, Request, Acknowledge', 'Deliver, Open, Route, Accept', 'Detect, Organize, Relay, Assign', 'Data, Origin, Response, ACK'], answer: 0, difficulty: 'easy' },
  { q: 'DHCP primarily uses which transport protocol?', options: ['TCP', 'UDP', 'ICMP', 'ARP'], answer: 1, difficulty: 'easy' },
  { q: 'Why is the initial DHCP Discover message sent as a broadcast?', options: ['To reach the server faster', 'Because the client doesn\'t have an IP address and doesn\'t know the DHCP server\'s IP', 'For security', 'To wake up the network'], answer: 1, difficulty: 'medium' },
  { q: 'What role does a "DHCP Relay Agent" (IP Helper) play?', options: ['It encrypts DHCP traffic', 'It forwards DHCP broadcasts across routers to a DHCP server on a different subnet', 'It replaces the DHCP server', 'It manages DNS'], answer: 1, difficulty: 'hard' },
  { q: 'At what % of the lease time does a DHCP client typically first try to renew its lease (T1)?', options: ['25%', '50%', '87.5%', '100%'], answer: 1, difficulty: 'medium' },
  { q: 'What destination IP is used for a DHCP Discover?', options: ['127.0.0.1', '192.168.1.1', '255.255.255.255', '0.0.0.0'], answer: 2, difficulty: 'medium' },
  { q: 'If a client reboots, does it go through the full DORA process again?', options: ['Yes, always', 'No, it usually starts with a DHCP Request to reclaim its old IP', 'It never needs to ask again', 'It uses APIPA immediately'], answer: 1, difficulty: 'hard' },
  { q: 'What is an APIPA address (e.g., 169.254.x.x)?', options: ['A public IP', 'A static IP', 'A link-local address assigned by the OS if DHCP fails', 'A router\'s IP'], answer: 2, difficulty: 'medium' },
  { q: 'Which DHCP step is broadcast to let ALL DHCP servers know which offer was accepted?', options: ['Discover', 'Offer', 'Request', 'Acknowledge'], answer: 2, difficulty: 'hard' },
  { q: 'DHCP provides IP, Subnet Mask, Default Gateway, and often...', options: ['MAC Address', 'DNS Server IPs', 'VLAN Tags', 'Encryption Keys'], answer: 1, difficulty: 'easy' },
];

const STEPS = [
  { id: 'discover', label: 'DHCP Discover', desc: 'Client broadcasts: "I need an IP address!" (255.255.255.255)', from: 'client', color: 'primary',
    whatHappens: 'The client has just joined the network and has no IP address (0.0.0.0). It sends a broadcast UDP message (port 67) to 255.255.255.255 asking any DHCP server to assign it an IP.', keyPoint: 'DHCP uses UDP, not TCP. The client uses broadcast because it doesn\'t know any server\'s address yet.' },
  { id: 'offer', label: 'DHCP Offer', desc: 'Server offers: "You can have 192.168.1.100 for 24 hours"', from: 'server', color: 'tertiary',
    whatHappens: 'The DHCP server receives the broadcast, selects an available IP from its pool (192.168.1.100-200), and sends an offer back with the proposed IP, subnet mask, gateway, DNS, and lease duration.', keyPoint: 'Multiple DHCP servers can respond with offers. The client typically accepts the first one it receives.' },
  { id: 'request', label: 'DHCP Request', desc: 'Client requests: "I accept 192.168.1.100"', from: 'client', color: 'primary',
    whatHappens: 'The client broadcasts its acceptance of the offered IP address. This is broadcast (not unicast) so that other DHCP servers know which offer was accepted and can release their reserved IPs.', keyPoint: 'This step is broadcast to inform ALL servers on the network, not just the one that made the offer.' },
  { id: 'ack', label: 'DHCP Acknowledge', desc: 'Server confirms: "192.168.1.100 is yours. Gateway: .1, DNS: 8.8.8.8"', from: 'server', color: 'tertiary',
    whatHappens: 'The server confirms the lease. The client now configures its network interface with the assigned IP, subnet mask, default gateway, DNS server, and starts a lease timer.', keyPoint: 'The lease has a time limit (24hrs). At 50% (T1) the client tries to renew. At 87.5% (T2) it broadcasts for any server.' },
];

export default function DhcpSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [stepIndex, setStepIndex] = useState(-1);
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setStepIndex(prev => { if (prev >= STEPS.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
  }, []);

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 2500 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setStepIndex(-1); clearInterval(intervalRef.current); };
  const manualStep = () => { setIsPlaying(false); step(); };
  const [tab, setTab] = useState('learn');
  const assigned = stepIndex >= 3;

  return (
    <div className="p-12 min-h-[calc(100vh-4rem)]">
      <h1 className="text-6xl font-black font-headline tracking-tighter text-white mb-2">DHCP Process</h1>
      <p className="text-on-secondary-container text-base max-w-2xl mb-8">Observe the DORA process for dynamic IP assignment. Use <strong className="text-primary">⏭ Step</strong> to advance one message at a time.</p>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="relative bg-surface-container rounded-xl overflow-hidden h-[500px] p-12 flex items-center justify-between">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7bd0ff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Client */}
            <div className="flex flex-col items-center gap-4 z-10">
              <div className="w-28 h-28 rounded-2xl bg-surface-container-high flex flex-col items-center justify-center border-t border-white/10 shadow-xl">
                <span className="material-symbols-outlined text-4xl text-primary">laptop_mac</span>
                <span className="text-[10px] font-bold text-primary uppercase mt-1">Client</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5 text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase">IP Address</p>
                <p className={`font-mono text-sm ${assigned ? 'text-tertiary' : 'text-slate-500'}`}>{assigned ? '192.168.1.100' : '0.0.0.0'}</p>
              </div>
            </div>

            {/* Wire */}
            <div className="absolute top-1/2 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/30 to-tertiary/30" />

            {/* Animated Packets */}
            {stepIndex >= 0 && stepIndex < STEPS.length && (
              <div className="absolute z-20 transition-all duration-700"
                style={{ top: '38%', left: STEPS[stepIndex].from === 'client' ? '25%' : '65%' }}>
                <div className={`px-4 py-2 bg-${STEPS[stepIndex].color}/20 border border-${STEPS[stepIndex].color}/40 rounded-lg shadow-xl`}>
                  <span className={`text-${STEPS[stepIndex].color} text-[10px] font-bold uppercase`}>{STEPS[stepIndex].label}</span>
                </div>
              </div>
            )}

            {/* Server */}
            <div className="flex flex-col items-center gap-4 z-10">
              <div className="w-28 h-28 rounded-2xl bg-surface-container-high flex flex-col items-center justify-center border-t border-white/10 shadow-xl">
                <span className="material-symbols-outlined text-4xl text-tertiary">dns</span>
                <span className="text-[10px] font-bold text-tertiary uppercase mt-1">DHCP Server</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5 text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Pool</p>
                <p className="font-mono text-sm text-tertiary">192.168.1.100-200</p>
              </div>
            </div>

            {assigned && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-tertiary/20 border border-tertiary/40 px-6 py-2 rounded-full z-20">
                <span className="text-tertiary font-bold text-sm uppercase tracking-widest">✓ IP Assigned Successfully</span>
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
            </div>
          </div>

          {/* What's Happening */}
          {stepIndex >= 0 && (
            <div className="bg-gradient-to-r from-primary/8 to-transparent p-5 rounded-xl border border-primary/15">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">What's Happening — {STEPS[stepIndex].label}</span>
              </div>
              <p className="text-sm text-white leading-relaxed mb-2">{STEPS[stepIndex].whatHappens}</p>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs text-on-secondary-container"><strong className="text-primary">💡 Key Point:</strong> {STEPS[stepIndex].keyPoint}</p>
              </div>
            </div>
          )}
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
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">DORA Process</h3>
                {STEPS.map((s, i) => (
                  <div key={s.id} className={`flex items-start gap-3 p-3 rounded mb-2 ${i <= stepIndex ? 'bg-primary/10' : ''}`}>
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0 ${i <= stepIndex ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-slate-400'}`}>{s.label[5]}</span>
                    <div>
                      <span className={`text-xs font-bold uppercase block ${i <= stepIndex ? 'text-white' : 'text-slate-400'}`}>{s.label}</span>
                      <span className="text-[10px] text-on-secondary-container">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              {assigned && (
                <div className="bg-surface-container p-6 rounded-xl border border-tertiary/20">
                  <h3 className="text-xs font-black uppercase tracking-widest text-tertiary mb-4">Lease Info</h3>
                  {[['IP Address', '192.168.1.100'], ['Subnet Mask', '255.255.255.0'], ['Gateway', '192.168.1.1'], ['DNS Server', '8.8.8.8'], ['Lease Time', '24 hours']].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-white/5 text-xs">
                      <span className="text-slate-400">{k}</span><span className="font-mono text-white">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === 'quiz' && <QuizPanel title="DHCP Quiz" questions={DHCP_QUIZ} />}
        </div>
      </div>
    </div>
  );
}
