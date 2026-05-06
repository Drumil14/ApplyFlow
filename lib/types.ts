export type ReplayEventType = "mousemove" | "click" | "scroll" | "input";

export type ReplayEvent = {
  id: string;
  type: ReplayEventType;
  x: number | null;
  y: number | null;
  value: string | null;
  timestamp: number;
  sessionId: string;
  targetId?: string | null;
  scrollY?: number | null;
};

export type ReplaySession = {
  id: string;
  createdAt: string;
  duration: number;
  eventCount: number;
};

export type SessionDetail = ReplaySession & {
  events: ReplayEvent[];
};

export type Insight = {
  label: string;
  value: string;
  tone: "mint" | "flame" | "sky" | "violet";
};

export type CaptureTarget = HTMLElement & {
  dataset: DOMStringMap & {
    replayKey?: string;
  };
};
