import { useEffect, useState } from "react";

export const SPLASH_EXIT_MS = 600;

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  HOODA STUDIO — SPLASH ANIMATION                            ║
  ║                                                              ║
  ║  Sequência (total ≈ 2.8 s antes do exit):                   ║
  ║  0.0s  fundo preto-roxo entra                                ║
  ║  0.2s  linha horizontal cresce do centro (sweep)            ║
  ║  0.7s  letras sobem uma a uma com glow colorido             ║
  ║  1.6s  "studio" aparece em baixo pequeno                    ║
  ║  2.0s  pulso de luz suave em torno do logo                  ║
  ║  2.4s  tudo faz scale-up + fade-out (exit)                  ║
  ╚══════════════════════════════════════════════════════════════╝
*/

const LETTERS = [
  { char: "h", color: "#5B3FCF", glow: "rgba(91,63,207,0.9)"  },
  { char: "o", color: "#F26B3A", glow: "rgba(242,107,58,0.9)" },
  { char: "o", color: "#1FAFA6", glow: "rgba(31,175,166,0.9)" },
  { char: "d", color: "#6BA547", glow: "rgba(107,165,71,0.9)" },
  { char: "a", color: "#E94B8A", glow: "rgba(233,75,138,0.9)" },
];

/* Delays para cada letra (ms) */
const LETTER_DELAYS = [700, 850, 980, 1110, 1230];

type Props = { leaving?: boolean };

