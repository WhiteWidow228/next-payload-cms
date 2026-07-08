"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function parseValue(value: string) {
  const match = value.match(/^(\D*?)(\d+)(.*)$/);

  if (!match) {
    return { prefix: "", target: 0, suffix: value, isNumber: false };
  }

  return {
    prefix: match[1] || "",
    target: Number(match[2]),
    suffix: match[3] || "",
    isNumber: true,
  };
}

export function AnimatedStatValue({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const parsed = useMemo(() => parseValue(value), [value]);
  const [current, setCurrent] = useState(parsed.isNumber ? 1 : 0);

  useEffect(() => {
    if (!parsed.isNumber) {
      return;
    }

    let frameId = 0;

    const setFinalValue = () => {
      frameId = requestAnimationFrame(() => setCurrent(parsed.target));
    };

    if (parsed.target <= 1) {
      setFinalValue();
      return () => cancelAnimationFrame(frameId);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setFinalValue();
      return () => cancelAnimationFrame(frameId);
    }

    const element = ref.current;
    let startedAt = 0;
    const duration = Math.min(1800, Math.max(900, parsed.target * 14));

    const animate = (time: number) => {
      if (!startedAt) {
        startedAt = time;
      }

      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(1 + (parsed.target - 1) * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    const startAnimation = () => {
      startedAt = 0;
      frameId = requestAnimationFrame(animate);
    };

    if (!element || !("IntersectionObserver" in window)) {
      startAnimation();
      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [parsed.isNumber, parsed.target]);

  if (!parsed.isNumber) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className} ref={ref}>
      {parsed.prefix}
      {current}
      {parsed.suffix}
    </span>
  );
}