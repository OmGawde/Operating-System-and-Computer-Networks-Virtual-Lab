import { Link } from 'react-router-dom';

const sims = [
  { path: '/transport/tcp-handshake', title: 'TCP 3-Way Handshake', desc: 'Visualize SYN → SYN-ACK → ACK connection establishment', icon: 'handshake' },
  { path: '/transport/sliding-window', title: 'Sliding Window', desc: 'Watch packets flow with dynamic windowing and ACK management', icon: 'window' },
];

export default function TransportHub() {
  return (
    <div className="p-12 animate-fade-in">
      <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em]">Module 03</span>
      <h1 className="text-6xl font-black font-headline text-white tracking-tighter mt-2 mb-4">Transport Layer</h1>
      <p className="text-on-secondary-container text-lg max-w-2xl mb-12">Explore how TCP ensures reliable, ordered data delivery through connection management and flow control.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sims.map(s => (
          <Link key={s.path} to={s.path} className="group bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-primary/5">
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:scale-110 transition-transform">{s.icon}</span>
            <h3 className="text-white font-headline font-bold text-xl mb-2 uppercase tracking-tight">{s.title}</h3>
            <p className="text-on-secondary-container text-sm leading-relaxed">{s.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all">Launch Lab <span className="material-symbols-outlined text-sm">arrow_forward</span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
