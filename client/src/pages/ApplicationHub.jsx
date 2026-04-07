import { Link } from 'react-router-dom';

export default function ApplicationHub() {
  return (
    <div className="p-12 animate-fade-in">
      <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em]">Module 04</span>
      <h1 className="text-6xl font-black font-headline text-white tracking-tighter mt-2 mb-4">Application Layer</h1>
      <p className="text-on-secondary-container text-lg max-w-2xl mb-12">Understand the protocols that power web communication, from HTTP requests to API responses.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/application/http" className="group bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-primary/5">
          <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:scale-110 transition-transform">language</span>
          <h3 className="text-white font-headline font-bold text-xl mb-2 uppercase tracking-tight">HTTP Request-Response</h3>
          <p className="text-on-secondary-container text-sm leading-relaxed">Simulate GET, POST, DELETE requests with animated packet exchange and status codes</p>
          <div className="mt-6 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all">Launch Lab <span className="material-symbols-outlined text-sm">arrow_forward</span></div>
        </Link>
      </div>
    </div>
  );
}
