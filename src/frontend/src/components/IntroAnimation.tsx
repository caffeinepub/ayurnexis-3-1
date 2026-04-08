import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function IntroAnimation({
  onComplete,
}: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  const handleComplete = () => {
    setExiting(true);
    setTimeout(() => onComplete(), 600);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 50), // Eagle flies in
      setTimeout(() => setPhase(2), 1500), // Lion appears
      setTimeout(() => setPhase(3), 3000), // Snakes slither in
      setTimeout(() => setPhase(4), 4500), // Characters arrange into logo shape
      setTimeout(() => setPhase(5), 5300), // Fade characters out, logo + SNIPER appear
    ];
    const endTimer = setTimeout(handleComplete, 7000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(endTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center"
          style={{ background: "#000" }}
        >
          {/* Skip button */}
          <button
            type="button"
            onClick={handleComplete}
            className="absolute top-5 right-6 text-white/60 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors z-20 border border-white/20 hover:border-white/50 px-3 py-1 rounded"
            aria-label="Skip intro"
          >
            Skip
          </button>

          {/* Ambient vignette */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.75) 100%)",
            }}
          />

          {/* ── PHASES 1–4: Characters on stage ── */}
          <div className="relative" style={{ width: 480, height: 520 }}>
            {/* PHASE 1–3: Eagle — top area */}
            <AnimatePresence>
              {phase >= 1 && phase < 5 && (
                <motion.div
                  key="eagle"
                  initial={{ y: -350, opacity: 0, scale: 0.8 }}
                  animate={
                    phase >= 4
                      ? { y: -20, x: 0, scale: 0.75, opacity: 1 }
                      : { y: 0, opacity: 1, scale: 1 }
                  }
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={
                    phase >= 4
                      ? { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }
                      : { duration: 1.3, ease: [0.16, 1, 0.3, 1] }
                  }
                  className="absolute"
                  style={{
                    top: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <EagleSVG flapping={phase === 1} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE 2–4: Lion — center */}
            <AnimatePresence>
              {phase >= 2 && phase < 5 && (
                <motion.div
                  key="lion"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    phase >= 4
                      ? { scale: 0.85, opacity: 1, y: 0 }
                      : { scale: 1, opacity: 1, y: 0 }
                  }
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={
                    phase >= 4
                      ? { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }
                      : { duration: 0.9, ease: "easeOut" }
                  }
                  className="absolute"
                  style={{
                    top: 160,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <LionSVG />
                  {phase >= 2 && phase < 4 && <ShockwaveRings />}
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHASE 3–4: Snakes — bottom */}
            <AnimatePresence>
              {phase >= 3 && phase < 5 && (
                <>
                  <motion.div
                    key="snake-left"
                    initial={{ x: -300, y: 80, opacity: 0, rotate: -25 }}
                    animate={
                      phase >= 4
                        ? { x: -100, y: 20, rotate: 10, opacity: 1 }
                        : { x: -55, y: 40, rotate: 12, opacity: 1 }
                    }
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={
                      phase >= 4
                        ? { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }
                        : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                    }
                    className="absolute"
                    style={{ bottom: 40, left: "50%", marginLeft: -220 }}
                  >
                    <SnakeSVG side="left" />
                  </motion.div>
                  <motion.div
                    key="snake-right"
                    initial={{ x: 300, y: 80, opacity: 0, rotate: 25 }}
                    animate={
                      phase >= 4
                        ? { x: 100, y: 20, rotate: -10, opacity: 1 }
                        : { x: 55, y: 40, rotate: -12, opacity: 1 }
                    }
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={
                      phase >= 4
                        ? { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }
                        : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                    }
                    className="absolute"
                    style={{ bottom: 40, left: "50%", marginLeft: 60 }}
                  >
                    <SnakeSVG side="right" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* ── PHASE 5: Logo + SNIPER text ── */}
          <AnimatePresence>
            {phase >= 5 && (
              <motion.div
                key="final"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                style={{ gap: 0 }}
              >
                {/* Logo image — transparent bg */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ background: "transparent", lineHeight: 0 }}
                >
                  <img
                    src="/assets/fierce_hybrid_emblem_in_black_and_white-019d63e7-c49f-75c1-ac44-cc3addcaf21d.png"
                    alt="SNIPER Emblem"
                    width={200}
                    height={200}
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: "contain",
                      display: "block",
                      background: "transparent",
                      filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))",
                    }}
                  />
                </motion.div>

                {/* Clear gap between logo and text */}
                <div style={{ height: 24 }} />

                {/* SNIPER text — clearly below logo, no overlap */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="sniper-text-outer"
                >
                  <span className="sniper-text">SNIPER</span>
                  <div className="sniper-shine" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <style>{`
            @keyframes wingFlap {
              0%, 100% { transform: scaleY(1) scaleX(1); }
              30% { transform: scaleY(0.82) scaleX(1.1); }
              70% { transform: scaleY(1.08) scaleX(0.95); }
            }
            @keyframes eyeGlow {
              0%, 100% { filter: drop-shadow(0 0 4px #ffd700) drop-shadow(0 0 10px #b8860b); }
              50% { filter: drop-shadow(0 0 14px #fff176) drop-shadow(0 0 28px #ffd700); }
            }
            @keyframes shockwavePulse {
              0% { transform: scale(0.4); opacity: 0.9; }
              100% { transform: scale(3.5); opacity: 0; }
            }
            @keyframes metalShine {
              0% { left: -120%; }
              55% { left: 160%; }
              100% { left: 160%; }
            }
            .sniper-text-outer {
              position: relative;
              overflow: hidden;
              display: inline-block;
            }
            .sniper-text {
              font-family: 'Arial Black', 'Impact', 'Oswald', sans-serif;
              font-size: 3.2rem;
              font-weight: 900;
              letter-spacing: 0.35em;
              color: #ffffff;
              text-shadow: 0 0 24px rgba(255,255,255,0.5), 0 0 48px rgba(255,255,255,0.15), 0 3px 6px rgba(0,0,0,0.9);
              display: block;
              text-transform: uppercase;
              white-space: nowrap;
            }
            .sniper-shine {
              position: absolute;
              top: 0;
              left: -120%;
              width: 70px;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 50%, transparent);
              animation: metalShine 1.4s ease-out 0.2s forwards;
              transform: skewX(-18deg);
              pointer-events: none;
            }
          `}</style>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// Also export as named for compatibility with App.tsx import
export { IntroAnimation };

// ── EAGLE SVG ──────────────────────────────────────────────────────────────────
function EagleSVG({ flapping }: { flapping: boolean }) {
  return (
    <svg
      role="img"
      aria-label="Eagle"
      viewBox="0 0 320 260"
      width="300"
      height="244"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 18px rgba(255,255,255,0.25))" }}
    >
      {/* ── LEFT WING group ── */}
      <g
        style={{
          transformOrigin: "130px 110px",
          animation: flapping ? "wingFlap 0.55s ease-in-out infinite" : "none",
        }}
      >
        {/* Primary feathers outer */}
        <path
          d="M130 110 C100 90, 60 65, 18 38 C14 36, 12 38, 15 41 C30 60, 52 78, 72 96"
          fill="white"
          opacity="0.88"
        />
        <path
          d="M130 115 C108 100, 72 82, 32 58 C28 56, 26 59, 30 63 C45 78, 68 92, 88 106"
          fill="white"
          opacity="0.82"
        />
        <path
          d="M128 122 C110 112, 78 98, 42 80 C38 78, 37 82, 41 85 C56 96, 80 108, 100 118"
          fill="white"
          opacity="0.78"
        />
        {/* Secondary feathers */}
        <path
          d="M126 108 C108 95, 82 78, 52 58 C72 72, 92 88, 106 104Z"
          fill="white"
          opacity="0.65"
        />
        <path
          d="M124 116 C108 106, 84 92, 58 76 C76 88, 98 102, 112 114Z"
          fill="white"
          opacity="0.60"
        />
        {/* Wing coverts */}
        <path
          d="M130 110 C118 100, 98 88, 78 76 C92 90, 112 102, 126 112Z"
          fill="white"
          opacity="0.70"
        />
        <path
          d="M128 120 C116 112, 96 100, 74 88 C90 100, 112 112, 124 120Z"
          fill="white"
          opacity="0.65"
        />
        {/* Wing leading edge */}
        <path
          d="M130 105 C104 88, 72 68, 40 50"
          stroke="rgba(180,180,180,0.4)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Feather tips detail */}
        <path
          d="M20 40 L15 52 M32 60 L26 72 M48 78 L44 90 M64 94 L60 106"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* ── RIGHT WING group ── */}
      <g
        style={{
          transformOrigin: "190px 110px",
          animation: flapping ? "wingFlap 0.55s ease-in-out infinite" : "none",
        }}
      >
        <path
          d="M190 110 C220 90, 260 65, 302 38 C306 36, 308 38, 305 41 C290 60, 268 78, 248 96"
          fill="white"
          opacity="0.88"
        />
        <path
          d="M190 115 C212 100, 248 82, 288 58 C292 56, 294 59, 290 63 C275 78, 252 92, 232 106"
          fill="white"
          opacity="0.82"
        />
        <path
          d="M192 122 C210 112, 242 98, 278 80 C282 78, 283 82, 279 85 C264 96, 240 108, 220 118"
          fill="white"
          opacity="0.78"
        />
        <path
          d="M194 108 C212 95, 238 78, 268 58 C248 72, 228 88, 214 104Z"
          fill="white"
          opacity="0.65"
        />
        <path
          d="M196 116 C212 106, 236 92, 262 76 C244 88, 222 102, 208 114Z"
          fill="white"
          opacity="0.60"
        />
        <path
          d="M190 110 C202 100, 222 88, 242 76 C228 90, 208 102, 194 112Z"
          fill="white"
          opacity="0.70"
        />
        <path
          d="M192 120 C204 112, 224 100, 246 88 C230 100, 208 112, 196 120Z"
          fill="white"
          opacity="0.65"
        />
        <path
          d="M190 105 C216 88, 248 68, 280 50"
          stroke="rgba(180,180,180,0.4)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M300 40 L305 52 M288 60 L294 72 M272 78 L276 90 M256 94 L260 106"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* ── BODY ── */}
      <ellipse cx="160" cy="140" rx="26" ry="38" fill="white" opacity="0.96" />
      {/* Breast feathers */}
      <path
        d="M147 122 C152 130, 158 135, 160 140 C162 135, 168 130, 173 122"
        stroke="rgba(180,180,180,0.5)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M144 132 C150 140, 157 145, 160 150 C163 145, 170 140, 176 132"
        stroke="rgba(180,180,180,0.4)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M145 142 C151 150, 157 155, 160 160 C163 155, 169 150, 175 142"
        stroke="rgba(180,180,180,0.35)"
        strokeWidth="1"
        fill="none"
      />

      {/* ── HEAD ── */}
      <ellipse cx="160" cy="96" rx="20" ry="22" fill="white" />
      {/* Head feather texture */}
      <path
        d="M148 84 C152 80, 158 78, 164 80"
        stroke="rgba(160,160,160,0.5)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M146 90 C150 86, 157 84, 164 86"
        stroke="rgba(160,160,160,0.4)"
        strokeWidth="1"
        fill="none"
      />

      {/* ── BEAK ── */}
      <path
        d="M160 100 C168 96, 178 100, 172 108 C168 112, 162 110, 160 106Z"
        fill="#c8c8c8"
        stroke="rgba(200,200,200,0.6)"
        strokeWidth="0.5"
      />
      {/* Beak hook detail */}
      <path
        d="M172 100 C176 103, 174 108, 170 110"
        stroke="rgba(160,160,160,0.6)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Nostril */}
      <ellipse cx="168" cy="101" rx="2" ry="1.2" fill="rgba(100,100,100,0.5)" />

      {/* ── EYES ── */}
      {/* Eye ring */}
      <circle
        cx="152"
        cy="90"
        r="7"
        fill="rgba(40,40,40,0.9)"
        stroke="white"
        strokeWidth="1.5"
      />
      <circle cx="152" cy="90" r="4.5" fill="#1a0a00" />
      {/* Iris */}
      <circle cx="152" cy="90" r="3" fill="#c8860a" opacity="0.9" />
      {/* Pupil */}
      <circle cx="152" cy="90" r="1.8" fill="#050505" />
      {/* Eye highlight */}
      <circle cx="153.2" cy="89" r="0.9" fill="white" opacity="0.9" />
      {/* Brow ridge */}
      <path
        d="M146 85 C149 83, 153 83, 156 85"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── TAIL FEATHERS ── */}
      <path
        d="M148 174 C142 190, 138 206, 132 220"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.82"
      />
      <path
        d="M153 176 C149 193, 147 208, 144 222"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M158 177 C157 194, 157 210, 157 224"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M163 176 C167 193, 169 208, 172 222"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M168 174 C174 190, 178 206, 184 220"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.82"
      />
      {/* Tail feather barbs */}
      <path
        d="M132 220 L128 226 M144 222 L142 228 M157 224 L157 230 M172 222 L174 228 M184 220 L188 226"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* ── TALONS ── */}
      <path
        d="M150 174 L140 186 C138 189, 137 192, 138 194"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M152 176 L144 188 C143 191, 143 194, 145 195"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M170 174 L180 186 C182 189, 183 192, 182 194"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M168 176 L176 188 C177 191, 177 194, 175 195"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Talon tips */}
      <path
        d="M138 194 L134 198 M145 195 L143 200 M182 194 L186 198 M175 195 L177 200"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

// ── LION SVG ───────────────────────────────────────────────────────────────────
function LionSVG() {
  return (
    <svg
      role="img"
      aria-label="Lion"
      viewBox="0 0 220 220"
      width="220"
      height="220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.15))" }}
    >
      {/* ── MANE — outer spiky ring ── */}
      {/* Long outer spikes */}
      {[
        0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336,
      ].map((angle) => {
        const r = (angle * Math.PI) / 180;
        const cx = 110;
        const cy = 112;
        const x1 = cx + 64 * Math.cos(r);
        const y1 = cy + 64 * Math.sin(r);
        const x2 = cx + 90 * Math.cos(r);
        const y2 = cy + 90 * Math.sin(r);
        // Control point for curve
        const mx = cx + 78 * Math.cos(r + 0.12);
        const my = cy + 78 * Math.sin(r + 0.12);
        return (
          <path
            key={`ms${angle}`}
            d={`M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`}
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
            fill="none"
          />
        );
      })}
      {/* Inner mane layered strands */}
      {[
        12, 36, 60, 84, 108, 132, 156, 180, 204, 228, 252, 276, 300, 324, 348,
      ].map((angle) => {
        const r = (angle * Math.PI) / 180;
        const cx = 110;
        const cy = 112;
        const x1 = cx + 50 * Math.cos(r);
        const y1 = cy + 50 * Math.sin(r);
        const x2 = cx + 72 * Math.cos(r);
        const y2 = cy + 72 * Math.sin(r);
        return (
          <line
            key={`mi${angle}`}
            x1={x1.toFixed(1)}
            y1={y1.toFixed(1)}
            x2={x2.toFixed(1)}
            y2={y2.toFixed(1)}
            stroke="white"
            strokeWidth="1.8"
            opacity="0.50"
            strokeLinecap="round"
          />
        );
      })}
      {/* Mane base circle fill */}
      <circle
        cx="110"
        cy="112"
        r="62"
        fill="rgba(255,255,255,0.04)"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.35"
      />

      {/* ── FACE BASE ── */}
      <ellipse
        cx="110"
        cy="114"
        rx="46"
        ry="44"
        fill="rgba(12,12,12,0.97)"
        stroke="white"
        strokeWidth="1.8"
      />

      {/* ── EARS ── */}
      <path
        d="M72 76 L60 50 L84 68Z"
        fill="rgba(18,18,18,0.95)"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <path
        d="M148 76 L160 50 L136 68Z"
        fill="rgba(18,18,18,0.95)"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.8"
      />
      {/* Inner ear */}
      <path d="M73 73 L64 54 L82 67Z" fill="rgba(255,255,255,0.07)" />
      <path d="M147 73 L156 54 L138 67Z" fill="rgba(255,255,255,0.07)" />

      {/* ── EYES ── */}
      {/* Left eye socket */}
      <ellipse
        cx="94"
        cy="102"
        rx="12"
        ry="10"
        fill="rgba(8,8,8,0.95)"
        stroke="#ffd700"
        strokeWidth="1.8"
        style={{
          animation: "eyeGlow 2.2s ease-in-out infinite",
          filter: "drop-shadow(0 0 6px #ffd700)",
        }}
      />
      {/* Left iris */}
      <ellipse cx="94" cy="102" rx="8" ry="7" fill="#9a6b00" opacity="0.9" />
      {/* Left pupil — vertical slit */}
      <ellipse cx="94" cy="102" rx="2.5" ry="5.5" fill="#050505" />
      {/* Left eye highlight */}
      <ellipse cx="96" cy="99" rx="1.5" ry="1" fill="white" opacity="0.85" />
      {/* Left brow */}
      <path
        d="M84 93 C88 90, 94 89, 100 91"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Right eye socket */}
      <ellipse
        cx="126"
        cy="102"
        rx="12"
        ry="10"
        fill="rgba(8,8,8,0.95)"
        stroke="#ffd700"
        strokeWidth="1.8"
        style={{
          animation: "eyeGlow 2.2s ease-in-out infinite 0.35s",
          filter: "drop-shadow(0 0 6px #ffd700)",
        }}
      />
      <ellipse cx="126" cy="102" rx="8" ry="7" fill="#9a6b00" opacity="0.9" />
      <ellipse cx="126" cy="102" rx="2.5" ry="5.5" fill="#050505" />
      <ellipse cx="128" cy="99" rx="1.5" ry="1" fill="white" opacity="0.85" />
      <path
        d="M120 93 C126 89, 132 90, 136 93"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* ── NOSE ── */}
      <path
        d="M104 116 C107 112, 110 110, 116 112 C120 114, 118 120, 114 122 C112 124, 108 124, 106 122 C102 120, 103 116, 104 116Z"
        fill="white"
        opacity="0.85"
      />
      {/* Nose bridge */}
      <path
        d="M110 106 L110 116"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Nostril details */}
      <ellipse cx="106" cy="119" rx="2.5" ry="1.5" fill="rgba(0,0,0,0.6)" />
      <ellipse cx="114" cy="119" rx="2.5" ry="1.5" fill="rgba(0,0,0,0.6)" />

      {/* ── MOUTH ── */}
      <path
        d="M82 128 Q110 148 138 128"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Upper lip line */}
      <path
        d="M96 126 Q110 122 124 126"
        stroke="white"
        strokeWidth="1.2"
        fill="none"
        opacity="0.5"
      />
      {/* Philtrum */}
      <path
        d="M110 122 L110 128"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* ── TEETH ── */}
      <rect
        x="96"
        y="126"
        width="8"
        height="9"
        rx="1.5"
        fill="white"
        opacity="0.92"
      />
      <rect
        x="106"
        y="127"
        width="6"
        height="7"
        rx="1"
        fill="white"
        opacity="0.82"
      />
      <rect
        x="113"
        y="127"
        width="6"
        height="7"
        rx="1"
        fill="white"
        opacity="0.82"
      />
      <rect
        x="120"
        y="126"
        width="8"
        height="9"
        rx="1.5"
        fill="white"
        opacity="0.92"
      />
      {/* Canine teeth */}
      <path d="M88 126 L86 136 L92 126Z" fill="white" opacity="0.8" />
      <path d="M132 126 L134 136 L128 126Z" fill="white" opacity="0.8" />

      {/* ── TONGUE ── */}
      <path
        d="M94 134 Q110 148 126 134 Q118 154 110 156 Q102 154 94 134Z"
        fill="rgba(200,80,80,0.7)"
      />
      {/* Tongue center groove */}
      <path
        d="M110 136 L110 154"
        stroke="rgba(160,40,40,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* ── WHISKERS ── */}
      <line
        x1="52"
        y1="112"
        x2="84"
        y2="116"
        stroke="white"
        strokeWidth="1.2"
        opacity="0.55"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="118"
        x2="84"
        y2="119"
        stroke="white"
        strokeWidth="1"
        opacity="0.50"
        strokeLinecap="round"
      />
      <line
        x1="52"
        y1="124"
        x2="84"
        y2="122"
        stroke="white"
        strokeWidth="1"
        opacity="0.45"
        strokeLinecap="round"
      />
      <line
        x1="168"
        y1="112"
        x2="136"
        y2="116"
        stroke="white"
        strokeWidth="1.2"
        opacity="0.55"
        strokeLinecap="round"
      />
      <line
        x1="170"
        y1="118"
        x2="136"
        y2="119"
        stroke="white"
        strokeWidth="1"
        opacity="0.50"
        strokeLinecap="round"
      />
      <line
        x1="168"
        y1="124"
        x2="136"
        y2="122"
        stroke="white"
        strokeWidth="1"
        opacity="0.45"
        strokeLinecap="round"
      />
      {/* Whisker dots */}
      {[
        { x: 88, y: 112 },
        { x: 90, y: 118 },
        { x: 88, y: 124 },
      ].map(({ x, y }) => (
        <circle
          key={`wdl-${y}`}
          cx={x}
          cy={y}
          r="1.5"
          fill="white"
          opacity="0.7"
        />
      ))}
      {[
        { x: 132, y: 112 },
        { x: 130, y: 118 },
        { x: 132, y: 124 },
      ].map(({ x, y }) => (
        <circle
          key={`wdr-${y}`}
          cx={x}
          cy={y}
          r="1.5"
          fill="white"
          opacity="0.7"
        />
      ))}
    </svg>
  );
}

