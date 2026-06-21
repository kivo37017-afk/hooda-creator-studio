import { useEffect, useState } from "react";

export const SPLASH_EXIT_MS = 700;

/*
  Animação de arranque da hooda Studio.
  
  Sequência:
  0.0s  fundo roxo-escuro
  0.3s  letras "hooda" surgem uma a uma com glow
  1.1s  "studio" aparece por baixo
  1.5s  pulso de luz suave
  2.8s  fade-out + scale (controlado pelo pai via `leaving`)
*/

const LETTERS = [
  { char: "h", color: "#5B3FCF", glow: "rgba(91,63,207,0.9)"  },
  { char: "o", color: "#F26B3A", glow: "rgba(242,107,58,0.9)" },
  { char: "o", color: "#1FAFA6", glow: "rgba(31,175,166,0.9)" },
  { char: "d", color: "#6BA547", glow: "rgba(107,165,71,0.9)" },
  { char: "a", color: "#E94B8A", glow: "rgba(233,75,138,0.9)" },
];

const LETTER_DELAYS = [300, 450, 580, 710, 830];

type Props = { leaving?: boolean };

export function SplashScreen({ leaving = false }: Props) {
  const [letterVis, setLetterVis]   = useState<boolean[]>(LETTERS.map(() => false));
  const [studioVis, setStudioVis]   = useState(false);
  const [pulseVis,  setPulseVis]    = useState(false);
  const [sweepVis,  setSweepVis]    = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setSweepVis(true), 100);

    const lt = LETTER_DELAYS.map((d, i) =>
      setTimeout(() => setLetterVis(p => { const n = [...p]; n[i] = true; return n; }), d)
    );

    const t1 = setTimeout(() => setStudioVis(true), 1100);
    const t2 = setTimeout(() => setPulseVis(true),  1500);

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); lt.forEach(clearTimeout); };
  }, []);

  return (
    <div
      aria-label="A carregar o Hooda Studio"
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 55%, #1e0d40 0%, #0e0620 55%, #07041a 100%)",
        opacity:   leaving ? 0 : 1,
        transform: leaving ? "scale(1.05)" : "scale(1)",
        transition: leaving
          ? `opacity ${SPLASH_EXIT_MS}ms cubic-bezier(0.4,0,1,1), transform ${SPLASH_EXIT_MS}ms cubic-bezier(0.4,0,1,1)`
          : "none",
        pointerEvents: leaving ? "none" : "all",
      }}
    >
      {/* Partículas */}
      <Particles />

      {/* Sweep line */}
      <div style={{
        position: "absolute",
        top: "calc(50% - 58px)",
        left: "50%",
        transform: "translateX(-50%)",
        height: 1.5,
        width: sweepVis ? "min(360px,80vw)" : 0,
        background: "linear-gradient(90deg, transparent, rgba(91,63,207,0.7) 30%, rgba(233,75,138,0.7) 70%, transparent)",
        transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
        borderRadius: 999,
        boxShadow: "0 0 14px 2px rgba(91,63,207,0.4)",
      }} />

      {/* Logo + studio */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>

        {/* Pulse rings */}
        {[0,1].map(i => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width:  pulseVis ? (i===0 ? 260 : 360) : 0,
            height: pulseVis ? (i===0 ? 110 : 145) : 0,
            borderRadius: "50%",
            border: `${i===0?1.5:1}px solid rgba(91,63,207,${i===0?0.35:0.15})`,
            boxShadow: `0 0 ${i===0?24:48}px rgba(91,63,207,${i===0?0.12:0.06})`,
            opacity: pulseVis ? 1 : 0,
            transition: `all 0.9s cubic-bezier(0.4,0,0.2,1) ${i*0.18}s`,
            pointerEvents: "none",
          }} />
        ))}

        {/* Letras */}
        <div style={{ display: "flex", gap: 3 }}>
          {LETTERS.map((l, i) => (
            <span key={i} style={{
              fontFamily: '"Nunito","Quicksand",system-ui,sans-serif',
              fontSize: "clamp(68px,15vw,108px)",
              fontWeight: 800,
              color: l.color,
              display: "inline-block",
              lineHeight: 1,
              opacity:   letterVis[i] ? 1 : 0,
              transform: letterVis[i] ? "translateY(0) scale(1)" : "translateY(44px) scale(0.55)",
              transition: "opacity 0.55s cubic-bezier(0.34,1.56,0.64,1), transform 0.55s cubic-bezier(0.34,1.56,0.64,1)",
              textShadow: letterVis[i]
                ? `0 0 28px ${l.glow}, 0 0 56px ${l.glow.replace("0.9","0.35")}, 0 4px 16px rgba(0,0,0,0.6)`
                : "none",
            }}>
              {l.char}
            </span>
          ))}
        </div>

        {/* "studio" */}
        <div style={{
          letterSpacing: "0.4em",
          fontSize: 13,
          fontWeight: 700,
          fontFamily: '"Nunito",system-ui,sans-serif',
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          opacity:   studioVis ? 1 : 0,
          transform: studioVis ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          studio
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{
        position: "absolute", bottom: 44,
        left: "50%", transform: "translateX(-50%)",
        width: 100, height: 2, borderRadius: 999,
        background: "rgba(255,255,255,0.07)", overflow: "hidden",
        opacity: sweepVis ? 1 : 0, transition: "opacity 0.4s ease",
      }}>
        <div style={{
          height: "100%", borderRadius: 999,
          background: "linear-gradient(90deg,#5B3FCF,#E94B8A,#1FAFA6)",
          width: sweepVis ? "100%" : "0%",
          transition: sweepVis ? "width 2.6s cubic-bezier(0.4,0,0.2,1)" : "none",
        }} />
      </div>
    </div>
  );
}

function Particles() {
  const dots = [
    { x:"14%", y:"18%", s:3,   c:"#5B3FCF", d:0.4, r:3.1 },
    { x:"83%", y:"14%", s:2,   c:"#E94B8A", d:0.9, r:2.7 },
    { x:"89%", y:"68%", s:3.5, c:"#1FAFA6", d:0.2, r:3.9 },
    { x:"9%",  y:"74%", s:2.5, c:"#F26B3A", d:1.1, r:3.4 },
    { x:"51%", y:"87%", s:2,   c:"#6BA547", d:0.6, r:2.5 },
    { x:"71%", y:"28%", s:2,   c:"#5B3FCF", d:1.3, r:3.7 },
    { x:"26%", y:"58%", s:1.5, c:"#E94B8A", d:0.7, r:2.8 },
    { x:"61%", y:"77%", s:2.5, c:"#F26B3A", d:0.3, r:3.2 },
  ];
  return (
    <>
      {dots.map((d,i) => (
        <div key={i} style={{
          position:"absolute", left:d.x, top:d.y,
          width:d.s, height:d.s, borderRadius:"50%",
          background:d.c, boxShadow:`0 0 ${d.s*4}px ${d.c}`,
          animation:`hoodaFloat ${d.r}s ease-in-out ${d.d}s infinite alternate`,
          opacity:0.7,
        }} />
      ))}
      <style>{`@keyframes hoodaFloat{from{opacity:.4;transform:translateY(0)}to{opacity:.9;transform:translateY(-8px)}}`}</style>
    </>
  );
}
