import { useEffect, useState } from "react";

export const SPLASH_EXIT_MS = 500;

const LETTERS = [
  { char: "h", color: "#5B3FCF" },
  { char: "o", color: "#F26B3A" },
  { char: "o", color: "#1FAFA6" },
  { char: "d", color: "#6BA547" },
  { char: "a", color: "#E94B8A" },
];

const DELAYS = [0, 80, 160, 240, 320];

type Props = { leaving?: boolean };

export function SplashScreen({ leaving = false }: Props) {
  const [vis, setVis] = useState<boolean[]>(LETTERS.map(() => false));

  useEffect(() => {
    const timers = DELAYS.map((d, i) =>
      setTimeout(() =>
        setVis(p => { const n = [...p]; n[i] = true; return n; }), d + 120)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      role="status"
      aria-label="A carregar"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        opacity: leaving ? 0 : 1,
        transition: leaving ? `opacity ${SPLASH_EXIT_MS}ms ease` : "none",
        pointerEvents: leaving ? "none" : "all",
      }}
    >
      <div style={{ display: "flex", gap: 2 }}>
        {LETTERS.map((l, i) => (
          <span
            key={i}
            style={{
              fontFamily: '"Nunito", "Quicksand", system-ui, sans-serif',
              fontSize: "clamp(52px, 12vw, 80px)",
              fontWeight: 800,
              color: l.color,
              lineHeight: 1,
              display: "inline-block",
              opacity:   vis[i] ? 1 : 0,
              transform: vis[i] ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
              transition: "opacity 0.4s cubic-bezier(0.34,1.56,0.64,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {l.char}
          </span>
        ))}
      </div>
    </div>
  );
}
