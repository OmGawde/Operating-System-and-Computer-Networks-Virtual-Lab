import { Link } from 'react-router-dom';

const sims = [
  { path: '/network-fundamentals/osi', title: 'OSI Model', desc: 'Visualize data traveling through 7 layers with encapsulation', icon: 'layers' },
  { path: '/network-fundamentals/dns', title: 'DNS Resolution', desc: 'Trace domain name resolution through the DNS hierarchy', icon: 'dns' },
  { path: '/network-fundamentals/dhcp', title: 'DHCP Process', desc: 'Observe the DORA process for dynamic IP assignment', icon: 'settings_ethernet' },
];

export default function FundamentalsHub() {
  return (
    <div className="p-12 animate-fade-in">
      <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em]">Module 01</span>
      <h1 className="text-6xl font-black font-headline text-white tracking-tighter mt-2 mb-4">Network Fundamentals</h1>
      <p className="text-on-secondary-container text-lg max-w-2xl mb-12">
        Explore the building blocks of computer networking. From the OSI model to DNS resolution and dynamic addressing.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sims.map(s => (
          <Link key={s.path} to={s.path} className="group bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-primary/5">
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:scale-110 transition-transform">{s.icon}</span>
            <h3 className="text-white font-headline font-bold text-xl mb-2 uppercase tracking-tight">{s.title}</h3>
            <p className="text-on-secondary-container text-sm leading-relaxed">{s.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all">
              Launch Lab <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
