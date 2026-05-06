"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "@/lib/time";
import type { ReplayEvent } from "@/lib/types";

type CursorState = {
  x: number;
  y: number;
  visible: boolean;
};

export function useReplay(events: ReplayEvent[], duration: number) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.timestamp - b.timestamp), [events]);

  const playback = useMemo(() => {
    const current = sortedEvents.filter((event) => event.timestamp <= currentTime);
    const pointerEvents = sortedEvents.filter((event) => (event.type === "mousemove" || event.type === "click") && event.x !== null && event.y !== null);
    const previousPointer = [...pointerEvents].reverse().find((event) => event.timestamp <= currentTime);
    const nextPointer = pointerEvents.find((event) => event.timestamp > currentTime);
    let cursor: CursorState = { x: 80, y: 80, visible: false };

    if (previousPointer && nextPointer) {
      const distance = nextPointer.timestamp - previousPointer.timestamp || 1;
      const progress = clamp((currentTime - previousPointer.timestamp) / distance, 0, 1);
      cursor = {
        x: (previousPointer.x ?? 0) + ((nextPointer.x ?? 0) - (previousPointer.x ?? 0)) * progress,
        y: (previousPointer.y ?? 0) + ((nextPointer.y ?? 0) - (previousPointer.y ?? 0)) * progress,
        visible: true
      };
    } else if (previousPointer) {
      cursor = { x: previousPointer.x ?? 0, y: previousPointer.y ?? 0, visible: true };
    }

    const click = [...sortedEvents].reverse().find((event) => event.type === "click" && currentTime - event.timestamp >= 0 && currentTime - event.timestamp < 360);
    const active = [...current].reverse().find((event) => event.targetId && currentTime - event.timestamp < 1200);
    const inputValues = current.reduce<Record<string, string>>((values, event) => {
      if (event.type === "input" && event.targetId) {
        values[event.targetId] = event.value ?? "";
      }
      return values;
    }, {});
    const scrollEvents = sortedEvents.filter((event) => event.type === "scroll" && event.scrollY !== null);
    const previousScroll = [...scrollEvents].reverse().find((event) => event.timestamp <= currentTime);
    const nextScroll = scrollEvents.find((event) => event.timestamp > currentTime);
    let scrollY = previousScroll?.scrollY ?? 0;

    if (previousScroll && nextScroll) {
      const range = nextScroll.timestamp - previousScroll.timestamp || 1;
      const progress = clamp((currentTime - previousScroll.timestamp) / range, 0, 1);
      scrollY = Math.round((previousScroll.scrollY ?? 0) + ((nextScroll.scrollY ?? 0) - (previousScroll.scrollY ?? 0)) * progress);
    }

    return {
      cursor,
      click,
      activeTargetId: active?.targetId ?? null,
      inputValues,
      scrollY,
      eventIndex: current.length
    };
  }, [currentTime, sortedEvents]);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }
    viewportRef.current.scrollTop = playback.scrollY;
  }, [playback.scrollY]);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [events]);

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      return;
    }

    const tick = (time: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = time;
      }
      const delta = (time - lastFrameRef.current) * speed;
      lastFrameRef.current = time;
      setCurrentTime((value) => {
        const next = value + delta;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, isPlaying, speed]);

  const scrub = useCallback((value: number) => {
    setCurrentTime(clamp(value, 0, duration));
  }, [duration]);

  const restart = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  return {
    viewportRef,
    isPlaying,
    currentTime,
    speed,
    playback,
    setSpeed,
    setIsPlaying,
    scrub,
    restart
  };
}
