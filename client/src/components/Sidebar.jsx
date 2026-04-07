import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/network-fundamentals', label: 'Fundamentals', icon: 'hub' },
  { path: '/routing', label: 'Routing', icon: 'router' },
  { path: '/transport', label: 'Transport', icon: 'swap_calls' },
  { path: '/application', label: 'Application', icon: 'language' },
  { path: '/network-layer', label: 'Network Layer', icon: 'layers' },
  { path: '/security', label: 'Security', icon: 'security' },
  { path: '/flashcards', label: 'Flashcards', icon: 'style' },
  { path: '/mastery-quiz', label: 'Mastery Quiz', icon: 'emoji_events' },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-full fixed left-0 top-0 z-40 bg-[#131b2e] w-64 pt-20 shadow-2xl shadow-black/20 overflow-y-auto">
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-white font-headline">Lab Explorer</h2>
        <p className="text-[10px] text-primary font-medium uppercase tracking-[0.2em] mt-1">Virtual Lab Console</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 gap-3 cursor-pointer transition-all duration-200 font-body text-xs font-medium uppercase tracking-widest ${
                isActive
                  ? 'bg-[#171f33] text-primary border-r-4 border-primary'
                  : 'text-slate-400 hover:bg-[#171f33]/50 hover:translate-x-1'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-6">
        <NavLink
          to="/network-fundamentals"
          className="w-full py-3 bg-gradient-to-br from-primary to-on-primary-container text-on-primary font-bold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20 mb-6"
        >
          <span className="material-symbols-outlined text-sm">play_arrow</span>
          Start Lab
        </NavLink>

        <div className="pt-4 border-t border-white/5 text-center pb-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-[0.15em] mb-2">Team</p>
          <div className="space-y-1 mb-4 text-sm text-slate-300 font-body">
            <p>Om Gawde</p>
            <p>Harsh Jaiswal</p>
            <p>Sanskar Sakpal</p>
            <p>Sanchita Chavan</p>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-[0.15em] mb-1">Mentored by</p>
          <p className="text-sm text-primary/90 font-body font-bold">Dr. Amit Nerurkar</p>
        </div>
      </div>
    </aside>
  );
}
