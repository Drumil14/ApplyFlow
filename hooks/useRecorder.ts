"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { createId } from "@/lib/ids";
import type { CaptureTarget, ReplayEvent } from "@/lib/types";

export function useRecorder(onSaved: (id: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const eventsRef = useRef<ReplayEvent[]>([]);
  const startRef = useRef(0);
  const lastMouseRef = useRef(0);
  const sessionRef = useRef(createId("draft"));

  useEffect(() => {
    if (!isRecording) {
      return;
    }
    const interval = window.setInterval(() => {
      setDuration(performance.now() - startRef.current);
    }, 120);
    return () => window.clearInterval(interval);
  }, [isRecording]);

  const pushEvent = useCallback((event: Omit<ReplayEvent, "id" | "timestamp" | "sessionId">) => {
    if (!startRef.current) {
      return;
    }
    const timestamp = performance.now() - startRef.current;
    const nextEvent: ReplayEvent = {
      ...event,
      id: createId("evt"),
      timestamp,
      sessionId: sessionRef.current
    };
    eventsRef.current.push(nextEvent);
    setEventCount(eventsRef.current.length);
    setDuration(timestamp);
  }, []);

  const getPoint = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(clientX - rect.left),
      y: Math.round(clientY - rect.top)
    };
  }, []);

  const getTargetId = useCallback((target: EventTarget | null) => {
    const element = target as CaptureTarget | null;
    return element?.closest?.("[data-replay-key]")?.getAttribute("data-replay-key") ?? null;
  }, []);

  const start = useCallback(() => {
    sessionRef.current = createId("draft");
    eventsRef.current = [];
    startRef.current = performance.now();
    lastMouseRef.current = 0;
    setEventCount(0);
    setDuration(0);
    setIsRecording(true);
  }, []);

  const stop = useCallback(() => {
    setIsRecording(false);
  }, []);

  const reset = useCallback(() => {
    eventsRef.current = [];
    startRef.current = 0;
    lastMouseRef.current = 0;
    setEventCount(0);
    setDuration(0);
    setIsRecording(false);
  }, []);

  const save = useCallback(async () => {
    if (!eventsRef.current.length) {
      return;
    }
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: eventsRef.current })
    });
    if (!response.ok) {
      throw new Error("Unable to save session");
    }
    const data = (await response.json()) as { session: { id: string } };
    reset();
    onSaved(data.session.id);
  }, [onSaved, reset]);

  const handlers = {
    onMouseMove: (event: React.MouseEvent<HTMLElement>) => {
      if (!isRecording) {
        return;
      }
      const now = performance.now();
      if (now - lastMouseRef.current < 45) {
        return;
      }
      lastMouseRef.current = now;
      const point = getPoint(event.clientX, event.clientY, event.currentTarget);
      pushEvent({ type: "mousemove", x: point.x, y: point.y, value: null, targetId: null, scrollY: null });
    },
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (!isRecording) {
        return;
      }
      const point = getPoint(event.clientX, event.clientY, event.currentTarget);
      pushEvent({ type: "click", x: point.x, y: point.y, value: null, targetId: getTargetId(event.target), scrollY: null });
    },
    onScroll: (event: React.UIEvent<HTMLElement>) => {
      if (!isRecording) {
        return;
      }
      pushEvent({ type: "scroll", x: null, y: null, value: null, targetId: null, scrollY: Math.round(event.currentTarget.scrollTop) });
    },
    onInput: (event: React.FormEvent<HTMLElement>) => {
      if (!isRecording) {
        return;
      }
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!("value" in target)) {
        return;
      }
      const host = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      pushEvent({
        type: "input",
        x: Math.round(rect.left - hostRect.left + rect.width / 2),
        y: Math.round(rect.top - hostRect.top + rect.height / 2),
        value: target.value,
        targetId: getTargetId(target),
        scrollY: null
      });
    }
  };

  return {
    isRecording,
    eventCount,
    duration,
    handlers,
    start,
    stop,
    reset,
    save
  };
}
