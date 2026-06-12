"use client";
import "./HabitCard.css";
import { useRef, useCallback } from "react";
import { Flame, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { HabitIcon } from "@/components/ui/HabitIcon";
import type { HabitCardProps } from "./HabitCard.types";
import type { CardStyle } from "@/types/models/habit.types";

const GRADIENTS: Record<CardStyle, string> = {
  wavy: "linear-gradient(135deg, #00c6ff 0%, #0061ff 55%, #0033dd 100%)",
  geometric:
    "linear-gradient(135deg, #e8b950 0%, #f0516b 38%, #8b2ff8 78%, #5a20dd 100%)",
  blob: "linear-gradient(125deg, #10b981 0%, #047857 50%, #065f46 100%)",
};

// Pre-computed wavy polyline paths (30 lines × 50 points) — built once at module load
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      onCheckIn(habit._id, today);
      fireConfetti();
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 28,
        background: GRADIENTS[style],
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "20px 20px 22px",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
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

        {/* Description */}
        {habit.description && (
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.72)",
              margin: "0 0 8px",
              lineHeight: 1.4,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {typeof habit.description === 'string' ? habit.description : ''}
          </p>
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

          {/* Check-in button — zIndex 4 so it sits above the confetti canvas */}
          <motion.button
            onClick={handleToggle}
            disabled={loading}
            whileTap={{ scale: 0.88 }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 99,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: habit.isCompletedToday
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.25)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              position: "relative",
              zIndex: 4,
            }}
            aria-label={habit.isCompletedToday ? "Uncheck" : "Check in"}
          >
            {habit.isCompletedToday ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M5 11.5L9 15.5L17 7"
                  stroke="#111"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 5V17M5 11H17"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
