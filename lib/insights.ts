import type { Insight, ReplayEvent } from "./types";

export function generateInsights(events: ReplayEvent[]): Insight[] {
  if (!events.length) {
    return [
      { label: "Signal quality", value: "Record a session to unlock behavioral insights", tone: "sky" },
      { label: "Replay confidence", value: "Waiting for interaction data", tone: "violet" }
    ];
  }

  const clicks = events.filter((event) => event.type === "click");
  const moves = events.filter((event) => event.type === "mousemove");
  const inputs = events.filter((event) => event.type === "input");
  const duration = Math.max(...events.map((event) => event.timestamp), 0);
  const firstInteraction = events.find((event) => event.type !== "mousemove");
  const topClicks = clicks.filter((event) => (event.y ?? 0) < 280).length;
  const bottomClicks = clicks.length - topClicks;
  const repeatedClicks = clicks.filter((click, index) => {
    const previous = clicks[index - 1];
    if (!previous) {
      return false;
    }
    const dx = Math.abs((click.x ?? 0) - (previous.x ?? 0));
    const dy = Math.abs((click.y ?? 0) - (previous.y ?? 0));
    const dt = click.timestamp - previous.timestamp;
    return dx < 34 && dy < 34 && dt < 1300;
  }).length;

  const hotZone = getHotZone(clicks);
  const density = duration > 0 ? Math.round((events.length / duration) * 10000) / 10 : events.length;
  const idle = firstInteraction ? firstInteraction.timestamp : 0;

  return [
    {
      label: "Most clicked area",
      value: clicks.length ? hotZone : "No clicks captured",
      tone: "mint"
    },
    {
      label: "Repeated click pressure",
      value: repeatedClicks ? `${repeatedClicks} repeated clicks near the same target` : "No repeated click frustration detected",
      tone: repeatedClicks ? "flame" : "mint"
    },
    {
      label: "Idle before action",
      value: `${(idle / 1000).toFixed(1)}s before first deliberate interaction`,
      tone: idle > 3000 ? "flame" : "sky"
    },
    {
      label: "Interaction density",
      value: `${density} events per 10s with ${moves.length} pointer samples`,
      tone: density > 18 ? "violet" : "sky"
    },
    {
      label: "Viewport bias",
      value: topClicks >= bottomClicks ? `${topClicks} top-half clicks vs ${bottomClicks} lower-half` : `${bottomClicks} lower-half clicks vs ${topClicks} top-half`,
      tone: "mint"
    },
    {
      label: "Input activity",
      value: inputs.length ? `${inputs.length} text changes replayed visually` : "No text field edits in this session",
      tone: inputs.length ? "violet" : "sky"
    }
  ];
}

function getHotZone(clicks: ReplayEvent[]) {
  if (!clicks.length) {
    return "No click data";
  }

  const buckets = new Map<string, number>();
  clicks.forEach((click) => {
    const col = Math.floor((click.x ?? 0) / 160);
    const row = Math.floor((click.y ?? 0) / 120);
    const key = `${col},${row}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });

  const [key, count] = [...buckets.entries()].sort((a, b) => b[1] - a[1])[0];
  const [col, row] = key.split(",").map(Number);
  return `${count} click${count === 1 ? "" : "s"} around x ${col * 160}-${col * 160 + 160}, y ${row * 120}-${row * 120 + 120}`;
}
