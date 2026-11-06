"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export function A4Preview({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [frameHeight, setFrameHeight] = useState<number>();

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const sheet = sheetRef.current;
    if (!frame || !sheet) return;

    const update = () => {
      const next = Math.min(1, frame.clientWidth / A4_WIDTH_PX);
      setScale(next);
      setFrameHeight(sheet.offsetHeight * next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className="a4-preview-frame w-full overflow-hidden"
      style={{ height: frameHeight }}
    >
      <div
        ref={sheetRef}
        className="a4-sheet mx-auto origin-top-left bg-white shadow-sm ring-1 ring-slate-200"
        style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
