import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';

const PHASES = [
  { id: 'idle', label: 'IDLE', from: null, flags: '-', seq: '-', ack: '-',
    desc: 'No connection established. Client is about to initiate.',
    whatHappens: 'Both sides are in their initial states. The client is in CLOSED state and the server is LISTENING on a port, ready to accept connections.',
    analogy: '📞 Like picking up the phone — no one is connected yet, but the server has its phone on the hook, waiting for a call.',
    keyPoint: 'TCP is connection-oriented. Unlike UDP, data cannot flow until this handshake completes successfully.'
  },
  { id: 'syn', label: 'SYN', from: 'client', flags: 'SYN', seq: 1000, ack: '-',
    desc: 'Client sends SYN with initial sequence number.',
    whatHappens: 'The client sends a SYN (Synchronize) segment with a random initial sequence number (ISN = 1000). The SYN flag is set to 1. Client state changes to SYN_SENT.',
    analogy: '📞 "Hello, can you hear me?" — The client reaches out to start the conversation and shares its starting number.',
    keyPoint: 'The sequence number (ISN) is randomly chosen to prevent attackers from guessing it. This number will be used to track all data bytes sent.'
  },
  { id: 'syn-ack', label: 'SYN-ACK', from: 'server', flags: 'SYN, ACK', seq: 4200, ack: 1001,
    desc: 'Server acknowledges SYN and sends its own SYN.',
    whatHappens: 'The server responds with both SYN and ACK flags set. It acknowledges the client\'s ISN by sending ACK = 1001 (client ISN + 1), and sends its own ISN = 4200. Server state changes to SYN_RCVD.',
    analogy: '📞 "Yes I hear you! Can you hear me?" — The server confirms it received the client\'s message AND starts its own synchronization.',
    keyPoint: 'ACK = ISN + 1 means "I received everything up to byte 1000, send me byte 1001 next." This is how TCP tracks reliability.'
  },
  { id: 'ack', label: 'ACK', from: 'client', flags: 'ACK', seq: 1001, ack: 4201,
    desc: 'Client sends final ACK. Connection established.',
    whatHappens: 'The client sends ACK = 4201 (server ISN + 1) to confirm it received the server\'s SYN. Both sides now agree on sequence numbers. Both enter ESTABLISHED state.',
    analogy: '📞 "Yes, I hear you too! Let\'s talk." — Both sides have confirmed they can communicate. The line is open.',
    keyPoint: 'After this step, both client and server have verified two-way communication. Data transmission can begin immediately.'
  },
  { id: 'established', label: 'ESTABLISHED', from: null, flags: '-', seq: '-', ack: '-',
    desc: 'Connection established. Ready for data transfer.',
    whatHappens: 'The TCP connection is fully established. Both sides have synchronized their sequence numbers and verified bidirectional communication. Data can now flow in both directions (full-duplex).',
    analogy: '📞 The phone call is connected — both people can now talk and listen simultaneously.',
    keyPoint: 'TCP provides reliable, ordered, and error-checked delivery. Every byte sent will be acknowledged, and lost data will be retransmitted.'
  },
];

