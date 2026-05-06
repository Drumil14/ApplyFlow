import { formatTime } from "@/lib/time";

type PlaybackControlsProps = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  eventIndex: number;
  eventCount: number;
  onPlayPause: () => void;
  onRestart: () => void;
  onScrub: (value: number) => void;
  onSpeed: (value: number) => void;
};

export function PlaybackControls({ isPlaying, currentTime, duration, speed, eventIndex, eventCount, onPlayPause, onRestart, onScrub, onSpeed }: PlaybackControlsProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-panel/80 p-4 shadow-panel backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onPlayPause} className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink transition hover:scale-[1.02]">
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={onRestart} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]">Restart</button>
        <div className="ml-auto flex rounded-lg border border-white/10 bg-black/20 p-1">
          {[1, 2].map((item) => (
            <button key={item} onClick={() => onSpeed(item)} className={`rounded-md px-3 py-1.5 font-mono text-xs transition ${speed === item ? "bg-white text-ink" : "text-slate-400 hover:text-white"}`}>
              {item}x
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <input
          aria-label="Replay timeline"
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          value={currentTime}
          onChange={(event) => onScrub(Number(event.target.value))}
          className="h-2 w-full accent-mint"
        />
        <div className="mt-3 flex items-center justify-between font-mono text-xs text-slate-400">
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <span>{eventIndex} of {eventCount} events</span>
        </div>
      </div>
    </div>
  );
}
