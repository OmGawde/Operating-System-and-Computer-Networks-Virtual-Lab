import { useState } from 'react';

const DIFF_COLORS = { easy: 'bg-primary/20 text-primary border-primary/30', medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', hard: 'bg-error/20 text-error border-error/30' };
const DIFF_POINTS = { easy: 10, medium: 20, hard: 30 };

export default function QuizPanel({ title, questions }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [done, setDone] = useState(false);

  // If questions don't have difficulty yet, default to medium
  const maxPoints = questions.reduce((sum, q) => sum + (DIFF_POINTS[q.difficulty] || 20), 0);

  const check = (i) => {
    setAnswer(i);
    const q = questions[idx];
    if (i === q.answer) {
      setCorrectCount(c => c + 1);
      setPoints(p => p + (DIFF_POINTS[q.difficulty] || 20));
    }
    setTimeout(() => {
      if (idx < questions.length - 1) { setIdx(n => n + 1); setAnswer(null); }
      else setDone(true);
    }, 1200);
  };

  const retry = () => { setIdx(0); setAnswer(null); setCorrectCount(0); setPoints(0); setDone(false); };

  if (done) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low rounded-xl">
      <span className="material-symbols-outlined text-5xl text-primary mb-3">emoji_events</span>
      <h3 className="text-3xl font-black font-headline text-white mb-1">
        {points} <span className="text-lg text-slate-400 font-normal">/ {maxPoints} pts</span>
      </h3>
      <p className="text-primary font-bold text-sm mb-3">{correctCount} of {questions.length} correct</p>
      <p className="text-slate-400 text-sm mb-6">{correctCount === questions.length ? 'Perfect score! 🎉' : correctCount >= questions.length * 0.7 ? 'Great job! Review any missed concepts.' : 'Keep studying and try again.'}</p>
      <button onClick={retry} className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg text-xs uppercase tracking-widest active:scale-95 transition-all">Retake Quiz</button>
    </div>
  );

  const q = questions[idx];
  const diff = q.difficulty || 'medium';

  return (
    <div className="p-5 space-y-4 flex-1 flex flex-col bg-surface-container-low rounded-xl">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-headline font-bold text-white">{title}</h3>
          <p className="text-[10px] text-on-secondary-container mt-0.5">{questions.length} questions • {maxPoints} pts possible</p>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${DIFF_COLORS[diff]}`}>
          {diff} ({DIFF_POINTS[diff]} pts)
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-[10px] font-mono text-slate-400">{idx + 1}/{questions.length}</span>
      </div>
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-white/5 flex-1 flex flex-col">
        <p className="text-white font-medium text-sm leading-relaxed mb-5">{q.q}</p>
        <div className="space-y-2.5 flex-1 max-h-[300px] overflow-y-auto pr-2">
          {q.options.map((opt, i) => {
            let cls = 'bg-surface-container hover:bg-surface-container-high text-slate-300 border-white/5 hover:border-primary/30';
            if (answer !== null) {
              if (i === q.answer) cls = 'bg-tertiary/15 text-tertiary border-tertiary/30';
              else if (answer === i) cls = 'bg-error/15 text-error border-error/30';
              else cls = 'bg-surface-container text-slate-500 border-white/3 opacity-40';
            }
            return (
              <button key={i} onClick={() => answer === null && check(i)} disabled={answer !== null}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 ${cls}`}>
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-container-lowest text-[10px] font-bold shrink-0 mt-0.5">{String.fromCharCode(65 + i)}</span>
                <span className="text-sm leading-relaxed">{opt}</span>
                {answer !== null && i === q.answer && <span className="material-symbols-outlined text-tertiary ml-auto text-sm mt-1 shrink-0">check_circle</span>}
                {answer !== null && answer === i && i !== q.answer && <span className="material-symbols-outlined text-error ml-auto text-sm mt-1 shrink-0">cancel</span>}
              </button>
            );
          })}
        </div>
        {answer !== null && (
          <div className={`mt-4 p-3 rounded-lg text-xs ${answer === q.answer ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
            {answer === q.answer ? `✓ Correct! +${DIFF_POINTS[diff]} pts` : `✗ Correct answer: ${q.options[q.answer]}`}
          </div>
        )}
      </div>
    </div>
  );
}