const QUIZ = [
  { q: 'How many packets are exchanged in a TCP handshake?', options: ['1', '2', '3', '4'], answer: 2, difficulty: 'easy' },
  { q: 'What does the SYN flag do?', options: ['Closes the connection', 'Synchronizes sequence numbers', 'Sends data', 'Resets the connection'], answer: 1, difficulty: 'easy' },
  { q: 'What is the correct order of packets in a TCP handshake?', options: ['SYN, ACK, SYN-ACK', 'SYN, SYN-ACK, ACK', 'ACK, SYN, SYN-ACK', 'SYN-ACK, SYN, ACK'], answer: 1, difficulty: 'easy' },
  { q: 'Why is the client\'s ACK number equal to the server\'s ISN + 1?', options: ['It\'s random', 'It means "I got your ISN, send the next byte"', 'It\'s an error code', 'It aligns with the port number'], answer: 1, difficulty: 'medium' },
  { q: 'What happens if the server never receives the final ACK?', options: ['Connection fails permanently', 'Server retransmits SYN-ACK', 'Client sends data anyway', 'Connection opens halfway'], answer: 1, difficulty: 'medium' },
  { q: 'Which protocol typically does NOT use a TCP handshake?', options: ['HTTP', 'HTTPS', 'DNS', 'FTP'], answer: 2, difficulty: 'medium' },
  { q: 'What does ISN stand for?', options: ['Initial Sequence Number', 'Internal Set Network', 'Initial Sync Node', 'Internet Sequence Number'], answer: 0, difficulty: 'easy' },
  { q: 'Why do TCP sequences start at a random ISN instead of 0?', options: ['To save bandwidth', 'To prevent old duplicate packets from interfering', 'Because 0 is reserved', 'Operating systems cannot generate 0'], answer: 1, difficulty: 'hard' },
  { q: 'A SYN flood attack exploits the TCP handshake by...', options: ['Sending too many ACKs', 'Sending SYN packets without completing the handshake', 'Encrypting the SYN-ACK', 'Changing sequence numbers'], answer: 1, difficulty: 'hard' },
  { q: 'In the SYN-ACK step, how many flags are actually set to 1?', options: ['1', '2', '3', '4'], answer: 1, difficulty: 'medium' },
];

