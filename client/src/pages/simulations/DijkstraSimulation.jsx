import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';

const NODES = [
  { id: 'A', x: 80, y: 250, label: 'Source' },
  { id: 'B', x: 220, y: 100 },
  { id: 'C', x: 220, y: 400 },
  { id: 'D', x: 400, y: 250 },
  { id: 'E', x: 500, y: 100 },
  { id: 'F', x: 650, y: 250, label: 'Target' },
];

const EDGES = [
  { from: 'A', to: 'B', cost: 2 },
  { from: 'A', to: 'C', cost: 8 },
  { from: 'B', to: 'D', cost: 5 },
  { from: 'B', to: 'E', cost: 1 },
  { from: 'C', to: 'D', cost: 2 },
  { from: 'D', to: 'F', cost: 3 },
  { from: 'E', to: 'F', cost: 1 },
];

function dijkstra(source, target) {
  const dist = {}, prev = {}, visited = new Set(), steps = [];
  NODES.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null; });
  dist[source] = 0;

  while (visited.size < NODES.length) {
    let u = null;
    NODES.forEach(n => {
      if (!visited.has(n.id) && (u === null || dist[n.id] < dist[u])) u = n.id;
    });
    if (u === null || dist[u] === Infinity) break;
    visited.add(u);

    const neighbors = EDGES.filter(e => e.from === u || e.to === u);
    const updates = [];
    neighbors.forEach(e => {
      const v = e.from === u ? e.to : e.from;
      if (!visited.has(v)) {
        const alt = dist[u] + e.cost;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
          updates.push({ node: v, newCost: alt, via: u, oldCost: alt === dist[v] ? Infinity : dist[v] });
        }
      }
    });

    // Build human-readable explanation
    let explain = `Visit Node ${u} (cost ${dist[u]}). `;
    if (updates.length === 0) explain += 'No neighbors need updating.';
    else explain += updates.map(u2 => `Found cheaper path to ${u2.node} via ${u}: cost ${u2.newCost} (was ${u2.oldCost === Infinity ? '∞' : u2.oldCost}).`).join(' ');

    // Build the "thinking" process
    let thinking = `Rule: Pick the unvisited node with the SMALLEST known distance. Currently that's Node ${u} with distance ${dist[u]}.`;
    if (updates.length > 0) {
      thinking += ` Then check all neighbors: `;
      neighbors.forEach(e => {
        const v = e.from === u ? e.to : e.from;
        if (!visited.has(v)) {
          thinking += `dist[${u}](${dist[u]}) + edge(${e.cost}) = ${dist[u] + e.cost} vs current dist[${v}](${dist[v] === Infinity ? '∞' : dist[v]}). `;
        }
      });
    }

    steps.push({
      visiting: u,
      dist: { ...dist },
      visited: new Set(visited),
      updates,
      prev: { ...prev },
      explain,
      thinking,
    });
  }

  const path = [];
  let curr = target;
  while (curr) { path.unshift(curr); curr = prev[curr]; }
  return { steps, path, finalDist: dist };
}

