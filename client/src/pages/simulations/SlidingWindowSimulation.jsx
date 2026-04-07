import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const TOTAL_PACKETS = 10;
const INITIAL_WINDOW = 4;

const QUIZ = [
  { q: 'Why does TCP use a sliding window instead of stop-and-wait?', options: ['It\'s simpler to implement', 'It maximizes throughput by keeping the pipe full', 'It uses less memory', 'It\'s more secure'], answer: 1, difficulty: 'easy' },
  { q: 'What happens when an ACK is received?', options: ['All packets are resent', 'The window slides forward, allowing a new packet to be sent', 'The connection is closed', 'The window shrinks'], answer: 1, difficulty: 'easy' },
  { q: 'If the window size is 4, how many unacknowledged packets can be in flight?', options: ['1', '2', '4', '8'], answer: 2, difficulty: 'easy' },
  { q: 'What is "flow control" in TCP?', options: ['Encrypting data', 'Controlling the rate of data transmission to prevent overwhelming the receiver', 'Routing packets', 'DNS resolution'], answer: 1, difficulty: 'medium' },
  { q: 'In TCP, the receiver can dynamically adjust the window size. This is called...', options: ['Congestion control', 'Advertised/Receive window', 'MTU discovery', 'Packet fragmentation'], answer: 1, difficulty: 'medium' },
  { q: 'If packet #3 is lost but packet #4 arrives, what happens in standard TCP?', options: ['Receiver ACKs #4', 'Receiver ACKs #2 (duplicate ACK)', 'Connection resets', 'Sender ignores it'], answer: 1, difficulty: 'hard' },
  { q: 'What is the purpose of the Congestion Window (cwnd)?', options: ['It replaces the Receive Window', 'It limits sending rate based on network congestion, not just receiver capacity', 'It enforces encryption', 'It sets the TTL'], answer: 1, difficulty: 'hard' },
  { q: 'Which algorithm slowly increases the window size at the start of a connection?', options: ['Fast Retransmit', 'Slow Start', 'Dijkstra', 'Sliding Recovery'], answer: 1, difficulty: 'medium' },
  { q: 'If a sender receives 3 duplicate ACKs, what does TCP typically do?', options: ['Fast Retransmit the missing packet', 'Close the connection', 'Double the window size', 'Wait for a timeout'], answer: 0, difficulty: 'hard' },
  { q: 'A window size of 0 means...', options: ['The connection is over', 'The receiver buffer is full, sender must pause', 'The network is down', 'The packet was corrupted'], answer: 1, difficulty: 'medium' },
];

const LEARN_CONTENT = [
  { title: 'What is Sliding Window?', icon: 'school', text: 'The Sliding Window protocol allows a sender to transmit multiple packets before needing an acknowledgement. Instead of "send one, wait for ACK, send next" (stop-and-wait), the sender fires off a burst of packets up to the window size.' },
  { title: 'Why It Matters', icon: 'speed', text: 'Without sliding window, a network with high latency would be extremely slow — you\'d waste time waiting for ACKs. Sliding window keeps the "pipe" full of data, maximizing bandwidth utilization.' },
  { title: 'How ACKs Work', icon: 'verified', text: 'When the receiver gets a packet, it sends back an ACK. When the sender receives this ACK, the window slides forward: the acknowledged packet leaves the window, and a new packet enters and is sent.' },
  { title: 'Window Size', icon: 'tune', text: 'The window size determines how many packets can be "in flight" (sent but not yet ACKed). TCP dynamically adjusts this based on network congestion (congestion window) and receiver capacity (receive window).' },
];

