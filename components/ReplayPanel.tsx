"use client";

import { CaptureSurface } from "@/components/CaptureSurface";
import { PlaybackControls } from "@/components/PlaybackControls";
import { StatPill } from "@/components/StatPill";
import { generateInsights } from "@/lib/insights";
import { formatTime } from "@/lib/time";
import type { SessionDetail } from "@/lib/types";
import { useReplay } from "@/hooks/useReplay";
import { InsightsPanel } from "./InsightsPanel";

type ReplayPanelProps = {
  session: SessionDetail | null;
};

export function ReplayPanel({ session }: ReplayPanelProps) {
  const events = session?.events ?? [];
  const duration = session?.duration ?? 0;
  const replay = useReplay(events, duration);
  const insights = generateInsights(events);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-mint">Replay</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">{session ? "High-fidelity session playback" : "Select a session"}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Duration" value={formatTime(duration)} />
          <StatPill label="Events" value={`${events.length}`} />
          <StatPill label="Scrub" value={formatTime(replay.currentTime)} />
        </div>
      </div>
      <CaptureSurface
        mode="replay"
        viewportRef={replay.viewportRef}
        cursor={replay.playback.cursor}
        click={replay.playback.click}
        activeTargetId={replay.playback.activeTargetId}
        inputValues={replay.playback.inputValues}
      />
      <PlaybackControls
        isPlaying={replay.isPlaying}
        currentTime={replay.currentTime}
        duration={duration}
        speed={replay.speed}
        eventIndex={replay.playback.eventIndex}
        eventCount={events.length}
        onPlayPause={() => replay.setIsPlaying(!replay.isPlaying)}
        onRestart={replay.restart}
        onScrub={replay.scrub}
        onSpeed={replay.setSpeed}
      />
      <InsightsPanel insights={insights} />
    </section>
  );
}
