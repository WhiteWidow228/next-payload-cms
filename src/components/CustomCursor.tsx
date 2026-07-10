"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, summary, [role='button'], [data-estimate-trigger]";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");

    if (!pointerQuery.matches) {
      return;
    }

    const root = document.documentElement;
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) {
      return;
    }

    root.classList.add("custom-cursor-active");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };
    let frameId = 0;

    const positionElement = (element: HTMLDivElement, x: number, y: number) => {
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    };

    const render = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      positionElement(ring, current.x, current.y);
      frameId = requestAnimationFrame(render);
    };

    const handleMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      positionElement(dot, target.x, target.y);
      root.classList.add("custom-cursor-visible");

      const element = event.target instanceof Element ? event.target : null;
      root.classList.toggle("custom-cursor-interactive", Boolean(element?.closest(INTERACTIVE_SELECTOR)));
    };

    const handleLeave = () => {
      root.classList.remove("custom-cursor-visible", "custom-cursor-interactive", "custom-cursor-pressed");
    };

    const handleDown = () => root.classList.add("custom-cursor-pressed");
    const handleUp = () => root.classList.remove("custom-cursor-pressed");

    positionElement(dot, target.x, target.y);
    positionElement(ring, current.x, current.y);
    frameId = requestAnimationFrame(render);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      root.classList.remove("custom-cursor-active", "custom-cursor-visible", "custom-cursor-interactive", "custom-cursor-pressed");
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="custom-cursor-dot" ref={dotRef} />
      <div aria-hidden="true" className="custom-cursor-ring" ref={ringRef} />
    </>
  );
}