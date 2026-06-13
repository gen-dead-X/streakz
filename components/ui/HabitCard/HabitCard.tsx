"use client";
import "./HabitCard.css";
import { useRef, useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Flame, MoreHorizontal, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { BorderBeam } from "antd";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { RichTextPreview } from "@/components/ui/RichTextPreview";
import { playSound } from "@/lib/audio/playSound";
import type { HabitCardProps } from "./HabitCard.types";
import type { CardStyle } from "@/types/models/habit.types";
import type { BorderBeamColor } from "antd";

const GRADIENTS: Record<CardStyle, string> = {
  wavy: "linear-gradient(135deg, #00c6ff 0%, #0061ff 55%, #0033dd 100%)",
  geometric:
    "linear-gradient(135deg, #e8b950 0%, #f0516b 38%, #8b2ff8 78%, #5a20dd 100%)",
  blob: "linear-gradient(125deg, #10b981 0%, #047857 50%, #065f46 100%)",
  aurora: "linear-gradient(135deg, #00b09b 0%, #57d06e 60%, #96c93d 100%)",
  ember: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
  midnight: "linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)",
  rose: "linear-gradient(135deg, #f093fb 0%, #f5576c 60%, #fd746c 100%)",
};

const SUCCESS_WORDS = ['Done!', 'Yess!', 'At it!', "Let's go!", 'Boom!', 'Keep it!', 'On fire!', 'Perfect!', 'Crushed it!', 'Amazing!'];

type BtnPhase = 'idle' | 'loading' | 'word' | 'done';

function getBeamColor(streak: number, completed: boolean): BorderBeamColor {
  if (completed) return [{ color: '#22c55e', percent: 0 }, { color: '#86efac', percent: 60 }];
  if (streak >= 7) return [{ color: '#f97316', percent: 0 }, { color: '#fbbf24', percent: 35 }, { color: '#22c55e', percent: 60 }];
  if (streak >= 4) return [{ color: '#eab308', percent: 0 }, { color: '#fde047', percent: 60 }];
  if (streak >= 1) return [{ color: '#f97316', percent: 0 }, { color: '#fb923c', percent: 60 }];
  return [{ color: 'rgba(255,255,255,0.55)', percent: 0 }, { color: 'rgba(255,255,255,0.15)', percent: 60 }];
}

const WAVE_LINES: string[] = Array.from({ length: 32 }, (_, i) => {
  const baseX = (i / 31) * 400;
  const phase = i * 0.55;
  const amp = 7 + Math.sin(i * 0.9) * 4;
  return Array.from({ length: 50 }, (_, j) => {
    const y = (j / 49) * 280;
    const x = baseX + Math.sin((j / 49) * Math.PI * 3.5 + phase) * amp;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
});

function WaveTexture() {
  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      viewBox="0 0 400 280"
      preserveAspectRatio="xMidYMid slice"
    >
      {WAVE_LINES.map((pts, i) => (
        <polyline
          key={i}
          points={pts}
          stroke="white"
          strokeWidth="0.9"
          fill="none"
          opacity="0.18"
        />
      ))}
    </svg>
  );
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function HabitCard({
  habit,
  today,
  onCheckIn,
  onUncheck,
  loading,
}: HabitCardProps) {
  const router = useRouter();
  const style: CardStyle = habit.cardStyle ?? "wavy";
  const gradient = GRADIENTS[style];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const waitingForComplete = useRef(false);
  const [isPressing, setIsPressing] = useState(false);
  const [peekOpen, setPeekOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<BtnPhase>(() => habit.isCompletedToday ? 'done' : 'idle');
  const [currentWord, setCurrentWord] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && waitingForComplete.current && habit.isCompletedToday) {
      waitingForComplete.current = false;
      const word = SUCCESS_WORDS[Math.floor(Math.random() * SUCCESS_WORDS.length)];
      setCurrentWord(word);
      setPhase('word');
      const t = setTimeout(() => setPhase('done'), 1400);
      return () => clearTimeout(t);
    }
    if (!loading && waitingForComplete.current && !habit.isCompletedToday) {
      waitingForComplete.current = false;
      setPhase('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (!habit.isCompletedToday && phase === 'done') {
      setPhase('idle');
    }
    if (habit.isCompletedToday && phase === 'idle') {
      setPhase('done');
    }
  }, [habit.isCompletedToday]); // eslint-disable-line react-hooks/exhaustive-deps

  const fireConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fire = confetti.create(canvas, { resize: true, useWorker: false });
    fire({
      particleCount: Math.floor(randomInRange(60, 100)),
      angle: randomInRange(55, 125),
      spread: randomInRange(60, 80),
      origin: { x: 0.5, y: 1.05 },
      startVelocity: randomInRange(28, 38),
      gravity: 1.3,
      decay: 0.92,
      ticks: 200,
      colors: ["#ffffff", "#a3f7b5", "#5eead4", "#6ee7b7", "#fbbf24"],
      shapes: ["circle", "square"],
      scalar: 0.8,
    });
  }, []);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.vibrate?.(100);
    if (habit.isCompletedToday) {
      onUncheck(habit._id, today);
    } else {
      waitingForComplete.current = true;
      setPhase('loading');
      onCheckIn(habit._id, today);
      fireConfetti();
      playSound("/music/streak-complete.wav");
    }
  }

  function startPress() {
    setIsPressing(true);
    pressTimer.current = setTimeout(() => {
      setIsPressing(false);
      setPeekOpen(true);
      navigator.vibrate?.([20, 50, 20]);
    }, 500);
  }

  function cancelPress() {
    clearTimeout(pressTimer.current);
    setIsPressing(false);
  }

  const peekModal = (
    <AnimatePresence>
      {peekOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            background: "rgba(0,0,0,0.72)",
          }}
          onClick={() => setPeekOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 44 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 44 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "80vh",
              borderRadius: 28,
              background: gradient,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: "0 32px 80px rgba(0,0,0,0.65)",
            }}
          >
            <WaveTexture />

            {/* Close button */}
            <button
              onClick={() => setPeekOpen(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: 99,
                background: "rgba(0,0,0,0.38)",
                backdropFilter: "blur(6px)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
              aria-label="Close preview"
            >
              <X size={16} color="rgba(255,255,255,0.9)" />
            </button>

            {/* Scrollable content */}
            <div
              style={{
                overflow: "auto",
                flex: 1,
                padding: "28px 24px 32px",
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Icon + name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <HabitIcon
                    name={habit.icon}
                    size={26}
                    color="rgba(255,255,255,0.95)"
                  />
                </div>
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "#fff",
                    margin: 0,
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {habit.name}
                </h2>
              </div>

              {/* Full description — no height limit */}
              {habit.description && (
                <div
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 14,
                    lineHeight: 1.65,
                    marginBottom: 20,
                  }}
                >
                  <RichTextPreview content={habit.description} />
                </div>
              )}

              {/* Tags */}
              {habit.tags?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 22,
                  }}
                >
                  {habit.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.8)",
                        background: "rgba(255,255,255,0.18)",
                        borderRadius: 99,
                        padding: "4px 10px",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats row */}
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    background: "rgba(0,0,0,0.28)",
                    borderRadius: 16,
                    padding: "12px 18px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 4,
                    }}
                  >
                    Streak
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {habit.currentStreak}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.55)",
                        marginLeft: 5,
                      }}
                    >
                      days
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(0,0,0,0.28)",
                    borderRadius: 16,
                    padding: "12px 18px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 4,
                    }}
                  >
                    Best
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {habit.longestStreak}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.55)",
                        marginLeft: 5,
                      }}
                    >
                      days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 28,
          background: gradient,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "20px 20px 22px",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: "default",
          transform: isPressing ? "scale(0.97)" : "scale(1)",
          transition: isPressing
            ? "none"
            : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
        onContextMenu={(e) => e.preventDefault()}
      >
        <WaveTexture />
        <canvas ref={canvasRef} className="habit-card-canvas" />

        {/* Icon — top-left floating */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <HabitIcon name={habit.icon} size={22} color="rgba(255,255,255,0.95)" />
        </div>

        {/* Edit button — top-right */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/habits/${habit._id}/edit`);
          }}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: 99,
            background: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
          aria-label="Edit streak"
        >
          <MoreHorizontal size={16} color="rgba(255,255,255,0.9)" />
        </button>

        {/* Content — bottom */}
        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Name with strikethrough when completed */}
          <h2
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              margin: "0 0 6px",
              wordBreak: "break-word",
              textDecoration: habit.isCompletedToday ? "line-through" : "none",
              opacity: habit.isCompletedToday ? 0.65 : 1,
              transition: "opacity 0.25s ease",
            }}
          >
            {habit.name}
          </h2>

          {/* Description: fade-masked with eye button */}
          {habit.description && (
            <div style={{ position: "relative", marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.72)",
                  maxHeight: "5em",
                  overflow: "hidden",
                  lineHeight: 1.5,
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 40%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, black 40%, transparent 100%)",
                  paddingRight: 36,
                }}
              >
                <RichTextPreview content={habit.description} />
              </div>
              {/* Eye button — peek trigger */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setPeekOpen(true);
                }}
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 99,
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(6px)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 3,
                }}
                aria-label="Peek description"
              >
                <Eye size={13} color="rgba(255,255,255,0.85)" />
              </button>
            </div>
          )}

          {/* Tags */}
          {habit.tags?.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {habit.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: 99,
                    padding: "3px 9px",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom row: streak + check-in */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: habit.tags?.length > 0 ? 0 : 12,
            }}
          >
            {/* Streak pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(0,0,0,0.28)",
                backdropFilter: "blur(6px)",
                borderRadius: 99,
                padding: "6px 14px",
              }}
            >
              <Flame size={14} color="#fbbf24" />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                {habit.currentStreak}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                {habit.currentStreak === 1 ? "day" : "days"}
              </span>
            </div>

            {/* Check-in button with BorderBeam */}
            <div style={{ position: 'relative', display: 'inline-flex', zIndex: 4 }}>
              <BorderBeam color={getBeamColor(habit.currentStreak, phase === 'done' || habit.isCompletedToday)}>
                <motion.button
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={handleToggle}
                  disabled={phase === 'loading'}
                  whileTap={{ scale: 0.88 }}
                  style={{
                    width: 104,
                    height: 46,
                    borderRadius: 23,
                    border: '1px solid rgba(255,255,255,0.15)',
                    cursor: phase === 'loading' ? 'not-allowed' : 'pointer',
                    background: (phase === 'done' || habit.isCompletedToday)
                      ? 'rgba(34,197,94,0.28)'
                      : 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    transition: 'background 0.35s ease',
                  }}
                  aria-label={habit.isCompletedToday ? 'Uncheck' : 'Check in'}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {phase === 'loading' && (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.18 }}
                        style={{ display: 'flex', gap: 4, alignItems: 'center' }}
                      >
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            style={{
                              width: 5, height: 5, borderRadius: '50%',
                              background: 'rgba(255,255,255,0.8)',
                              animation: `pulse-dot 0.9s ${i * 0.18}s ease-in-out infinite`,
                            }}
                          />
                        ))}
                      </motion.span>
                    )}
                    {phase === 'word' && (
                      <motion.span
                        key={currentWord}
                        initial={{ opacity: 0, y: -18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 18 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        style={{
                          fontSize: 14, fontWeight: 800,
                          color: '#fff',
                          letterSpacing: '-0.2px',
                          userSelect: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {currentWord}
                      </motion.span>
                    )}
                    {phase === 'done' && (
                      <motion.span
                        key="done"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M4 10.5L8 14.5L16 6" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.span>
                    )}
                    {phase === 'idle' && (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.18 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.55)',
                        }} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </BorderBeam>
            </div>
          </div>
        </div>
      </div>

      {/* Peek modal — portalled to document.body */}
      {mounted && createPortal(peekModal, document.body)}
    </>
  );
}
