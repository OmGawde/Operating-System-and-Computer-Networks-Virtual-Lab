import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';

const LAYERS = [
  { num: 7, name: 'Application', pdu: 'Data', icon: 'language', protocols: 'HTTP, FTP, DNS, SMTP', desc: 'Network process to application', color: '#7bd0ff',
    realWorld: '📧 Think of writing a letter — you compose the message content at this layer.',
    whatHappens: 'The application generates user data (e.g., a web page request). No headers are added yet — this is just raw user data.',
    keyPoint: 'This is where network-aware applications operate. Browsers, email clients, and file transfer programs all live here.',
    example: 'When you type "google.com" in your browser, the HTTP GET request is created at this layer.'
  },
  { num: 6, name: 'Presentation', pdu: 'Data', icon: 'lock', protocols: 'SSL, TLS, JPEG, ASCII', desc: 'Data representation & encryption', color: '#6bc4f0',
    realWorld: '🔒 Like translating your letter into a secret code so only the recipient can read it.',
    whatHappens: 'Data is formatted, compressed, or encrypted. Character encoding (ASCII/Unicode) and encryption (SSL/TLS) happen here.',
    keyPoint: 'This layer ensures that data sent by one system can be understood by another, regardless of internal format differences.',
    example: 'HTTPS encryption happens here — your credit card number gets encrypted before transmission.'
  },
  { num: 5, name: 'Session', pdu: 'Data', icon: 'forum', protocols: 'NetBIOS, RPC, PPTP', desc: 'Interhost communication', color: '#5bb8e0',
    realWorld: '📞 Like establishing a phone call — session manages the "conversation" between two devices.',
    whatHappens: 'A session (logical connection) is established, managed, and terminated. Handles authentication and reconnection.',
    keyPoint: 'Sessions enable full-duplex, half-duplex, or simplex communication. They handle checkpointing for long transfers.',
    example: 'When you log into a website, the session layer maintains your login state across multiple page requests.'
  },
  { num: 4, name: 'Transport', pdu: 'Segment', icon: 'swap_calls', protocols: 'TCP, UDP', desc: 'End-to-end connections & reliability', color: '#4bacd0',
    realWorld: '📦 Like splitting a large package into numbered boxes — each box is a segment that can be tracked and reordered.',
    whatHappens: 'Data is divided into SEGMENTS. TCP adds source/destination port numbers, sequence numbers, and checksums for reliable delivery.',
    keyPoint: 'The first layer where HEADERS are added! TCP header adds 20+ bytes including ports and sequence numbers.',
    example: 'Port 80 (HTTP) or Port 443 (HTTPS) are added here. TCP ensures no data is lost during transit.'
  },
  { num: 3, name: 'Network', pdu: 'Packet', icon: 'router', protocols: 'IP, ICMP, OSPF, BGP', desc: 'Logical addressing & routing', color: '#3ba0c0',
    realWorld: '🗺️ Like writing the destination address on each box — IP addresses determine WHERE to send the data.',
    whatHappens: 'An IP HEADER is prepended, creating a PACKET. Source and destination IP addresses, TTL, and protocol type are added.',
    keyPoint: 'IP addresses provide logical addressing across networks. Routers use this layer to make forwarding decisions.',
    example: 'Your packet gets source IP 192.168.1.5 and destination IP 142.250.185.14 (Google\'s IP). Routers use this to route across the internet.'
  },
  { num: 2, name: 'Data Link', pdu: 'Frame', icon: 'settings_ethernet', protocols: 'Ethernet, Wi-Fi, PPP', desc: 'Physical addressing (MAC)', color: '#2b94b0',
    realWorld: '🏷️ Like labeling each box with the courier\'s route — MAC addresses handle delivery on the LOCAL network only.',
    whatHappens: 'A FRAME HEADER (source/dest MAC addresses, type) and FRAME TRAILER (FCS checksum) are added around the packet.',
    keyPoint: 'MAC addresses are hardware addresses burned into your NIC. Unlike IP, they only matter for the next hop on the local network.',
    example: 'Your frame has src MAC 00:1A:2B:3C:4D:5E and dest MAC AA:BB:CC:DD:EE:FF (your router\'s MAC). FCS trailer detects bit errors.'
  },
  { num: 1, name: 'Physical', pdu: 'Bits', icon: 'bolt', protocols: 'Cables, Fiber, Wi-Fi Radio', desc: 'Binary transmission', color: '#1b88a0',
    realWorld: '🚚 Like the actual truck carrying the boxes — this is the physical medium (cables, radio waves) carrying 1s and 0s.',
    whatHappens: 'The frame is converted into a stream of BITS (1s and 0s) and transmitted over the physical medium via electrical signals, light pulses, or radio waves.',
    keyPoint: 'This layer deals with voltages, pin layouts, cable types, and bit timing. No headers — just raw bits.',
    example: 'On Ethernet, 1s and 0s are sent as voltage changes. On fiber optic, they\'re light pulses. On Wi-Fi, they\'re radio waves.'
  },
];