export default function SlidingWindowSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [windowSize] = useState(INITIAL_WINDOW);
  const [packets, setPackets] = useState(() => Array.from({ length: TOTAL_PACKETS }, (_, i) => ({ id: i + 1, status: i < INITIAL_WINDOW ? 'sent' : 'ready' })));
  const [windowStart, setWindowStart] = useState(0);
  const [log, setLog] = useState([]);
  const [tab, setTab] = useState('learn');
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setPackets(prev => {
      const next = [...prev];
      const firstSent = next.findIndex(p => p.status === 'sent');
      if (firstSent === -1) { setIsPlaying(false); return prev; }
      next[firstSent] = { ...next[firstSent], status: 'acked' };
      setLog(l => [...l, { time: new Date().toLocaleTimeString(), msg: `ACK received for Packet ${next[firstSent].id}`, type: 'ack' }]);
      const nextReady = next.findIndex(p => p.status === 'ready');
      if (nextReady !== -1) {
        next[nextReady] = { ...next[nextReady], status: 'sent' };
        setLog(l => [...l, { time: new Date().toLocaleTimeString(), msg: `Sent Packet ${next[nextReady].id}`, type: 'send' }]);
      }
      setWindowStart(next.findIndex(p => p.status === 'sent'));
      return next;
    });
  }, []);

  const manualStep = () => { setIsPlaying(false); step(); };

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 1500 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => {
    setIsPlaying(false);
    setPackets(Array.from({ length: TOTAL_PACKETS }, (_, i) => ({ id: i + 1, status: i < INITIAL_WINDOW ? 'sent' : 'ready' })));
    setWindowStart(0); setLog([]); clearInterval(intervalRef.current);
  };

  const getExplanation = () => {
    const acked = packets.filter(p => p.status === 'acked').length;
    const sent = packets.filter(p => p.status === 'sent').length;
    const ready = packets.filter(p => p.status === 'ready').length;
    if (acked === TOTAL_PACKETS) return { title: 'All Done!', text: 'Every packet has been acknowledged. The file transfer is complete!', tip: 'In real TCP, the connection would now be torn down with FIN/ACK.' };
    if (acked === 0 && sent === INITIAL_WINDOW) return { title: 'Initial Window Sent', text: `TCP sends ${INITIAL_WINDOW} packets at once (the window size). It does NOT wait for each ACK individually — that would be too slow.`, tip: 'Press ⏭ Step to ACK the first packet and watch the window slide.' };
    return { title: `Window Sliding (ACKed: ${acked}/${TOTAL_PACKETS})`, text: `When Packet ${acked} is ACKed, the window slides right. A new packet enters the window and is sent immediately.`, tip: `${ready} packets remaining. ${sent} currently in-flight.` };
  };

  const colors = { acked: 'bg-tertiary/20 border-tertiary/30 text-tertiary', sent: 'bg-primary/20 border-primary border-2 text-primary', ready: 'bg-surface-container-highest border-white/5 text-slate-500' };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="px-10 py-8 bg-surface-dim">
        <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2 block">L4 PROTOCOLS</span>
        <h1 className="text-5xl font-headline font-black text-on-surface tracking-tighter leading-none mb-2">Sliding Window Protocol</h1>
        <p className="text-sm text-on-secondary-container max-w-2xl">Visualize how TCP manages flow control. Use <strong className="text-primary">⏭ Step</strong> to advance one ACK at a time.</p>
      </section>

      <section className="flex-1 px-10 pb-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
          <div className="bg-surface-container relative rounded-xl overflow-hidden min-h-[350px] shadow-2xl p-10 flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full mb-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center border-t border-white/10 shadow-xl">
                  <span className="material-symbols-outlined text-2xl text-primary">laptop_mac</span>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase">Sender</span>
              </div>
              <div className="flex-1 mx-6 h-1 bg-gradient-to-r from-primary/30 via-primary/10 to-tertiary/30 rounded" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center border-t border-white/10 shadow-xl">
                  <span className="material-symbols-outlined text-2xl text-tertiary">dns</span>
                </div>
                <span className="text-[10px] font-bold text-tertiary uppercase">Receiver</span>
              </div>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Window (Size: {windowSize})</span>
                <span className="text-[10px] font-bold text-tertiary uppercase">{packets.every(p => p.status === 'acked') ? 'Complete' : 'Active'}</span>
              </div>
              <div className="flex gap-1.5">
                {packets.map(p => (
                  <div key={p.id} className={`flex-1 h-14 ${colors[p.status] || 'bg-surface-container border-white/5 text-slate-600'} border rounded flex flex-col items-center justify-center transition-all`}>
                    <span className="text-[9px] font-bold uppercase">{p.status === 'acked' ? 'ACKed' : p.status === 'sent' ? 'Sent' : 'Ready'}</span>
                    <span className="text-[8px] font-mono mt-0.5">P{p.id}</span>
                  </div>
                ))}
              </div>
              {windowStart >= 0 && windowStart < TOTAL_PACKETS && (
                <div className="mt-1.5 flex">
                  <div style={{ width: `${(windowStart / TOTAL_PACKETS) * 100}%` }} />
                  <div style={{ width: `${(windowSize / TOTAL_PACKETS) * 100}%` }} className="border-t-2 border-primary flex justify-center">
                    <span className="text-[8px] text-primary font-bold -mt-0.5 bg-surface-container px-2">WINDOW</span>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
            </div>
          </div>

          {(() => { const exp = getExplanation(); return (
            <div className="bg-gradient-to-r from-primary/8 to-transparent p-5 rounded-xl border border-primary/15">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">What's Happening — {exp.title}</span>
              </div>
              <p className="text-sm text-white leading-relaxed mb-2">{exp.text}</p>
              <div className="p-3 bg-surface-container-lowest/60 rounded-lg border border-white/5">
                <p className="text-xs text-slate-300"><strong className="text-primary">💡 </strong>{exp.tip}</p>
              </div>
            </div>
          ); })()}
        </div>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex bg-surface-container-highest rounded-xl overflow-hidden">
            <button onClick={() => setTab('learn')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${tab === 'learn' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">school</span> Learn
            </button>
            <button onClick={() => setTab('quiz')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${tab === 'quiz' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">quiz</span> Self-Test
            </button>
          </div>

          {tab === 'learn' && (
            <>
              {LEARN_CONTENT.map((item, i) => (
                <div key={i} className="bg-surface-container-low p-5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{item.title}</span>
                  </div>
                  <p className="text-xs text-on-secondary-container leading-relaxed">{item.text}</p>
                </div>
              ))}
              <div className="bg-surface-container p-5 rounded-xl border border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[['ACKed', packets.filter(p => p.status === 'acked').length, 'text-tertiary'], ['In Flight', packets.filter(p => p.status === 'sent').length, 'text-primary'], ['Remaining', packets.filter(p => p.status === 'ready').length, 'text-on-surface'], ['Window', windowSize, 'text-primary']].map(([l, v, c]) => (
                    <div key={l} className="bg-surface-container-lowest p-3 rounded">
                      <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">{l}</p>
                      <p className={`text-sm font-bold ${c}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'quiz' && <QuizPanel title="Sliding Window Quiz" questions={QUIZ} />}
        </aside>
      </section>
    </div>
  );
}
