import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const VPN_QUIZ = [
  { q: 'VPN stands for...', options: ['Virtual Private Network', 'Very Protected Network', 'Virtual Public Net', 'Verified Private Node'], answer: 0, difficulty: 'easy' },
  { q: 'IPsec primarily uses which protocol for encrypting the data payload?', options: ['AH (Authentication Header)', 'ESP (Encapsulating Security Payload)', 'TCP', 'ICMP'], answer: 1, difficulty: 'medium' },
  { q: 'What does "tunneling" mean in a VPN context?', options: ['Digging underground cables', 'Encapsulating one entire packet inside a new outer packet', 'Compressing data', 'Using fiber optics'], answer: 1, difficulty: 'easy' },
  { q: 'Why does a VPN add a new outer IP header?', options: ['To increase packet size', 'So the encrypted packet can be routed across the public internet to the VPN server', 'To bypass firewalls', 'For authentication only'], answer: 1, difficulty: 'medium' },
  { q: 'In IPsec Tunnel Mode, the original IP header is...', options: ['Left in plaintext', 'Encrypted and encapsulated', 'Deleted', 'Replaced with a MAC address'], answer: 1, difficulty: 'hard' },
  { q: 'In IPsec Transport Mode, the original IP header is...', options: ['Encrypted', 'Left intact (only the payload is encrypted)', 'Swapped with the server IP', 'Replaced by UDP'], answer: 1, difficulty: 'hard' },
  { q: 'Which protocol is commonly used to establish the secure key exchange for IPsec?', options: ['IKE (Internet Key Exchange)', 'HTTP', 'BGP', 'DHCP'], answer: 0, difficulty: 'hard' },
  { q: 'A Site-to-Site VPN connects...', options: ['One laptop to a server', 'Two entire networks (e.g., branch office to headquarters)', 'A phone to a router', 'The internet to a database'], answer: 1, difficulty: 'medium' },
  { q: 'When a packet arrives at the VPN Server from a client, the server must...', options: ['Drop it', 'Strip the outer header and decrypt the payload', 'Encrypt it again', 'Ping the destination'], answer: 1, difficulty: 'easy' },
  { q: 'Which of these is NOT a common VPN protocol?', options: ['IPsec', 'OpenVPN', 'WireGuard', 'RIP'], answer: 3, difficulty: 'medium' },
];

const STEPS = [
  { id: 'plain', msg: 'Client sends original packet: "GET /dashboard"', phase: 'Original Data' },
  { id: 'encrypt', msg: 'VPN Client encrypts payload with IPsec ESP', phase: 'Encrypting' },
  { id: 'encap', msg: 'Adds new IP header — packet is now encapsulated in tunnel', phase: 'Encapsulating' },
  { id: 'transit', msg: 'Encrypted packet traverses the public internet', phase: 'In Transit' },
  { id: 'decap', msg: 'VPN Server strips outer IP header', phase: 'Decapsulating' },
  { id: 'decrypt', msg: 'VPN Server decrypts payload — original data restored', phase: 'Decrypting' },
  { id: 'deliver', msg: 'Original packet forwarded to destination server', phase: 'Delivered' },
];

export default function VpnSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [stepIndex, setStepIndex] = useState(-1);
  const [tab, setTab] = useState('learn');
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setStepIndex(prev => { if (prev >= STEPS.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
  }, []);

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 2000 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setStepIndex(-1); clearInterval(intervalRef.current); };
  const manualStep = () => { setIsPlaying(false); step(); };
  const inTunnel = stepIndex >= 1 && stepIndex <= 4;

  return (
    <div className="p-12 min-h-[calc(100vh-4rem)]">
      <h1 className="text-6xl font-black font-headline tracking-tighter text-white mb-2">VPN Tunnel</h1>
      <p className="text-on-secondary-container text-lg max-w-2xl mb-8">Visualize how a VPN encrypts and encapsulates data through an IPsec tunnel.</p>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="relative bg-surface-container rounded-xl overflow-hidden h-[400px] p-12">
            <div className="flex items-center justify-between h-full relative">
              {/* Client */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-lg border border-primary/10">
                  <span className="material-symbols-outlined text-3xl text-primary">laptop_mac</span>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase">Client</span>
              </div>

              {/* VPN Tunnel */}
              <div className={`flex-1 mx-6 h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all relative ${inTunnel ? 'border-primary/60 bg-primary/5' : 'border-slate-600/30 bg-transparent'}`}>
                {inTunnel && <span className="text-primary text-xs font-bold uppercase tracking-widest">Encrypted Tunnel (IPsec)</span>}
                {!inTunnel && <span className="text-slate-500 text-xs uppercase">Public Internet</span>}
                {stepIndex >= 1 && stepIndex <= 4 && (
                  <div className="absolute bg-primary/20 border border-primary/40 px-3 py-1 rounded text-[10px] font-mono text-primary font-bold" style={{ left: `${((stepIndex - 1) / 3) * 80 + 10}%` }}>
                    🔒 ENCRYPTED
                  </div>
                )}
              </div>

              {/* Server */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-lg border border-tertiary/10">
                  <span className="material-symbols-outlined text-3xl text-tertiary">dns</span>
                </div>
                <span className="text-[10px] font-bold text-tertiary uppercase">Server</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
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
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Tunnel Phases</h3>
                {STEPS.map((s, i) => (
                  <div key={s.id} className={`p-3 rounded mb-2 ${i <= stepIndex ? 'bg-primary/10' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold ${i <= stepIndex ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-slate-400'}`}>{i + 1}</span>
                      <span className={`text-[10px] font-bold uppercase ${i <= stepIndex ? 'text-white' : 'text-slate-400'}`}>{s.phase}</span>
                    </div>
                    {i === stepIndex && <p className="text-[10px] text-on-secondary-container mt-1 ml-7">{s.msg}</p>}
                  </div>
                ))}
              </div>
              <div className="bg-surface-container p-6 rounded-xl border border-white/5">
                <h3 className="font-headline font-bold text-on-surface mb-3">IPsec VPN</h3>
                <p className="text-sm text-on-secondary-container leading-relaxed">VPN creates an encrypted tunnel using IKEv2 for key exchange and ESP for data encryption.</p>
              </div>
            </>
          )}
          {tab === 'quiz' && <QuizPanel title="VPN Quiz" questions={VPN_QUIZ} />}
        </div>
      </div>
    </div>
  );
}
