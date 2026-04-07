import { useState, useEffect, useRef, useCallback } from 'react';
import SimulationControls from '../../components/SimulationControls';
import QuizPanel from '../../components/QuizPanel';

const DNS_QUIZ = [
  { q: 'DNS primarily translates...', options: ['IP addresses to MAC addresses', 'Domain names to IP addresses', 'Ports to services', 'URLs to file paths'], answer: 1, difficulty: 'easy' },
  { q: 'How many root DNS server IP addresses exist?', options: ['7', '13', '26', '256'], answer: 1, difficulty: 'medium' },
  { q: 'DNS queries typically use which transport protocol and port?', options: ['TCP 80', 'UDP 53', 'ICMP', 'TCP 443'], answer: 1, difficulty: 'medium' },
  { q: 'What is the purpose of TTL in DNS caching?', options: ['Time to Live — how long a record is kept in cache before querying again', 'Total Transfer Length', 'Timeout Latency', 'Transport Layer'], answer: 0, difficulty: 'easy' },
  { q: 'Which DNS record type maps a domain to an IPv4 address?', options: ['MX', 'CNAME', 'A', 'AAAA'], answer: 2, difficulty: 'easy' },
  { q: 'Which DNS record type maps a domain to an IPv6 address?', options: ['A', 'AAAA', 'MX', 'TXT'], answer: 1, difficulty: 'easy' },
  { q: 'What does a CNAME record do?', options: ['Maps a name to an IP', 'Maps an alias name to the true canonical domain name', 'Handles email routing', 'Stores text data for verification'], answer: 1, difficulty: 'medium' },
  { q: 'What is a Reverse DNS lookup?', options: ['Translating a domain to an IP', 'Translating an IP address back to a hostname (PTR record)', 'Finding the MAC address', 'A DNS leak'], answer: 1, difficulty: 'hard' },
  { q: 'Which step happens first when you type example.com in a browser?', options: ['Browser asks Root DNS', 'Browser checks local OS DNS cache', 'Browser asks the TLD server', 'Browser asks Authoritative server'], answer: 1, difficulty: 'medium' },
  { q: 'What is an Authoritative Name Server?', options: ['Google\'s 8.8.8.8 server', 'The Root server', 'The final server that holds the actual DNS records for a specific domain', 'Your local router'], answer: 2, difficulty: 'hard' },
];

const STEPS = [
  { id: 'query', label: 'Client Query', from: 'client', to: 'resolver',
    desc: 'Browser asks local resolver: "What is the IP for example.com?"',
    whatHappens: 'Your browser creates a DNS query packet containing the domain name "example.com" and sends it to the configured DNS resolver (usually your ISP or 8.8.8.8). This query asks for an A record (IPv4 address).',
    analogy: '📞 Like calling 411 (directory assistance): "What\'s the phone number for example.com?"',
    keyPoint: 'DNS uses UDP port 53 for queries. Your OS checks the local cache and hosts file first before contacting the resolver.'
  },
  { id: 'root', label: 'Root DNS', from: 'resolver', to: 'root',
    desc: 'Resolver contacts Root DNS → "Try .com TLD server"',
    whatHappens: 'The resolver doesn\'t know example.com, so it contacts one of the 13 Root DNS servers. The Root server doesn\'t know the final answer, but it knows which TLD (Top-Level Domain) server handles ".com" domains and refers the resolver there.',
    analogy: '📖 Like asking a librarian who says: "I don\'t have that book, but the Computer section is on floor 3."',
    keyPoint: 'There are 13 root server IP addresses (A through M) maintained by organizations like ICANN, Verisign, and NASA.'
  },
  { id: 'tld', label: 'TLD DNS', from: 'resolver', to: 'tld',
    desc: 'Root refers to .com TLD → "Try ns1.example.com"',
    whatHappens: 'The resolver contacts the .com TLD server. This server knows which authoritative nameserver is responsible for "example.com" and refers the resolver to ns1.example.com (the domain\'s nameserver).',
    analogy: '📁 The floor librarian says: "The book you want is in shelf 12, ask the shelf manager."',
    keyPoint: 'TLD servers handle domains like .com, .org, .net, .edu. Each TLD is managed by a designated registry operator.'
  },
  { id: 'auth', label: 'Authoritative', from: 'resolver', to: 'auth',
    desc: 'Authoritative → "example.com = 93.184.216.34"',
    whatHappens: 'The resolver contacts the authoritative nameserver for example.com. This server has the actual DNS zone file and returns the definitive A record: example.com → 93.184.216.34. This IS the final answer.',
    analogy: '📋 The shelf manager says: "Here\'s the exact book. Its ISBN (IP) is 93.184.216.34."',
    keyPoint: 'The authoritative nameserver is the source of truth. Domain owners configure their DNS records (A, AAAA, CNAME, MX) here.'
  },
  { id: 'response', label: 'Response', from: 'resolver', to: 'client',
    desc: 'Resolver returns IP 93.184.216.34 to client',
    whatHappens: 'The resolver sends the IP address back to your browser and also CACHES the result with a TTL (Time to Live). Future queries for example.com will be served from cache instantly, avoiding the full lookup chain.',
    analogy: '📝 Directory assistance gives you the number AND writes it down so they remember for next time.',
    keyPoint: 'DNS caching happens at multiple levels: browser cache (minutes), OS cache, resolver cache (hours-days). This dramatically reduces lookup time.'
  },
];

