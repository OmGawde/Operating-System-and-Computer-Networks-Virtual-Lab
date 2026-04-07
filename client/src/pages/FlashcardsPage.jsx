import { useState, useEffect, useCallback } from 'react';
import { QUESTION_BANK } from '../data/questionBank';

const CATEGORIES = ['all', 'fundamentals', 'routing', 'tcp', 'security', 'application', 'network-layer'];
const CAT_LABELS = { all: 'All Topics', fundamentals: 'Fundamentals', routing: 'Routing & Addressing', tcp: 'TCP/IP', security: 'Security', application: 'Application / Web', 'network-layer': 'Network Layer' };

// Map topics from QUESTION_BANK to UI categories
const TOPIC_MAP = {
  'OSI': 'fundamentals',
  'TCP': 'tcp',
  'Addressing': 'routing',
  'DNS': 'application',
  'DHCP': 'application',
  'Routing': 'routing',
  'Security': 'security',
  'Web': 'application',
  'Troubleshooting': 'network-layer',
  'Diagram': 'fundamentals',
  'Networking': 'fundamentals'
};

export default function FlashcardsPage() {
  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState({}); // { cardIndex: 'easy' | 'hard' | 'again' }
  const [slideDir, setSlideDir] = useState(''); // 'left' or 'right'

  // Initialize with QUESTION_BANK
  useEffect(() => {
    // Give IDs to bank questions for tracking
    const bank = QUESTION_BANK.map((q, i) => ({ ...q, _id: `qb_${i}`, mappedTopic: TOPIC_MAP[q.topic] || 'fundamentals' }));
    setCards(bank);
    setFiltered(bank);
  }, []);

  useEffect(() => {
    const f = category === 'all' ? cards : cards.filter(c => c.mappedTopic === category);
    setFiltered(f);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSlideDir('');
  }, [category, cards]);

  const card = filtered[currentIndex];

  const goNext = useCallback(() => {
    if (!filtered.length) return;
    setSlideDir('right');
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => Math.min(i + 1, filtered.length - 1));
      setSlideDir('');
    }, 150);
  }, [filtered.length]);

  const goPrev = useCallback(() => {
    if (!filtered.length) return;
    setSlideDir('left');
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => Math.max(i - 1, 0));
      setSlideDir('');
    }, 150);
  }, [filtered.length]);

  const shuffle = useCallback(() => {
    setIsFlipped(false);
    setFiltered(f => [...f].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  }, []);

  const rateCard = useCallback((rating) => {
    if (!card) return;
    setRatings(prev => ({ ...prev, [card._id]: rating }));
    
    // Auto advance after rating (unless it's the last card)
    if (currentIndex < filtered.length - 1) {
      setTimeout(() => goNext(), 300);
    }
  }, [card, currentIndex, filtered.length, goNext]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input (though there are none here currently)
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        goNext();
      } else if (e.code === 'ArrowLeft') {
        goPrev();
      } else if (isFlipped) {
        if (e.code === 'Digit1') rateCard('again');
        if (e.code === 'Digit2') rateCard('hard');
        if (e.code === 'Digit3') rateCard('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, isFlipped, rateCard]);

  // Calculate Progress
  const masteryScore = filtered.reduce((acc, c) => {
    if (ratings[c._id] === 'easy') return acc + 1;
    if (ratings[c._id] === 'hard') return acc + 0.5;
    return acc;
  }, 0);
  const progress = filtered.length ? Math.round((masteryScore / filtered.length) * 100) : 0;
  
  const counts = {
    easy: filtered.filter(c => ratings[c._id] === 'easy').length,
    hard: filtered.filter(c => ratings[c._id] === 'hard').length,
    again: filtered.filter(c => ratings[c._id] === 'again').length,
    unseen: filtered.length - Object.keys(ratings).filter(id => filtered.some(f => f._id === id)).length
  };

  return (
    <div className="p-12 min-h-[calc(100vh-4rem)] animate-fade-in relative overflow-hidden">
      {/* Dynamic Background Hint based on rating */}
      {card && ratings[card._id] === 'easy' && <div className="absolute top-0 right-0 w-96 h-96 bg-tertiary/10 blur-[100px] pointer-events-none transition-colors" />}
      {card && ratings[card._id] === 'again' && <div className="absolute top-0 right-0 w-96 h-96 bg-error/10 blur-[100px] pointer-events-none transition-colors" />}

      <div className="flex justify-between items-end mb-10 relative z-10">
        <div>
          <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">school</span> Interactive Study Mode
          </span>
          <h1 className="text-6xl font-black font-headline text-white tracking-tighter mt-2">Flashcards</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Mastery</span>
            <span className="text-tertiary font-bold text-lg">{progress}%</span>
          </div>
          <div className="w-48 h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
            {filtered.length > 0 && (
              <>
                <div className="h-full bg-tertiary transition-all duration-300" style={{ width: `${(counts.easy / filtered.length) * 100}%` }} title="Easy" />
                <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${(counts.hard / filtered.length) * 100}%` }} title="Hard" />
                <div className="h-full bg-error transition-all duration-300" style={{ width: `${(counts.again / filtered.length) * 100}%` }} title="Again" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-10 flex-wrap relative z-10">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              category === cat
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105'
                : 'bg-surface-container-high text-slate-400 hover:bg-surface-container-highest hover:text-white hover:scale-105'
            }`}
          >
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 relative z-10">
        {/* Card Area */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          {card ? (
            <div 
              className={`perspective-1000 w-full h-[350px] cursor-pointer mb-8 transition-transform duration-200 ${slideDir === 'left' ? '-translate-x-10 opacity-0' : slideDir === 'right' ? 'translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}`} 
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full preserve-3d transition-transform duration-500 ease-out ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front of Card */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-surface-container-highest to-surface-container-low rounded-3xl border-2 border-outline-variant/10 p-12 flex flex-col justify-between shadow-2xl hover:border-primary/30 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                        {card.topic}
                      </span>
                      {ratings[card._id] && (
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${ratings[card._id] === 'easy' ? 'bg-tertiary/20 text-tertiary' : ratings[card._id] === 'hard' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
                          Previously: {ratings[card._id]}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-headline font-bold text-white leading-snug">{card.q}</h2>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">space_bar</span> Press Space to flip</span>
                    <span className="opacity-50"># {currentIndex + 1}</span>
                  </div>
                </div>

                {/* Back of Card */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#131b2e] to-[#0a101d] rounded-3xl border-2 border-primary/30 p-10 flex flex-col shadow-[0_0_40px_rgba(74,225,118,0.1)]">
                  <div className="flex-1 flex flex-col justify-center text-center">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 block"><span className="material-symbols-outlined text-sm align-middle mr-1">lightbulb</span> Correct Answer</span>
                    <p className="text-2xl font-bold text-white leading-relaxed">{card.options[card.answer]}</p>
                  </div>

                  {/* SRS Rating Buttons (Only active when flipped) */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex gap-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => rateCard('again')} className="flex-1 py-4 bg-error/10 hover:bg-error/20 text-error rounded-xl font-bold text-xs uppercase tracking-widest border border-error/20 transition-all active:scale-95 group">
                      <span className="block text-lg mb-1 group-hover:-translate-y-1 transition-transform">🔴</span> Again <span className="text-[9px] opacity-60 ml-1 font-mono">(1)</span>
                    </button>
                    <button onClick={() => rateCard('hard')} className="flex-1 py-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl font-bold text-xs uppercase tracking-widest border border-secondary/20 transition-all active:scale-95 group">
                      <span className="block text-lg mb-1 group-hover:-translate-y-1 transition-transform">🟡</span> Hard <span className="text-[9px] opacity-60 ml-1 font-mono">(2)</span>
                    </button>
                    <button onClick={() => rateCard('easy')} className="flex-1 py-4 bg-tertiary/10 hover:bg-tertiary/20 text-tertiary rounded-xl font-bold text-xs uppercase tracking-widest border border-tertiary/20 transition-all active:scale-95 group shadow-[0_0_15px_rgba(74,225,118,0.1)]">
                      <span className="block text-lg mb-1 group-hover:-translate-y-1 transition-transform">🟢</span> Easy <span className="text-[9px] opacity-60 ml-1 font-mono">(3)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-[350px] bg-surface-container rounded-3xl flex flex-col items-center justify-center text-slate-500 mb-8 border border-dashed border-white/10">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-50">style</span>
              <p className="font-bold uppercase tracking-widest text-sm">No cards available.</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <button onClick={goPrev} disabled={currentIndex <= 0} className="flex-1 flex items-center justify-center gap-2 py-4 bg-surface-container-high rounded-xl text-white font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-surface-container-highest transition-all active:scale-95">
              <span className="material-symbols-outlined">arrow_back</span> Previous
            </button>
            <div className="flex-1 flex justify-center items-center gap-4">
              <button onClick={shuffle} className="p-4 bg-surface-container-high rounded-xl text-slate-400 hover:text-white hover:bg-surface-container-highest transition-all active:scale-95" title="Shuffle Deck">
                <span className="material-symbols-outlined">shuffle</span>
              </button>
              <div className="text-center">
                <span className="text-xl font-black font-mono text-white tracking-widest">{currentIndex + 1}</span>
                <span className="text-slate-500 font-bold mx-2">/</span>
                <span className="text-sm font-bold text-slate-500">{filtered.length}</span>
              </div>
            </div>
            <button onClick={goNext} disabled={currentIndex >= filtered.length - 1} className="flex-1 flex items-center justify-center gap-2 py-4 bg-surface-container-high rounded-xl text-white font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-surface-container-highest transition-all active:scale-95">
               Next <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Side Statistics Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          <div className="bg-gradient-to-br from-surface-container-low to-[#131b2e] rounded-2xl p-8 border border-white/5 shadow-xl relative overflow-hidden">
             {/* Decorative grid */}
             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span> Session Stats
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest block mb-1">🟢 Mastered (Easy)</span>
                  <span className="text-3xl font-black text-white">{counts.easy}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{filtered.length ? Math.round((counts.easy / filtered.length) * 100) : 0}%</span>
              </div>
              
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-1">🟡 Review (Hard)</span>
                  <span className="text-3xl font-black text-white">{counts.hard}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{filtered.length ? Math.round((counts.hard / filtered.length) * 100) : 0}%</span>
              </div>
              
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-error uppercase tracking-widest block mb-1">🔴 Re-learn (Again)</span>
                  <span className="text-3xl font-black text-white">{counts.again}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{filtered.length ? Math.round((counts.again / filtered.length) * 100) : 0}%</span>
              </div>

              <div className="flex justify-between items-end pt-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Unseen</span>
                  <span className="text-xl font-bold text-slate-400">{counts.unseen}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 flex items-start gap-4">
            <span className="material-symbols-outlined text-3xl text-primary mt-1">keyboard</span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Keyboard Shortcuts</h4>
              <ul className="text-[10px] text-slate-400 uppercase font-bold tracking-widest space-y-2">
                <li className="flex justify-between"><span className="text-white">Space</span> <span>Flip Card</span></li>
                <li className="flex justify-between"><span className="text-white">Arrows</span> <span>Next / Prev</span></li>
                <li className="flex justify-between"><span className="text-white">1, 2, 3</span> <span>Rate Answer</span></li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
