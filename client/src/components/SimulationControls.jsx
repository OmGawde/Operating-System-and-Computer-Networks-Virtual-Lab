export default function SimulationControls({ isPlaying, onPlay, onPause, onReset, onStep, speed, onSpeedChange }) {
  return (
    <div className="glass-panel p-2 rounded-xl flex items-center gap-4 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-1">
        <button
          onClick={onPlay}
          title="Auto-play simulation"
          className={`p-3 rounded-lg transition-all active:scale-95 shadow-lg ${
            isPlaying
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-tertiary-fixed text-on-tertiary-fixed hover:translate-y-[-2px] shadow-tertiary/20'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
        </button>
        <button
          onClick={onPause}
          title="Pause simulation"
          className="p-3 bg-secondary-container text-on-secondary-container rounded-lg hover:bg-secondary-container/80 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">pause</span>
        </button>
        {onStep && (
          <button
            onClick={onStep}
            title="Advance one step manually"
            className="p-3 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">skip_next</span>
          </button>
        )}
        <button
          onClick={onReset}
          title="Reset simulation"
          className="p-3 bg-error-container text-on-error-container rounded-lg hover:bg-error-container/80 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">replay</span>
        </button>
      </div>
      <div className="h-10 w-px bg-white/10" />
      <div className="px-4 flex flex-col gap-1 w-48">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Sim Speed</span>
          <span className="text-[9px] font-bold text-primary font-mono">{speed.toFixed(1)}x</span>
        </div>
        <input
          className="w-full h-1 bg-surface-container-lowest rounded-lg appearance-none cursor-pointer accent-primary"
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