export function SplashScreen({ leaving = false }: Props) {
  /* ── Estados de cada fase ── */
  const [sweepDone,   setSweepDone]   = useState(false); // linha cresceu
  const [lettersDone, setLettersDone] = useState(false); // letras visíveis
  const [studioDone,  setStudioDone]  = useState(false); // "studio" visível
  const [pulseDone,   setPulseDone]   = useState(false); // anel de pulso
  const [letterVis,   setLetterVis]   = useState<boolean[]>(LETTERS.map(() => false));

  useEffect(() => {
    /* Linha sweep */
    const t0 = setTimeout(() => setSweepDone(true), 200);

    /* Letras individuais */
    const letterTimers = LETTER_DELAYS.map((delay, i) =>
      setTimeout(() => {
        setLetterVis(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay)
    );

    /* "studio" tag */
    const t1 = setTimeout(() => {
      setLettersDone(true);
      setStudioDone(true);
    }, 1600);

    /* Pulso */
    const t2 = setTimeout(() => setPulseDone(true), 2000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      letterTimers.forEach(clearTimeout);
    };
  }, []);

  /* ── Background gradient — roxo escuro próprio da hooda ── */
  const bg = "radial-gradient(ellipse at 50% 60%, #1a0d3a 0%, #0d0618 55%, #060410 100%)";

  return (
    <div
      role="status"
      aria-label="A carregar o Hooda Studio"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        /* Exit: scale ligeiro + fade */
        opacity:   leaving ? 0   : 1,
        transform: leaving ? "scale(1.06)" : "scale(1)",
        transition: leaving
          ? `opacity ${SPLASH_EXIT_MS}ms cubic-bezier(0.4,0,1,1), transform ${SPLASH_EXIT_MS}ms cubic-bezier(0.4,0,1,1)`
          : "none",
      }}
    >
      {/* ── Partículas de fundo (círculos de cor suaves) ── */}
      <Particles />

      {/* ── Linha horizontal sweep ── */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        height: 1.5,
        width: sweepDone ? "min(340px, 80vw)" : 0,
        background: "linear-gradient(90deg, transparent, rgba(91,63,207,0.6) 30%, rgba(233,75,138,0.6) 70%, transparent)",
        transition: "width 0.45s cubic-bezier(0.4,0,0.2,1)",
        borderRadius: 999,
        boxShadow: "0 0 12px 2px rgba(91,63,207,0.35)",
        marginTop: -52,
      }} />

      {/* ── Logo wrapper ── */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>

        {/* Anel de pulso atrás do logo */}
        <PulseRing active={pulseDone} />

        {/* Letras */}
        <div style={{ display: "flex", gap: 4, lineHeight: 1 }}>
          {LETTERS.map((l, i) => (
            <span
              key={i}
              style={{
                fontFamily: '"Nunito", "Quicksand", system-ui, sans-serif',
                fontSize: "clamp(64px, 14vw, 100px)",
                fontWeight: 800,
                color: l.color,
                display: "inline-block",
                opacity:    letterVis[i] ? 1 : 0,
                transform:  letterVis[i] ? "translateY(0) scale(1)" : "translateY(40px) scale(0.6)",
                transition: `opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)`,
                textShadow: letterVis[i]
                  ? `0 0 30px ${l.glow}, 0 0 60px ${l.glow.replace("0.9", "0.4")}, 0 4px 20px rgba(0,0,0,0.5)`
                  : "none",
                filter: letterVis[i] ? "brightness(1.15)" : "brightness(1)",
                letterSpacing: "-1px",
              }}
            >
              {l.char}
            </span>
          ))}
        </div>

        {/* "studio" tag */}
        <div style={{
          letterSpacing: "0.35em",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: '"Nunito", system-ui, sans-serif',
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          opacity:   studioDone ? 1 : 0,
          transform: studioDone ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          studio
        </div>
      </div>

      {/* ── Linha inferior (barra de progresso decorativa) ── */}
      <LoadBar active={sweepDone} leaving={leaving} />
    </div>
  );
}

/* ─── Anel de pulso ─── */
function PulseRing({ active }: { active: boolean }) {
  return (
    <>
      {[0, 1].map(i => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width:  active ? (i === 0 ? 240 : 320) : 0,
            height: active ? (i === 0 ? 100 : 130) : 0,
            borderRadius: "50%",
            border: `${i === 0 ? 1.5 : 1}px solid rgba(91,63,207,${i === 0 ? 0.35 : 0.15})`,
            boxShadow: `0 0 ${i === 0 ? 20 : 40}px rgba(91,63,207,${i === 0 ? 0.15 : 0.08})`,
            opacity: active ? 1 : 0,
            transition: `all 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s`,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

/* ─── Barra de progresso decorativa ─── */
function LoadBar({ active, leaving }: { active: boolean; leaving: boolean }) {
  return (
    <div style={{
      position: "absolute",
      bottom: 40,
      left: "50%",
      transform: "translateX(-50%)",
      width: 120,
      height: 2,
      borderRadius: 999,
      background: "rgba(255,255,255,0.08)",
      overflow: "hidden",
      opacity: leaving ? 0 : (active ? 1 : 0),
      transition: "opacity 0.3s ease",
    }}>
      <div style={{
        height: "100%",
        borderRadius: 999,
        background: "linear-gradient(90deg, #5B3FCF, #E94B8A, #1FAFA6)",
        width: active ? "100%" : "0%",
        transition: active ? "width 2.2s cubic-bezier(0.4,0,0.2,1)" : "none",
      }} />
    </div>
  );
}

/* ─── Partículas de fundo ─── */
function Particles() {
  const dots = [
    { x: "15%", y: "20%", size: 3,  color: "#5B3FCF", delay: 0.3,  dur: 3.2 },
    { x: "82%", y: "15%", size: 2,  color: "#E94B8A", delay: 0.8,  dur: 2.8 },
    { x: "90%", y: "70%", size: 4,  color: "#1FAFA6", delay: 0.1,  dur: 4.0 },
    { x: "8%",  y: "75%", size: 3,  color: "#F26B3A", delay: 1.0,  dur: 3.5 },
    { x: "50%", y: "88%", size: 2,  color: "#6BA547", delay: 0.5,  dur: 2.6 },
    { x: "70%", y: "30%", size: 2,  color: "#5B3FCF", delay: 1.2,  dur: 3.8 },
    { x: "25%", y: "60%", size: 1.5,color: "#E94B8A", delay: 0.6,  dur: 2.9 },
    { x: "60%", y: "78%", size: 2.5,color: "#F26B3A", delay: 0.2,  dur: 3.3 },
  ];

  return (
    <>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x, top: d.y,
            width:  d.size, height: d.size,
            borderRadius: "50%",
            background: d.color,
            boxShadow: `0 0 ${d.size * 4}px ${d.color}`,
            animation: `hoodaFloat ${d.dur}s ease-in-out ${d.delay}s infinite alternate`,
            opacity: 0.7,
          }}
        />
      ))}
      <style>{`
        @keyframes hoodaFloat {
          from { opacity: 0.4; transform: translateY(0px); }
          to   { opacity: 0.9; transform: translateY(-8px); }
        }
      `}</style>
    </>
  );
}
