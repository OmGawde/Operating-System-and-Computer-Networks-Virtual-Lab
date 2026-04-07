import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const DV_QUIZ = [
  { q: 'Distance Vector routing primarily uses which algorithm?', options: ['Dijkstra', 'Bellman-Ford', 'Prim\'s', 'Floyd-Warshall'], answer: 1, difficulty: 'easy' },
  { q: 'What information do routers share in Distance Vector?', options: ['Their entire routing table, but only with direct neighbors', 'Link state advertisements to all routers', 'Only the best route to the gateway', 'Nothing'], answer: 0, difficulty: 'easy' },
  { q: 'What is the "count-to-infinity" problem?', options: ['Too many routers in the network', 'Routing loops causing distance metrics to increase indefinitely', 'Infinite bandwidth allocation', 'Too many routes in the table'], answer: 1, difficulty: 'medium' },
  { q: 'RIP (Routing Information Protocol) uses Distance Vector. Its maximum valid hop count is...', options: ['8', '15', '32', '255'], answer: 1, difficulty: 'medium' },
  { q: 'What mechanism prevents routing loops by not sending a route back out the same interface it was learned from?', options: ['Split Horizon', 'Poison Reverse', 'Hold-down timer', 'Triggered Update'], answer: 0, difficulty: 'hard' },
  { q: 'What does "Route Poisoning" do?', options: ['Deletes the routing table', 'Advertises a failed route with an infinite metric (e.g., 16 in RIP) to immediately invalidate it', 'Changes the destination IP', 'Encrypts the router update'], answer: 1, difficulty: 'hard' },
  { q: 'Compared to Link-State, Distance Vector routing usually has...', options: ['Faster convergence', 'Slower convergence', 'Complete knowledge of network topology', 'Higher CPU requirements'], answer: 1, difficulty: 'medium' },
  { q: 'In Bellman-Ford, distance is calculated by:', options: ['Cost to neighbor + neighbor\'s cost to destination', 'Bandwidth * Delay', 'Shortest physical cable length', 'Number of switches crossed'], answer: 0, difficulty: 'medium' },
  { q: 'How often does RIP typically send full routing table updates by default?', options: ['Every 5 seconds', 'Every 30 seconds', 'Only when a change occurs', 'Every 5 minutes'], answer: 1, difficulty: 'hard' },
  { q: 'Distance Vector protocols "route by..."', options: ['Rumor (trusting neighbors)', 'Map (having a full topology)', 'Speed (measuring bandwidth)', 'MAC Address'], answer: 0, difficulty: 'easy' },
];

const ROUTERS = ['A', 'B', 'C', 'D'];
const LINKS = [
  { from: 'A', to: 'B', cost: 1 },
  { from: 'A', to: 'C', cost: 3 },
  { from: 'B', to: 'C', cost: 1 },
  { from: 'B', to: 'D', cost: 5 },
  { from: 'C', to: 'D', cost: 2 },
];

function initTables() {
  const tables = {};
  ROUTERS.forEach(r => {
    tables[r] = {};
    ROUTERS.forEach(d => { tables[r][d] = r === d ? 0 : Infinity; });
    LINKS.forEach(l => {
      if (l.from === r) tables[r][l.to] = l.cost;
      if (l.to === r) tables[r][l.from] = l.cost;
    });
  });
  return tables;
}

function dvIteration(tables) {
  const next = JSON.parse(JSON.stringify(tables));
  let changed = false;
  ROUTERS.forEach(r => {
    LINKS.forEach(l => {
      const neighbor = l.from === r ? l.to : l.to === r ? l.from : null;
      if (!neighbor) return;
      const linkCost = l.cost;
      ROUTERS.forEach(dest => {
        const newCost = linkCost + tables[neighbor][dest];
        if (newCost < next[r][dest]) { next[r][dest] = newCost; changed = true; }
      });
    });
  });
  return { tables: next, changed };
}

export default function DistanceVectorSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [tables, setTables] = useState(initTables);
  const [iteration, setIteration] = useState(0);
  const [converged, setConverged] = useState(false);
  const [tab, setTab] = useState('learn');
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setTables(prev => {
      const { tables: next, changed } = dvIteration(prev);
      if (!changed) { setConverged(true); setIsPlaying(false); return prev; }
      setIteration(i => i + 1);
      return next;
    });
  }, []);

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 2500 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setTables(initTables()); setIteration(0); setConverged(false); clearInterval(intervalRef.current); };
  const manualStep = () => { setIsPlaying(false); step(); };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="p-12 pb-6">
        <h1 className="text-6xl font-bold tracking-tighter text-on-surface mb-2 font-headline">Distance Vector Routing</h1>
        <p className="text-secondary max-w-xl text-lg leading-relaxed">Watch routing tables converge through Bellman-Ford iterations as each router shares information with neighbors.</p>
      </section>

      <section className="px-12 pb-12 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${converged ? 'bg-tertiary/20 text-tertiary border border-tertiary/30' : 'bg-primary/10 text-primary border border-primary/20'}`}>
              {converged ? '✓ Converged' : `Iteration ${iteration}`}
            </span>
            <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {ROUTERS.map(router => (
            <div key={router} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
              <div className="p-4 bg-surface-container-high flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">{router}</div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface">Router {router}</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">10.0.{ROUTERS.indexOf(router)}.1</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-white/5">
                    <th className="px-4 py-3">Dest</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {ROUTERS.map(dest => (
                    <tr key={dest} className={`border-b border-white/5 ${dest === router ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 font-bold text-white">→ {dest}</td>
                      <td className={`px-4 py-3 ${tables[router][dest] === Infinity ? 'text-slate-500' : tables[router][dest] === 0 ? 'text-primary' : 'text-tertiary'}`}>
                        {tables[router][dest] === Infinity ? '∞' : tables[router][dest]}
                      </td>
                      <td className="px-4 py-3">
                        {dest === router ? <span className="text-primary text-[10px]">Self</span> :
                        tables[router][dest] < Infinity ? <span className="text-tertiary text-[10px]">Reachable</span> :
                        <span className="text-slate-500 text-[10px]">Unknown</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-surface-container p-8 rounded-xl border border-white/5">
          <h3 className="text-lg font-headline font-bold text-on-surface mb-4">How Distance Vector Works</h3>
          <p className="text-sm text-on-secondary-container leading-relaxed">
            Each router periodically shares its routing table with its direct neighbors. Upon receiving a neighbor's table, a router updates its own using the Bellman-Ford equation:
            <code className="text-primary font-mono mx-2">{"D(dest) = min{ c(x,neighbor) + D_neighbor(dest) }"}</code>
            The algorithm converges when no more updates are needed.
          </p>
        </div>
      </section>
    </div>
  );
}