export default function TcpHandshakeSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [packetPos, setPacketPos] = useState(0);
  const [tab, setTab] = useState('learn');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const intervalRef = useRef(null);
  const animRef = useRef(null);

  const phase = PHASES[phaseIndex];

  const step = useCallback(() => {
    setPhaseIndex(prev => {
      if (prev >= PHASES.length - 1) { setIsPlaying(false); return prev; }
      return prev + 1;
    });
    setPacketPos(0);
  }, []);

  const manualStep = () => { setIsPlaying(false); step(); };

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 3000 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  useEffect(() => {
    if (phase.from && (isPlaying || packetPos === 0)) {
      let start = null;
      const duration = 1800 / speed;
      const animate = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setPacketPos(progress);
        if (progress < 1) animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [phaseIndex, isPlaying, speed, phase.from]);

  const reset = () => { setIsPlaying(false); setPhaseIndex(0); setPacketPos(0); clearInterval(intervalRef.current); };
  const packetLeft = phase.from === 'client' ? 15 + packetPos * 60 : 75 - packetPos * 60;

  const checkQuiz = (idx) => {
    setQuizAnswer(idx);
    if (idx === QUIZ[quizIdx].answer) setQuizScore(s => s + 1);
    setTimeout(() => {
      if (quizIdx < QUIZ.length - 1) { setQuizIdx(i => i + 1); setQuizAnswer(null); }
      else setQuizDone(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="px-10 py-8 bg-surface-dim">
        <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2 block">L4 PROTOCOLS</span>
        <h1 className="text-5xl font-headline font-black text-on-surface tracking-tighter leading-none mb-2">TCP 3-Way Handshake</h1>
        <p className="text-on-secondary-container text-sm max-w-2xl">Step through each phase to understand how TCP establishes a reliable connection before sending data. Use <strong className="text-primary">⏭ Step</strong> to advance manually.</p>
      </section>

      <section className="flex-1 px-10 pb-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
          {/* Main Stage */}
          <div className="bg-surface-container relative rounded-xl overflow-hidden aspect-video shadow-2xl flex items-center justify-between p-12">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-on-primary-container/40 to-primary/20 -translate-y-1/2 opacity-30" />

            {/* Client */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-28 h-28 rounded-2xl bg-surface-container-high flex flex-col items-center justify-center border-t border-white/10 shadow-xl">
                <span className="material-symbols-outlined text-3xl text-primary mb-1">laptop_mac</span>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Client</span>
                <span className="font-mono text-[9px] text-slate-500">192.168.1.50</span>
              </div>
              <div className="w-full bg-surface-container-lowest p-2 rounded-lg border border-white/5 text-center">
                <span className="text-[8px] font-bold text-slate-500 uppercase block">State</span>
                <span className="text-[10px] font-bold text-primary">{phaseIndex === 0 ? 'CLOSED' : phaseIndex === 1 ? 'SYN_SENT' : 'ESTABLISHED'}</span>
              </div>
            </div>

            {/* Animated Packet */}
            {phase.from && packetPos < 0.98 && (
              <div className="absolute z-20 top-[35%]" style={{ left: `${packetLeft}%`, transition: 'none' }}>
                <div className="bg-surface-container-highest border border-primary/40 px-4 py-2 rounded-lg shadow-2xl flex flex-col items-center">
                  <span className="text-[10px] font-bold text-primary uppercase mb-1">{phase.label}</span>
                  <div className="flex gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[8px] font-bold">SEQ: {phase.seq}</span>
                    {phase.ack !== '-' && <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-[8px] font-bold">ACK: {phase.ack}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Server */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-28 h-28 rounded-2xl bg-surface-container-high flex flex-col items-center justify-center border-t border-white/10 shadow-xl">
                <span className="material-symbols-outlined text-3xl text-tertiary mb-1">dns</span>
                <span className="text-[10px] font-bold text-tertiary tracking-widest uppercase">Server</span>
                <span className="font-mono text-[9px] text-slate-500">10.0.0.122</span>
              </div>
              <div className="w-full bg-surface-container-lowest p-2 rounded-lg border border-white/5 text-center">
                <span className="text-[8px] font-bold text-slate-500 uppercase block">State</span>
                <span className="text-[10px] font-bold text-tertiary">{phaseIndex === 0 ? 'LISTEN' : phaseIndex === 2 ? 'SYN_RCVD' : phaseIndex >= 3 ? 'ESTABLISHED' : 'LISTEN'}</span>
              </div>
            </div>

            {phaseIndex >= 4 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-tertiary/20 border border-tertiary/40 px-6 py-2 rounded-full z-20">
                <span className="text-tertiary font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" /> Connection Established
                </span>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
            </div>
          </div>

          {/* What's Happening Now — THE KEY LEARNING BOX */}
          <div className="bg-gradient-to-r from-primary/8 to-transparent p-5 rounded-xl border border-primary/15">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">What's Happening — {phase.label}</span>
            </div>
            <p className="text-sm text-white leading-relaxed">{phase.whatHappens}</p>
            <div className="mt-3 p-3 bg-surface-container-lowest/60 rounded-lg border border-white/5 flex items-start gap-2">
              <span className="text-base">💡</span>
              <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-white">Real-World:</strong> {phase.analogy}</p>
            </div>
          </div>

          {/* Sequence Visualization */}
          <div className="grid grid-cols-5 gap-2">
            {PHASES.map((p, i) => (
              <div key={p.id} className={`p-3 rounded-lg border text-center transition-all ${i === phaseIndex ? 'bg-primary/15 border-primary/30 scale-105' : i < phaseIndex ? 'bg-tertiary/5 border-tertiary/20' : 'bg-surface-container-highest/30 border-white/5'}`}>
                <p className={`text-[10px] font-bold uppercase ${i === phaseIndex ? 'text-primary' : i < phaseIndex ? 'text-tertiary' : 'text-slate-500'}`}>{p.label}</p>
                {i > 0 && i < PHASES.length - 1 && (
                  <div className="mt-1 text-[8px] font-mono text-slate-400">
                    {p.from === 'client' ? '→ C→S' : '← S→C'}
                  </div>
                )}
                {i < phaseIndex && <span className="material-symbols-outlined text-tertiary text-xs mt-1">check</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex bg-surface-container-highest rounded-xl overflow-hidden">
            <button onClick={() => setTab('learn')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 ${tab === 'learn' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">school</span> Learn
            </button>
            <button onClick={() => setTab('quiz')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 ${tab === 'quiz' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">quiz</span> Quiz
            </button>
          </div>

          {tab === 'learn' && (
            <>
              {/* Packet Inspector */}
              <div className="bg-surface-container-low rounded-xl flex flex-col overflow-hidden border border-white/5">
                <div className="px-5 py-3 bg-surface-container-high flex justify-between items-center border-b border-white/5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Packet Inspector</h3>
                  <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-tertiary animate-pulse' : 'bg-slate-500'}`} />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-52">
                  {PHASES.slice(1, phaseIndex + 1).map((p, i) => (
                    <div key={i} className={`bg-surface-container-highest/40 p-3 rounded border-l-2 ${p.from === 'client' ? 'border-primary' : 'border-tertiary'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[9px] font-black uppercase ${p.from === 'client' ? 'text-primary' : 'text-tertiary'}`}>{p.from === 'client' ? '→ C→S' : '← S→C'} [{p.flags}]</span>
                      </div>
                      <p className="font-mono text-[10px] text-on-secondary-container">FLAGS: [{p.flags}] SEQ: {p.seq} {p.ack !== '-' ? `ACK: ${p.ack}` : ''}</p>
                    </div>
                  ))}
                  {phaseIndex === 0 && <p className="text-slate-500 text-xs italic text-center py-6">Press ⏭ Step or ▶ Play to begin...</p>}
                </div>
              </div>

              {/* Key Takeaway */}
              <div className="p-4 rounded-xl border-l-4 border-primary bg-primary/5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Key Takeaway</span>
                <p className="text-xs text-on-secondary-container leading-relaxed">{phase.keyPoint}</p>
              </div>

              {/* Parameters */}
              <div className="bg-surface-container p-5 rounded-xl border border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Session Parameters</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[['MTU Size', '1500 B'], ['MSS', '1460 B'], ['RTT', '14ms'], ['Window', '64240']].map(([label, val]) => (
                    <div key={label} className="bg-surface-container-lowest p-3 rounded">
                      <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-on-surface">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'quiz' && (
            <div className="bg-surface-container-low rounded-xl p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-headline font-bold text-white mb-4">TCP Quiz</h3>
              {!quizDone ? (
                <>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(quizIdx / QUIZ.length) * 100}%` }} />
                  </div>
                  <p className="text-white text-sm mb-4 font-medium">{QUIZ[quizIdx].q}</p>
                  <div className="space-y-2 flex-1">
                    {QUIZ[quizIdx].options.map((opt, i) => {
                      let cls = 'bg-surface-container hover:bg-surface-container-high text-slate-300 border-white/5';
                      if (quizAnswer !== null) {
                        if (i === QUIZ[quizIdx].answer) cls = 'bg-tertiary/15 text-tertiary border-tertiary/30';
                        else if (quizAnswer === i) cls = 'bg-error/15 text-error border-error/30';
                        else cls = 'bg-surface-container text-slate-500 border-white/3 opacity-40';
                      }
                      return <button key={i} onClick={() => quizAnswer === null && checkQuiz(i)} className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${cls}`}>{opt}</button>;
                    })}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-5xl text-primary mb-3">emoji_events</span>
                  <p className="text-2xl font-bold text-white">{quizScore}/{QUIZ.length}</p>
                  <p className="text-slate-400 text-sm mt-2 mb-4">{quizScore === QUIZ.length ? 'Perfect!' : 'Review and try again.'}</p>
                  <button onClick={() => { setQuizIdx(0); setQuizAnswer(null); setQuizScore(0); setQuizDone(false); }} className="px-5 py-2 bg-primary text-on-primary font-bold rounded text-xs uppercase active:scale-95">Retry</button>
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