const QUIZ = [
  { q: 'What is the main purpose of Dijkstra\'s algorithm in networking?', options: ['To encrypt data', 'To calculate the absolute highest bandwidth path', 'To find the shortest path from a source to all other nodes', 'To balance network load evenly'], answer: 2, difficulty: 'easy' },
  { q: 'Dijkstra\'s algorithm always picks the unvisited node with the...', options: ['Largest distance', 'Smallest known distance', 'Most edges', 'Fewest neighbors'], answer: 1, difficulty: 'easy' },
  { q: 'Can Dijkstra\'s algorithm handle graphs with negative edge weights?', options: ['Yes, always', 'No — use Bellman-Ford instead', 'Only on directed graphs', 'Yes, but it is slower'], answer: 1, difficulty: 'medium' },
  { q: 'Which routing protocol relies heavily on an implementation of Dijkstra\'s algorithm?', options: ['RIP (Routing Information Protocol)', 'OSPF (Open Shortest Path First)', 'BGP (Border Gateway Protocol)', 'EIGRP'], answer: 1, difficulty: 'medium' },
  { q: 'What is the initial distance value assigned to the source node?', options: ['Infinity', '1', '0', '-1'], answer: 2, difficulty: 'easy' },
  { q: 'What is the initial distance value assigned to all non-source nodes?', options: ['0', '100', 'Infinity', 'Null'], answer: 2, difficulty: 'easy' },
  { q: 'What data structure is typically used to optimize finding the minimum distance node?', options: ['Stack', 'Queue', 'Min-Priority Queue / Min-Heap', 'Hash Table'], answer: 2, difficulty: 'hard' },
  { q: 'If all edge weights in a graph are 1, Dijkstra\'s algorithm behaves identically to:', options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'A* Search', 'Binary Search'], answer: 1, difficulty: 'hard' },
  { q: 'What happens when Dijkstra\'s algorithm visits a target node?', options: ['It stops immediately (if looking for a single path)', 'It restarts from that node', 'It changes the node weight to 0', 'It disconnects the node'], answer: 0, difficulty: 'medium' },
  { q: 'In an OSPF network, what represents the "edges" and "weights" graph?', options: ['IP Addresses and Subnets', 'Routers and Link Costs/Metrics', 'Switches and MAC addresses', 'Servers and CPU usage'], answer: 1, difficulty: 'hard' },
];