const NODES = [
  { id: 'client', label: 'Client', icon: 'laptop_mac', x: 10, y: 50 },
  { id: 'resolver', label: 'DNS Resolver', icon: 'dns', x: 35, y: 50 },
  { id: 'root', label: 'Root DNS', icon: 'public', x: 65, y: 15 },
  { id: 'tld', label: '.com TLD', icon: 'domain', x: 80, y: 50 },
  { id: 'auth', label: 'Authoritative', icon: 'verified', x: 65, y: 85 },
];

export default function DnsSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [stepIndex, setStepIndex] = useState(-1);
  const [tab, setTab] = useState('learn');
  const intervalRef = useRef(null);

  const step = useCallback(() => {
    setStepIndex(prev => { if (prev >= STEPS.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
  }, []);

  const manualStep = () => { setIsPlaying(false); step(); };

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(step, 2500 / speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, step]);

  const reset = () => { setIsPlaying(false); setStepIndex(-1); clearInterval(intervalRef.current); };
  const currentStep = stepIndex >= 0 ? STEPS[stepIndex] : null;

  return (
    <div className="p-10 min-h-[calc(100vh-4rem)]">
      <h1 className="text-5xl font-black font-headline tracking-tighter text-white mb-1">DNS Resolution</h1>
      <p className="text-on-secondary-container text-base max-w-2xl mb-8">Trace how a domain name is resolved to an IP address through the DNS hierarchy. Use <strong className="text-primary">⏭ Step</strong> to advance one query at a time.</p>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-5">
          <div className="relative bg-surface-container rounded-xl overflow-hidden p-6 flex flex-col gap-6">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7bd0ff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            
            <div className="relative z-20">
              {currentStep ? (
                <div className="bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-xl border border-primary/20">
                  <span className="text-primary text-xs font-bold">{currentStep.desc}</span>
                </div>
              ) : (
                <div className="bg-surface-container-lowest/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-primary">How it works:</strong> DNS resolution is iterative. Your resolver queries Root → TLD → Authoritative servers until it finds the IP. Click <strong className="text-primary">⏭ Step</strong> to begin.
                  </p>
                </div>
              )}
            </div>

            <div className="relative h-[300px] w-full">
              {NODES.map(n => {
                const isActive = currentStep && (currentStep.from === n.id || currentStep.to === n.id);
                return (
                  <div key={n.id} className="absolute flex flex-col items-center gap-2 z-10" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border transition-all ${isActive ? 'bg-primary/20 border-primary/40 scale-110 shadow-primary/20' : 'bg-surface-container-high border-white/10'}`}>
                      <span className={`material-symbols-outlined text-2xl ${isActive ? 'text-primary' : 'text-slate-400'}`}>{n.icon}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-primary' : 'text-slate-400'} text-center w-24`}>{n.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="relative z-20 flex justify-center">
              <SimulationControls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={manualStep} onReset={reset} speed={speed} onSpeedChange={setSpeed} />
            </div>
          </div>

          {/* What's Happening */}
          {currentStep && (
            <div className="bg-gradient-to-r from-primary/8 to-transparent p-5 rounded-xl border border-primary/15">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">What's Happening — {currentStep.label}</span>
              </div>
              <p className="text-sm text-white leading-relaxed mb-3">{currentStep.whatHappens}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-container-lowest/60 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-300"><strong className="text-white">Analogy:</strong> {currentStep.analogy}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs text-on-secondary-container"><strong className="text-primary">Key Point:</strong> {currentStep.keyPoint}</p>
                </div>
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
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Resolution Steps</h3>
                {STEPS.map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-3 p-3 rounded mb-2 transition-all ${i <= stepIndex ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-highest/40 border border-transparent'}`}>
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${i <= stepIndex ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-slate-400'}`}>{i + 1}</span>
                    <span className={`text-xs font-bold uppercase ${i <= stepIndex ? 'text-white' : 'text-slate-400'}`}>{s.label}</span>
                    {i < stepIndex && <span className="material-symbols-outlined text-tertiary text-sm ml-auto">check_circle</span>}
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-[#171f33] to-[#0b1326] p-5 rounded-xl border border-primary/10">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">💡 Try It</span>
                <p className="text-xs text-slate-300 leading-relaxed">Run <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-primary text-[10px]">nslookup example.com</code> in terminal!</p>
              </div>
            </>
          )}
          {tab === 'quiz' && <QuizPanel title="DNS Quiz" questions={DNS_QUIZ} />}
        </div>
      </div>
    </div>
  );
}
