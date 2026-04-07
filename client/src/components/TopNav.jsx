import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function TopNav() {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'original');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <header className="flex justify-between items-center w-full px-6 py-3 bg-[#0b1326] fixed top-0 z-50 shadow-md">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-black text-primary tracking-tighter uppercase font-headline">
          The Kinetic Network
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#171f33] rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1 min-w-[80px] justify-center ${theme === 'light' ? 'bg-primary text-on-primary shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">light_mode</span> Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1 min-w-[80px] justify-center ${theme === 'dark' ? 'bg-primary text-on-primary shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">dark_mode</span> Dark
          </button>
          <button 
            onClick={() => setTheme('original')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1 min-w-[90px] justify-center ${theme === 'original' ? 'bg-primary text-on-primary shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">contrast</span> Original
          </button>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors active:scale-95 ml-2">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
