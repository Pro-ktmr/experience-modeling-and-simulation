import { useEffect, useRef } from "react";
import { SimulationFrame } from "./CanvasFrame";
import CanvasFrame from "./CanvasFrame";
import styles from "./SimulationStrip.module.css";

export default function SimulationStrip({ frames }: { frames: SimulationFrame[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollLeft = scroll.scrollWidth;
  }, [frames.length]);

  return (
    <div className={styles.scroll} aria-live="polite" ref={scrollRef}>
      <div className={styles.track}>
        {frames.map((frame) => (
          <CanvasFrame key={frame.step} frame={frame} />
        ))}
      </div>
    </div>
  );
}