export default function DijkstraSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [source, setSource] = useState('A');
  const [target, setTarget] = useState('F');
  const [stepIndex, setStepIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('trace'); // 'trace' | 'quiz'
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => { setResult(dijkstra(source, target)); setStepIndex(-1); }, [source, target]);

  const step = useCallback(() => {
    if (!result) return;
    setStepIndex(prev => { if (prev >= result.steps.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
  }, [result]);

  const manualStep = () => { setIsPlaying(false); step(); };

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 2500 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setStepIndex(-1); clearInterval(intervalRef.current); };
  const currentStep = stepIndex >= 0 && result ? result.steps[stepIndex] : null;
  const isOnPath = (id) => result && stepIndex === result.steps.length - 1 && result.path.includes(id);
  const isPathEdge = (from, to) => {
    if (!result || stepIndex < result.steps.length - 1) return false;
    const p = result.path;
    for (let i = 0; i < p.length - 1; i++) if ((p[i] === from && p[i + 1] === to) || (p[i] === to && p[i + 1] === from)) return true;
    return false;
  };
  const getNode = (id) => NODES.find(n => n.id === id);

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
      <section className="p-8 pb-4">
        <h1 className="text-5xl font-bold tracking-tighter text-on-surface mb-1 font-headline">Dijkstra's Shortest Path</h1>
        <p className="text-secondary max-w-2xl text-base leading-relaxed">Step through the algorithm to understand how routers find the cheapest path. Click <strong className="text-primary">⏭ Step</strong> to advance one iteration at a time.</p>
      </section>

      <section className="px-8 pb-8 grid grid-cols-12 gap-6 flex-1">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          {/* Graph Canvas */}
          <div className="relative bg-surface-container rounded-xl overflow-hidden min-h-[450px] flex-1">
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7bd0ff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 750 500">
              {EDGES.map((e, i) => {
                const from = getNode(e.from), to = getNode(e.to);
                const onPath = isPathEdge(e.from, e.to);
                return (
                  <g key={i}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={onPath ? '#7bd0ff' : '#2d3449'} strokeWidth={onPath ? 6 : 3} />
                    {onPath && <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#7bd0ff" strokeWidth={6} className="animate-pulse" />}
                    {/* Edge weight label with background */}
                    <rect x={(from.x + to.x) / 2 - 8} y={(from.y + to.y) / 2 - 18} width="22" height="16" rx="4" fill="#131b2e" stroke="#45464d" strokeWidth="1" />
                    <text x={(from.x + to.x) / 2 + 3} y={(from.y + to.y) / 2 - 6} textAnchor="middle" fill={onPath ? '#7bd0ff' : '#909097'} fontSize="11" fontWeight="bold" fontFamily="monospace">{e.cost}</text>
                  </g>
                );
              })}
              {NODES.map(n => {
                const isVisited = currentStep?.visited.has(n.id);
                const isVisiting = currentStep?.visiting === n.id;
                const onFinalPath = isOnPath(n.id);
                const isSource2 = n.id === source;
                const isTarget2 = n.id === target;
                let fill = '#2d3449', stroke = '#45464d', textFill = '#c6c6cd';
                if (isSource2) { fill = '#7bd0ff'; stroke = '#7bd0ff'; textFill = '#00354a'; }
                else if (isTarget2) { fill = '#4ae176'; stroke = '#4ae176'; textFill = '#003915'; }
                else if (onFinalPath) { fill = '#7bd0ff'; stroke = '#7bd0ff'; textFill = '#00354a'; }
                else if (isVisiting) { fill = '#008abb'; stroke = '#7bd0ff'; textFill = '#fff'; }
                else if (isVisited) { fill = '#222a3d'; stroke = '#7bd0ff'; }
                const radius = isSource2 || isTarget2 ? 28 : 22;
                return (
                  <g key={n.id}>
                    {(isVisiting) && <circle cx={n.x} cy={n.y} r={radius + 10} fill="none" stroke="#7bd0ff" strokeWidth="2" opacity="0.4" className="animate-pulse" />}
                    {(isSource2 || isTarget2 || onFinalPath) && <circle cx={n.x} cy={n.y} r={radius + 6} fill="none" stroke={stroke} strokeWidth="2" opacity="0.3" />}
                    <circle cx={n.x} cy={n.y} r={radius} fill={fill} stroke={stroke} strokeWidth="2" />
                    <text x={n.x} y={n.y + 5} textAnchor="middle" fill={textFill} fontWeight="bold" fontSize="16">{n.id}</text>
                    {n.label && <text x={n.x} y={n.y + radius + 18} textAnchor="middle" fill={isTarget2 ? '#4ae176' : '#7bd0ff'} fontSize="10" fontWeight="bold" className="uppercase">{n.label}</text>}
                    {currentStep && (
                      <g>
                        <rect x={n.x - 14} y={n.y - radius - 22} width="28" height="16" rx="4" fill="#0b1326" stroke={isVisited ? '#7bd0ff40' : '#45464d40'} strokeWidth="1" />
                        <text x={n.x} y={n.y - radius - 10} textAnchor="middle" fill={isVisited ? '#7bd0ff' : '#909097'} fontSize="10" fontWeight="bold" fontFamily="monospace">
                          {currentStep.dist[n.id] === Infinity ? '∞' : currentStep.dist[n.id]}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* "What's Happening" overlay */}
            {currentStep && (
              <div className="absolute top-4 left-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-xl border border-primary/20 shadow-2xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary shrink-0">auto_stories</span>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Step {stepIndex + 1}: What's Happening</p>
                    <p className="text-sm text-white leading-relaxed">{currentStep.explain}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed italic">{currentStep.thinking}</p>
                  </div>
                </div>
              </div>
            )}
            {stepIndex < 0 && (
              <div className="absolute top-4 left-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">school</span>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">How Dijkstra Works</p>
                    <p className="text-sm text-slate-300 leading-relaxed">The algorithm finds the shortest path by repeatedly selecting the unvisited node with the <strong className="text-white">smallest known distance</strong>, then updating its neighbors. Press <strong className="text-primary">⏭ Step</strong> to advance one iteration, or ▶ to auto-play.</p>
                    <div className="flex gap-4 mt-3 text-[10px]">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#7bd0ff]" /> Source</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#4ae176]" /> Target</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#008abb]" /> Visiting</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#222a3d] border border-[#7bd0ff]" /> Visited</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          {/* Tabs */}
          <div className="flex bg-surface-container-highest rounded-xl overflow-hidden">
            <button onClick={() => setTab('trace')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tab === 'trace' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">table_chart</span> Live Table
            </button>
            <button onClick={() => setTab('quiz')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tab === 'quiz' ? 'text-primary bg-surface-container-low' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">quiz</span> Quiz
            </button>
          </div>

          {tab === 'trace' && (
            <>
              {/* Live Routing Table */}
              <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 bg-surface-container-high border-b border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface">Live Routing Table</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Watch costs update as the algorithm visits each node.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-white/5">
                        <th className="px-4 py-3">Dest</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Via</th><th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {NODES.filter(n => n.id !== source).map(n => {
                        const cost = currentStep ? currentStep.dist[n.id] : Infinity;
                        const via = currentStep?.prev[n.id] || '-';
                        const visited = currentStep?.visited.has(n.id);
                        const onPath = isOnPath(n.id);
                        return (
                          <tr key={n.id} className={`border-b border-white/5 ${onPath ? 'bg-tertiary/5' : visited ? 'bg-primary/5' : ''}`}>
                            <td className={`px-4 py-3 font-bold ${onPath ? 'text-tertiary' : 'text-white'}`}>{n.id}</td>
                            <td className={`px-4 py-3 ${onPath ? 'text-tertiary font-black' : 'text-primary'}`}>{cost === Infinity ? '∞' : cost}</td>
                            <td className="px-4 py-3 text-slate-400">{via === null ? '-' : via === '-' ? '-' : via}</td>
                            <td className="px-4 py-3">{visited ? <span className="text-tertiary text-[10px] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary" />Done</span> : <span className="text-slate-500 text-[10px]">Pending</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Config + Result */}
              <div className="bg-surface-container-highest rounded-xl p-5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">Configure</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Source</label>
                    <select value={source} onChange={e => { setSource(e.target.value); reset(); }} className="w-full bg-surface-container border-0 rounded text-white text-sm py-2 px-3">
                      {NODES.map(n => <option key={n.id} value={n.id}>Node {n.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target</label>
                    <select value={target} onChange={e => { setTarget(e.target.value); reset(); }} className="w-full bg-surface-container border-0 rounded text-white text-sm py-2 px-3">
                      {NODES.filter(n => n.id !== source).map(n => <option key={n.id} value={n.id}>Node {n.id}</option>)}
                    </select>
                  </div>
                </div>
                {result && stepIndex === result.steps.length - 1 && (
                  <div className="mt-4 p-4 bg-tertiary/10 rounded-lg border border-tertiary/20">
                    <p className="text-tertiary text-xs font-bold uppercase tracking-widest mb-1">✓ Shortest Path Found</p>
                    <p className="text-white font-mono text-sm">{result.path.join(' → ')}</p>
                    <p className="text-slate-400 text-xs mt-1">Total Cost: <span className="text-tertiary font-bold">{result.finalDist[target]}</span></p>
                  </div>
                )}
              </div>

              {/* Learning Card */}
              <div className="bg-gradient-to-br from-[#171f33] to-[#0b1326] p-5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-sm">emoji_objects</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Why This Matters</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">OSPF (Open Shortest Path First) routers use Dijkstra's algorithm to compute the shortest path tree. Every router builds a complete map of the network (link-state database) and independently runs this algorithm to determine the best routes.</p>
                <p className="text-xs text-slate-400 mt-2 italic">Unlike Distance Vector (RIP), OSPF converges faster and avoids the count-to-infinity problem.</p>
              </div>
            </>
          )}

          {tab === 'quiz' && (
            <div className="bg-surface-container-low rounded-xl p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-headline font-bold text-white mb-4">Dijkstra Quiz</h3>
              {!quizDone ? (
                <>
                  <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(quizIdx / QUIZ.length) * 100}%` }} />
                  </div>
                  <p className="text-white text-sm mb-4 font-medium">{QUIZ[quizIdx].q}</p>
                  <div className="space-y-2">
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
        </div>
      </section>
    </div>
  );
}
