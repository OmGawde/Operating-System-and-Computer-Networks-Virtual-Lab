import { useState, useEffect } from 'react';
import { getRandomQuestions } from '../data/questionBank';

const POINTS_MAP = { easy: 10, medium: 20, hard: 30 };

export default function MasteryQuiz() {
  const [step, setStep] = useState('welcome'); // welcome, quiz, results, leaderboard
  const [nickname, setNickname] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const startQuiz = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setQuestions(getRandomQuestions(20));
    setScore(0);
    setCurrentIndex(0);
    setStep('quiz');
  };

  const handleAnswer = (idx) => {
    if (showAnswer) return;
    setSelectedOption(idx);
    setShowAnswer(true);
    
    const correct = idx === questions[currentIndex].answer;
    if (correct) {
      setScore(prev => prev + POINTS_MAP[questions[currentIndex].difficulty]);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowAnswer(false);
      } else {
        submitScore();
      }
    }, 1500);
  };

  const submitScore = async () => {
    setStep('results');
    setIsSubmitting(true);
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, score, totalPossible: questions.reduce((sum, q) => sum + POINTS_MAP[q.difficulty], 0) })
      });
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLeaderboard = async () => {
    setStep('leaderboard');
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      setError('Could not fetch leaderboard. Ensure MongoDB is running or check server logs.');
    }
  };

  // Render functions
  const renderWelcome = () => (
    <div className="max-w-md mx-auto mt-20 p-8 bg-surface-container rounded-3xl border border-outline-variant/10 shadow-2xl text-center">
      <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-primary font-bold">emoji_events</span>
      </div>
      <h1 className="text-3xl font-black font-headline text-white mb-2 uppercase tracking-tight">Mastery Quiz</h1>
      <p className="text-on-surface-variant text-sm mb-8">Test your knowledge across all modules. 20 random questions. Max score: 600 pts. Enter your nickname to begin.</p>
      
      <form onSubmit={startQuiz} className="space-y-4">
        <input 
          type="text" 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter Nickname"
          className="w-full bg-surface-container-highest border-none text-white px-6 py-4 rounded-xl text-center font-bold focus:ring-2 focus:ring-primary outline-none text-lg"
          maxLength={15}
        />
        <button 
          type="submit"
          disabled={!nickname.trim()}
          className="w-full bg-primary text-on-primary font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Start Challenge
        </button>
      </form>
    </div>
  );

  const renderQuiz = () => {
    const q = questions[currentIndex];
    if (!q) return null;

    const diffColors = {
      easy: 'text-tertiary border-tertiary bg-tertiary/10',
      medium: 'text-secondary border-secondary bg-secondary/10',
      hard: 'text-error border-error bg-error/10'
    };

    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-surface-container rounded-3xl border border-outline-variant/10 shadow-2xl">
        <div className="flex justify-between items-end mb-8 border-b border-outline-variant/10 pb-6">
          <div>
            <div className="text-primary text-sm font-bold uppercase tracking-widest mb-1">Question {currentIndex + 1} / {questions.length}</div>
            <div className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${diffColors[q.difficulty]}`}>
              {q.difficulty} • {POINTS_MAP[q.difficulty]} pts
            </div>
            {q.topic && <span className="ml-3 text-on-surface-variant text-xs font-bold uppercase tracking-widest">{q.topic}</span>}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant">Current Score</div>
            <div className="text-3xl font-black font-mono text-tertiary">{score}</div>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed font-headline">{q.q}</h2>

        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            let stateClass = "bg-surface-container-highest border-transparent text-on-surface hover:border-primary/50 hover:bg-surface-variant";
            
            if (showAnswer) {
              if (idx === q.answer) {
                stateClass = "bg-tertiary/20 border-tertiary text-tertiary font-bold";
              } else if (idx === selectedOption) {
                stateClass = "bg-error/20 border-error text-error opacity-50";
              } else {
                stateClass = "bg-surface-container-lowest opacity-30 border-transparent";
              }
            } else if (idx === selectedOption) {
              stateClass = "bg-primary/20 border-primary text-primary font-bold";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showAnswer}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${stateClass} flex items-center justify-between`}
              >
                <span>{opt}</span>
                {showAnswer && idx === q.answer && <span className="material-symbols-outlined">check_circle</span>}
                {showAnswer && idx === selectedOption && idx !== q.answer && <span className="material-symbols-outlined">cancel</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    let message = 'Good effort!';
    if (score >= 400) message = 'Top Tier Networking Knowledge!';
    if (score >= 500) message = 'Network Architect Level!';

    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-surface-container rounded-3xl border border-tertiary/30 shadow-[0_0_50px_rgba(74,225,118,0.1)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-tertiary to-secondary" />
        <h2 className="text-3xl font-black font-headline text-white mb-2 uppercase">Quiz Complete</h2>
        <p className="text-on-surface-variant mb-8">{message}</p>
        
        <div className="mb-8">
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Final Score</div>
          <div className="text-7xl font-black font-mono text-tertiary drop-shadow-[0_0_15px_rgba(74,225,118,0.3)]">{score}</div>
          <div className="text-xs text-on-surface-variant mt-2">Maximum possible: ~500-600</div>
        </div>

        {isSubmitting ? (
          <p className="text-primary font-bold animate-pulse text-sm">Saving score to leaderboard...</p>
        ) : (
          <div className="flex gap-4">
            <button onClick={() => setStep('welcome')} className="flex-1 py-3 bg-surface-container-highest text-white font-bold rounded-xl hover:bg-surface-variant transition-colors">Play Again</button>
            <button onClick={fetchLeaderboard} className="flex-1 py-3 bg-primary text-on-primary font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors shadow-lg">Leaderboard</button>
          </div>
        )}
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-surface-container rounded-3xl border border-outline-variant/10 shadow-2xl">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <h2 className="text-2xl font-black font-headline text-white uppercase flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-yellow-400">social_leaderboard</span> Global Rankings
        </h2>
        <button onClick={() => setStep('welcome')} className="px-4 py-2 bg-surface-container-highest rounded text-sm font-bold text-on-surface hover:text-white transition-colors">Close</button>
      </div>

      {error ? (
        <div className="p-4 bg-error/20 text-error rounded-xl border border-error/30 text-center">{error}</div>
      ) : leaderboard.length === 0 ? (
        <p className="text-center text-on-surface-variant py-8">No scores recorded yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <div key={entry._id || i} className={`flex items-center justify-between p-4 rounded-xl ${i === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30' : i === 1 ? 'bg-gradient-to-r from-slate-300/10 to-transparent' : i === 2 ? 'bg-gradient-to-r from-amber-600/10 to-transparent' : 'bg-surface-container-lowest border border-outline-variant/5'}`}>
              <div className="flex items-center gap-4">
                <span className={`font-black font-mono w-6 text-center ${i === 0 ? 'text-yellow-400 text-xl' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-on-surface-variant'}`}>{i + 1}</span>
                <span className="font-bold text-white text-lg">{entry.nickname}</span>
              </div>
              <div className="flex items-center gap-6 text-right">
                <span className="text-[10px] text-on-surface-variant font-mono">{new Date(entry.date).toLocaleDateString()}</span>
                <span className={`font-black font-mono text-xl ${i === 0 ? 'text-yellow-400' : 'text-primary'}`}>{entry.score} <span className="text-[10px] font-sans">pts</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 md:p-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        {step === 'welcome' && renderWelcome()}
        {step === 'quiz' && renderQuiz()}
        {step === 'results' && renderResults()}
        {step === 'leaderboard' && renderLeaderboard()}
      </div>
    </div>
  );
}