const QUIZ_QUESTIONS = [
  { q: 'Which layer adds IP addresses to the data?', options: ['Transport', 'Network', 'Data Link', 'Application'], answer: 1, layer: 3 },
  { q: 'What is the PDU (Protocol Data Unit) at the Transport layer?', options: ['Data', 'Packet', 'Segment', 'Frame'], answer: 2, layer: 4 },
  { q: 'Which layer is responsible for MAC addressing?', options: ['Physical', 'Data Link', 'Network', 'Transport'], answer: 1, layer: 2 },
  { q: 'Encapsulation means...', options: ['Removing headers', 'Adding headers as data goes DOWN the stack', 'Converting data to binary', 'Routing packets'], answer: 1, layer: 7 },
  { q: 'What does the FCS (Frame Check Sequence) do?', options: ['Encrypts the frame', 'Detects bit errors in the frame', 'Adds port numbers', 'Assigns IP addresses'], answer: 1, layer: 2 },
  { q: 'Which layer converts frames into electrical signals or light pulses?', options: ['Session', 'Physical', 'Data Link', 'Presentation'], answer: 1, layer: 1 },
];

export default function OsiSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [currentLayer, setCurrentLayer] = useState(7);
  const [direction, setDirection] = useState('down');
  const [tab, setTab] = useState('learn'); // 'learn' | 'quiz'
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setCurrentLayer(prev => {
      if (direction === 'down') {
        if (prev <= 1) { setDirection('up'); return 1; }
        return prev - 1;
      } else {
        if (prev >= 7) { setDirection('down'); return 7; }
        return prev + 1;
      }
    });
  }, [direction]);

  const manualStep = () => { setIsPlaying(false); step(); };

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 1800 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setCurrentLayer(7); setDirection('down'); clearInterval(intervalRef.current); };
  const activeLayer = LAYERS.find(l => l.num === currentLayer);

  const checkAnswer = (idx) => {
    setSelectedAnswer(idx);
    if (idx === QUIZ_QUESTIONS[quizIndex].answer) setScore(s => s + 1);
    setTimeout(() => {
      if (quizIndex < QUIZ_QUESTIONS.length - 1) { setQuizIndex(i => i + 1); setSelectedAnswer(null); }
      else setQuizDone(true);
    }, 1200);
  };
  const resetQuiz = () => { setQuizIndex(0); setSelectedAnswer(null); setScore(0); setQuizDone(false); };

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-[300px_1fr_420px] overflow-hidden">
      {/* LEFT: Layer Stack */}
      <section className="bg-surface-container-low p-5 overflow-y-auto border-r border-white/5">
        <div className="mb-6">
          <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em]">Framework</span>
          <h1 className="text-2xl font-black font-headline text-white mt-1 leading-none">OSI STACK</h1>
          <p className="text-[11px] text-on-secondary-container/60 mt-2 leading-relaxed">Click any layer to explore it. Use ▶ to auto-play or ⏭ to step through manually.</p>
        </div>
        <div className="space-y-2">
          {LAYERS.map(layer => (
            <div
              key={layer.num}
              onClick={() => { setCurrentLayer(layer.num); setIsPlaying(false); }}
              className={`group relative p-3 rounded cursor-pointer transition-all ${
                currentLayer === layer.num
                  ? 'bg-surface-container-highest border-l-4 shadow-lg shadow-primary/5'
                  : 'bg-surface-container hover:bg-surface-container-high hover:translate-x-1'
              }`}
              style={{ borderColor: currentLayer === layer.num ? layer.color : undefined }}
            >
              <div className="flex justify-between items-start">
                <span className={`font-mono text-[10px] ${currentLayer === layer.num ? 'text-primary' : 'text-slate-500'}`}>L{layer.num}</span>
                <span className={`material-symbols-outlined text-sm ${currentLayer === layer.num ? 'text-primary' : 'text-slate-500'}`}>{layer.icon}</span>
              </div>
              <h3 className={`font-headline font-bold text-sm uppercase mt-0.5 tracking-tight ${currentLayer === layer.num ? 'text-white' : 'text-slate-300'}`}>{layer.name}</h3>
              <p className="text-[10px] text-on-secondary-container/50 mt-0.5">{layer.desc}</p>
              {/* Mini header indicator */}
              {layer.num <= 4 && (
                <div className="mt-2 flex gap-1">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/60 font-bold uppercase">+ Header</span>
                  {layer.num <= 2 && <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/60 font-bold uppercase">+ Trailer</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CENTER: Simulation Stage */}
      <section className="bg-surface-container flex flex-col relative overflow-y-auto">
        <div className="p-6 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black font-headline text-white tracking-tighter uppercase">Packet Journey</h2>
            <p className="text-slate-400 mt-1.5 flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-tertiary animate-pulse' : 'bg-slate-500'}`} />
              {isPlaying ? `${direction === 'down' ? 'Encapsulating ↓' : 'Decapsulating ↑'} — ${activeLayer?.name}` : 'Paused — Click ⏭ to step or ▶ to auto-play'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded bg-primary/10 border border-primary/20">
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{direction === 'down' ? 'SENDER ↓' : 'RECEIVER ↑'}</span>
            </div>
            <div className="px-3 py-1 rounded bg-surface-container-highest border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PDU: {activeLayer?.pdu}</span>
            </div>
          </div>
        </div>

        {/* Main Visual */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-4 relative">
          {/* Animated Packet Box */}
          <div className="relative w-96 h-44 flex items-center justify-center mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden" style={{ borderColor: `${activeLayer?.color}40` }}>
              <div className="w-full py-1 px-4 border-b flex justify-between items-center" style={{ background: `${activeLayer?.color}15`, borderColor: `${activeLayer?.color}30` }}>
                <span className="text-[9px] font-bold uppercase" style={{ color: activeLayer?.color }}>{direction === 'down' ? 'Encapsulation' : 'Decapsulation'}</span>
                <span className="font-mono text-[9px]" style={{ color: `${activeLayer?.color}80` }}>Layer {currentLayer}</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-4xl" style={{ color: activeLayer?.color, fontVariationSettings: "'FILL' 1" }}>package_2</span>
                <div className="px-4 py-1 bg-surface-container-lowest rounded-full border border-white/10">
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-widest">{activeLayer?.pdu}</span>
                </div>
              </div>
              <div className="w-full h-1.5" style={{ background: `${activeLayer?.color}15` }}>
                <div className="h-full transition-all duration-500 rounded-r" style={{ width: `${((8 - currentLayer) / 7) * 100}%`, background: activeLayer?.color, boxShadow: `0 0 12px ${activeLayer?.color}` }} />
              </div>
            </div>
          </div>

          {/* Encapsulation Visualization — The Growing Packet */}
          <div className="w-full max-w-lg">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Packet Structure at Layer {currentLayer}</p>
            <div className="flex items-center justify-center gap-0.5">
              {direction === 'down' && currentLayer <= 2 && <div className="px-2 py-3 rounded-l text-[9px] font-bold border transition-all animate-fade-in" style={{ color: '#2b94b0', background: '#2b94b015', borderColor: '#2b94b040' }}>Frame<br/>Hdr</div>}
              {direction === 'down' && currentLayer <= 3 && <div className="px-2 py-3 text-[9px] font-bold border transition-all animate-fade-in" style={{ color: '#3ba0c0', background: '#3ba0c015', borderColor: '#3ba0c040' }}>IP<br/>Hdr</div>}
              {direction === 'down' && currentLayer <= 4 && <div className="px-2 py-3 text-[9px] font-bold border transition-all animate-fade-in" style={{ color: '#4bacd0', background: '#4bacd015', borderColor: '#4bacd040' }}>TCP<br/>Hdr</div>}
              <div className="px-6 py-3 bg-primary/15 border-2 border-primary/30 text-primary text-sm font-bold rounded-sm">DATA</div>
              {direction === 'down' && currentLayer <= 2 && <div className="px-2 py-3 rounded-r text-[9px] font-bold border transition-all animate-fade-in" style={{ color: '#2b94b0', background: '#2b94b015', borderColor: '#2b94b040' }}>FCS</div>}
            </div>
            {direction === 'up' && <p className="text-center text-tertiary text-[10px] font-bold mt-2 animate-pulse">↑ Stripping headers — Layer {currentLayer}</p>}
          </div>

          {/* "What's Happening Now" — THE KEY LEARNING FEATURE */}
          <div className="w-full max-w-lg mt-6 bg-gradient-to-r from-primary/5 to-transparent p-5 rounded-xl border border-primary/15">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">What's Happening at Layer {currentLayer}</span>
            </div>
            <p className="text-sm text-on-secondary-container leading-relaxed">{activeLayer?.whatHappens}</p>
            <div className="mt-3 p-3 bg-surface-container-lowest/60 rounded-lg border border-white/5">
              <p className="text-xs text-slate-400 leading-relaxed"><span className="text-white font-bold">Example: </span>{activeLayer?.example}</p>
            </div>
          </div>

          {/* Path Visualizer */}
          <div className="mt-6 w-full max-w-lg h-12 relative flex items-center justify-between">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent top-1/2" />
            <div className="relative z-10 w-10 h-10 rounded-full bg-surface-container-highest border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-primary text-sm">computer</span>
            </div>
            {/* Animated dot */}
            <div className="absolute z-10 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_#7bd0ff] transition-all duration-500"
              style={{ left: `calc(${direction === 'down' ? ((7 - currentLayer) / 6) * 80 + 10 : ((currentLayer - 1) / 6) * 80 + 10}%)` }} />
            <div className="relative z-10 w-10 h-10 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400 text-sm">dns</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="sticky bottom-0 bg-gradient-to-t from-surface-container via-surface-container to-transparent p-4 flex justify-center">
          <SimulationControls
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onStep={manualStep}
            onReset={reset}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>
      </section>

      {/* RIGHT: Info Panel with Tabs */}
      <section className="bg-surface-container-low overflow-y-auto border-l border-white/5 flex flex-col">
        {/* Tab Switcher */}
        <div className="flex bg-surface-container-lowest border-b border-white/5 sticky top-0 z-10">
          <button onClick={() => setTab('learn')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tab === 'learn' ? 'text-primary border-b-2 border-primary bg-surface-container-low' : 'text-slate-500 hover:text-white'}`}>
            <span className="material-symbols-outlined text-sm">school</span> Learn
          </button>
          <button onClick={() => setTab('quiz')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tab === 'quiz' ? 'text-primary border-b-2 border-primary bg-surface-container-low' : 'text-slate-500 hover:text-white'}`}>
            <span className="material-symbols-outlined text-sm">quiz</span> Self-Test
          </button>
        </div>

        {tab === 'learn' && (
          <div className="p-6 space-y-6 flex-1">
            {/* Layer Deep Dive */}
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <span className="material-symbols-outlined text-5xl text-white">{activeLayer?.icon}</span>
              </div>
              <h4 className="font-headline font-bold uppercase tracking-widest text-xs" style={{ color: activeLayer?.color }}>{activeLayer?.name} Layer</h4>
              <p className="text-white font-medium text-base mt-2 leading-tight">{activeLayer?.desc}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Protocols</span>
                  <div className="flex flex-wrap gap-1">
                    {activeLayer?.protocols.split(', ').map(p => (
                      <span key={p} className="px-2 py-0.5 bg-surface-container text-[10px] text-slate-300 rounded font-mono border border-white/5">{p}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">PDU</span>
                  <span className="font-bold text-sm uppercase" style={{ color: activeLayer?.color }}>{activeLayer?.pdu}</span>
                </div>
              </div>
            </div>

            {/* Real-World Analogy */}
            <div className="bg-gradient-to-br from-[#171f33] to-[#0b1326] p-5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-sm">emoji_objects</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Real-World Analogy</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{activeLayer?.realWorld}</p>
            </div>

            {/* Key Point */}
            <div className="p-5 rounded-xl border-l-4" style={{ borderColor: activeLayer?.color, background: `${activeLayer?.color}08` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm" style={{ color: activeLayer?.color }}>priority_high</span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: activeLayer?.color }}>Key Takeaway</span>
              </div>
              <p className="text-sm text-on-secondary-container leading-relaxed">{activeLayer?.keyPoint}</p>
            </div>

            {/* Encapsulation Table */}
            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Encapsulation Map</h5>
              <div className="bg-surface-container-highest/40 rounded-lg overflow-hidden">
                {LAYERS.map(l => (
                  <div key={l.num} className={`flex items-center justify-between px-4 py-2 border-b border-white/3 transition-all ${l.num === currentLayer ? 'bg-primary/10' : 'hover:bg-white/3'}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: l.num === currentLayer ? `${l.color}30` : 'transparent', color: l.num === currentLayer ? l.color : '#64748b' }}>{l.num}</span>
                      <span className={`text-[11px] font-medium ${l.num === currentLayer ? 'text-white' : 'text-slate-400'}`}>{l.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${l.num === currentLayer ? '' : 'text-slate-500'}`} style={{ color: l.num === currentLayer ? l.color : undefined }}>{l.pdu}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'quiz' && (
          <div className="p-6 space-y-6 flex-1 flex flex-col">
            <div>
              <h3 className="text-lg font-headline font-bold text-white">Test Your Knowledge</h3>
              <p className="text-xs text-on-secondary-container mt-1">Answer {QUIZ_QUESTIONS.length} questions to check your understanding of the OSI model.</p>
            </div>

            {!quizDone ? (
              <>
                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((quizIndex) / QUIZ_QUESTIONS.length) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{quizIndex + 1}/{QUIZ_QUESTIONS.length}</span>
                </div>

                {/* Question */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-white/5 flex-1">
                  <p className="text-white font-medium text-base leading-relaxed mb-6">{QUIZ_QUESTIONS[quizIndex].q}</p>
                  <div className="space-y-3">
                    {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = i === QUIZ_QUESTIONS[quizIndex].answer;
                      let cls = 'bg-surface-container hover:bg-surface-container-high text-slate-300 border-white/5 hover:border-primary/30';
                      if (selectedAnswer !== null) {
                        if (isCorrect) cls = 'bg-tertiary/15 text-tertiary border-tertiary/30';
                        else if (isSelected) cls = 'bg-error/15 text-error border-error/30';
                        else cls = 'bg-surface-container text-slate-500 border-white/3 opacity-50';
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => selectedAnswer === null && checkAnswer(i)}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${cls}`}
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-container-lowest text-[10px] font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                          <span className="text-sm">{opt}</span>
                          {selectedAnswer !== null && isCorrect && <span className="material-symbols-outlined text-tertiary ml-auto text-sm">check_circle</span>}
                          {selectedAnswer !== null && isSelected && !isCorrect && <span className="material-symbols-outlined text-error ml-auto text-sm">cancel</span>}
                        </button>
                      );
                    })}
                  </div>
                  {selectedAnswer !== null && (
                    <div className={`mt-4 p-3 rounded-lg text-xs ${selectedAnswer === QUIZ_QUESTIONS[quizIndex].answer ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                      {selectedAnswer === QUIZ_QUESTIONS[quizIndex].answer
                        ? '✓ Correct! Great understanding.'
                        : `✗ The correct answer is: ${QUIZ_QUESTIONS[quizIndex].options[QUIZ_QUESTIONS[quizIndex].answer]}`}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-6xl text-primary mb-4">emoji_events</span>
                <h3 className="text-3xl font-black font-headline text-white mb-2">Quiz Complete!</h3>
                <p className="text-xl text-primary font-bold mb-1">{score}/{QUIZ_QUESTIONS.length} Correct</p>
                <p className="text-slate-400 text-sm mb-6">{score === QUIZ_QUESTIONS.length ? 'Perfect score! You\'ve mastered the OSI model.' : score >= 4 ? 'Great job! Review the layers you missed.' : 'Keep studying! Try using the Learn tab to review each layer.'}</p>
                <button onClick={resetQuiz} className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg text-sm uppercase tracking-widest active:scale-95 transition-all">Retake Quiz</button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