// ── SHOCKWAVE RINGS ────────────────────────────────────────────────────────────
function ShockwaveRings() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ top: 0, left: 0 }}
    >
      {[
        { delay: 0, idx: 0 },
        { delay: 0.35, idx: 1 },
        { delay: 0.7, idx: 2 },
      ].map(({ delay, idx }) => (
        <div
          key={`sw-${idx}`}
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: `${2 - idx * 0.4}px solid rgba(255,215,0,${0.5 - idx * 0.1})`,
            animation: `shockwavePulse 1.4s ease-out ${delay}s infinite`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

// ── SNAKE SVG ──────────────────────────────────────────────────────────────────
function SnakeSVG({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <svg
      role="img"
      aria-label={`${side} snake`}
      viewBox="0 0 110 200"
      width="110"
      height="200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: isLeft ? "scaleX(-1)" : "scaleX(1)",
        filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))",
      }}
    >
      {/* ── BODY OUTLINE ── */}
      <path
        id={`snake-body-${side}`}
        d="M55 18 C75 18, 88 34, 82 52 C76 70, 52 72, 46 90 C40 108, 56 122, 66 136 C76 150, 80 168, 68 182"
        stroke="white"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Body fill */}
      <path
        d="M55 18 C75 18, 88 34, 82 52 C76 70, 52 72, 46 90 C40 108, 56 122, 66 136 C76 150, 80 168, 68 182"
        stroke="rgba(30,30,30,0.85)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      {/* ── SCALE PATTERN ── */}
      {/* Scales along body — oval shapes */}
      <path
        d="M57 26 C62 24, 68 25, 70 29 C68 33, 62 33, 57 30Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M74 36 C79 33, 85 35, 86 39 C84 43, 79 43, 74 40Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M80 48 C85 45, 88 48, 87 52 C85 56, 80 55, 78 51Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M72 62 C76 59, 80 61, 79 65 C77 69, 72 68, 70 64Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M60 74 C64 71, 68 73, 67 77 C65 81, 60 80, 58 76Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M48 86 C52 83, 56 85, 55 89 C53 93, 48 92, 46 88Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M44 100 C48 97, 52 99, 51 103 C49 107, 44 106, 42 102Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M50 114 C54 111, 58 113, 57 117 C55 121, 50 120, 48 116Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M60 126 C64 123, 68 125, 67 129 C65 133, 60 132, 58 128Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M70 140 C74 137, 78 139, 77 143 C75 147, 70 146, 68 142Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M74 154 C78 151, 82 153, 81 157 C79 161, 74 160, 72 156Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      <path
        d="M70 168 C74 165, 77 168, 75 172 C73 175, 69 174, 68 170Z"
        fill="rgba(255,255,255,0.12)"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.6"
      />
      {/* Ventral belly scales — center line */}
      <path
        d="M57 22 C70 36, 80 52, 72 68 C64 84, 48 90, 46 106 C44 120, 58 134, 68 148 C76 162, 74 176, 67 186"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
        strokeDasharray="5 6"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* ── HEAD ── */}
      {/* Head base */}
      <ellipse
        cx="55"
        cy="14"
        rx="18"
        ry="14"
        fill="rgba(15,15,15,0.95)"
        stroke="white"
        strokeWidth="1.8"
      />
      {/* Head top ridge */}
      <path
        d="M44 8 C50 4, 60 4, 66 8"
        stroke="white"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Jaw line */}
      <path
        d="M38 14 C42 20, 50 22, 55 21 C60 22, 68 20, 72 14"
        stroke="white"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      {/* Head scales */}
      <path
        d="M48 8 C52 6, 58 6, 62 8 C60 11, 52 11, 48 8Z"
        fill="rgba(255,255,255,0.1)"
        stroke="white"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* ── EYE ── */}
      <ellipse
        cx="66"
        cy="10"
        rx="5.5"
        ry="4.5"
        fill="rgba(5,5,5,0.95)"
        stroke="#ffd700"
        strokeWidth="1.2"
        style={{ filter: "drop-shadow(0 0 4px #c8a200)" }}
      />
      {/* Slit pupil */}
      <ellipse
        cx="66"
        cy="10"
        rx="1.5"
        ry="3.5"
        fill="#ffd700"
        opacity="0.85"
      />
      <ellipse cx="66" cy="10" rx="0.7" ry="2.8" fill="#050505" />
      {/* Eye highlight */}
      <circle cx="67.2" cy="8.8" r="0.8" fill="white" opacity="0.8" />
      {/* Supraocular scale */}
      <path
        d="M62 7 C64 5, 68 5, 70 7"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* ── FORKED TONGUE ── */}
      <path
        d="M40 13 L28 7"
        stroke="#cc3333"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28 7 L22 2 M28 7 L22 12"
        stroke="#cc3333"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Tongue opening */}
      <ellipse cx="42" cy="13" rx="3" ry="2" fill="rgba(180,30,30,0.5)" />

      {/* ── TAIL COIL ── */}
      <path
        d="M68 182 C60 192, 50 196, 44 190 C38 184, 40 174, 50 172 C58 170, 62 178, 58 184 C54 190, 46 188, 46 184"
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Tail scales */}
      <path
        d="M60 186 C62 183, 65 184, 64 187Z"
        fill="rgba(255,255,255,0.15)"
        stroke="white"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <path
        d="M52 188 C54 185, 57 186, 56 189Z"
        fill="rgba(255,255,255,0.15)"
        stroke="white"
        strokeWidth="0.5"
        opacity="0.5"
      />
    </svg>
  );
}
