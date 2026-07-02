"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "antd";
import { useRouter } from "next/navigation";
import { User, Settings2, ChevronDown, Plus, Check, Flame } from "lucide-react";
import { useHabitSheetStore } from "@/store/habitSheet/habitSheet.store";
import { format, addDays, getDay } from "date-fns";
import { useHabitsStore } from "@/store/habits/habits.store";
import { useDarkMode } from "@/hooks/theme/useDarkMode";
import { useCheckIn } from "@/hooks/checkin/useCheckIn";
import { HabitIcon } from "@/components/ui/HabitIcon";
import type { DaySummary } from "@/types/api/habits.types";

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

const DOW_LABEL = ["M", "T", "W", "T", "F", "S", "S"];
const CELL_W    = 44;

const LIVE_DOT_ANIMATE = { scale: [1, 1.35, 1] as [number, number, number], opacity: [1, 0.55, 1] as [number, number, number] };
const LIVE_DOT_TRANSITION = { duration: 1.9, repeat: Infinity, ease: "easeInOut" as const };
const ISLAND_FADE_TRANSITION = { delay: 0.14, duration: 0.22 };
const ISLAND_BODY_TRANSITION = { delay: 0.2, duration: 0.22 };
const ISLAND_SPRING = { type: "spring" as const, stiffness: 360, damping: 34 };

const MENU_ITEM: React.CSSProperties = {
  display:    "flex",
  alignItems: "center",
  gap:        10,
  width:      "100%",
  padding:    "13px 16px",
  background: "none",
  border:     "none",
  cursor:     "pointer",
  color:      "var(--color-text-heading)",
  fontSize:   15,
  fontWeight: 500,
  textAlign:  "left",
};

/** Today ±3 days — 7 cells, today always center (index 3) */
function buildWindowDates(todayStr: string): string[] {
  const base = new Date(todayStr + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(base, i - 3), "yyyy-MM-dd"),
  );
}

function dowIndex(dateStr: string): number {
  return (getDay(new Date(dateStr + "T00:00:00")) + 6) % 7;
}

export function PageHeader({ user }: PageHeaderProps) {
  const router       = useRouter();
  const dark         = useDarkMode();
  const openAdd      = useHabitSheetStore((s) => s.openAdd);

  const [menuOpen, setMenuOpen]             = useState(false);
  const [mounted, setMounted]               = useState(false);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [islandRect, setIslandRect]         = useState<DOMRect | null>(null);
  const [pendingId, setPendingId]           = useState<string | null>(null);
  const [showPct, setShowPct]               = useState(true);

  const menuRef        = useRef<HTMLDivElement>(null);
  const dropdownRef    = useRef<HTMLDivElement>(null);
  const todayCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const today        = format(new Date(), "yyyy-MM-dd");
  const month        = format(new Date(), "MMM");
  const todayLabel   = format(new Date(today + "T00:00:00"), "EEE, MMM d");
  const todayDayName = format(new Date(today + "T00:00:00"), "EEEE"); // "Friday"
  const todayDayNum  = format(new Date(today + "T00:00:00"), "d");    // "26"
  const todayMonth   = format(new Date(today + "T00:00:00"), "MMMM"); // "June"

  const windowDates = useMemo(() => buildWindowDates(today), [today]);

  const habits   = useHabitsStore((s) => s.habits);
  const uncheck  = useHabitsStore((s) => s.uncheck);
  const { checkIn } = useCheckIn();
  const [summaries, setSummaries] = useState<DaySummary[]>([]);

  const completedHabits = habits.filter((h) => h.isCompletedToday);
  const pendingHabits   = habits.filter((h) => !h.isCompletedToday);
  const todayDone       = completedHabits.length;
  const todayTotal      = habits.length;
  const todayPct        = todayTotal > 0 ? todayDone / todayTotal : 0;
  const maxStreak       = habits.reduce((m, h) => Math.max(m, h.currentStreak), 0);

  const ARC_R    = 13;
  const ARC_CIRC = 2 * Math.PI * ARC_R;
  // Full-width island with 8px gutters on each side
  const PILL_W   = mounted ? window.innerWidth - 16 : 360;
  const PILL_H   = Math.min(520, Math.max(340, 280 + habits.length * 44));

  const islandX = 8;
  const islandY = 8;

  /* Text/content tokens that adapt to dark/light mode.
     The island's glass background intentionally stays liquid-black
     in all modes (same as iOS Dynamic Island behaviour). */
  const T = useMemo(() => ({
    divider:      "rgba(255,255,255,0.05)",
    textPrimary:  "rgba(255,255,255,0.9)",
    textSub:      "rgba(255,255,255,0.28)",
    textMuted:    "rgba(255,255,255,0.42)",
    arcTrack:     "rgba(255,255,255,0.07)",
    sectionDone:  "rgba(34,197,94,0.55)",
    sectionPend:  "rgba(255,255,255,0.28)",
    rowBorder:    "rgba(255,255,255,0.04)",
    checkBg:      "rgba(34,197,94,0.14)",
    checkBorder:  "rgba(34,197,94,0.55)",
    closeBg:      "rgba(255,255,255,0.07)",
    closeColor:   "rgba(255,255,255,0.4)",
    footerBg:     "rgba(255,255,255,0.04)",
    footerBorder: "rgba(255,255,255,0.07)",
    footerText:   "rgba(255,255,255,0.9)",
    footerMuted:  "rgba(255,255,255,0.38)",
    pendBorder:   "rgba(255,255,255,0.16)",
    compText:     "rgba(255,255,255,0.8)",
    pendText:     "rgba(255,255,255,0.55)",
    rowHoverBg:   "rgba(255,255,255,0.04)",
  }), []);

  useEffect(() => {
    fetch("/api/habits/week-summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DaySummary[] | null) => { if (data) setSummaries(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!islandExpanded) return;
    const t = setTimeout(() => setIslandExpanded(false), 8000);
    return () => clearTimeout(t);
  }, [islandExpanded]);

  useEffect(() => {
    if (!islandExpanded) { setShowPct(true); return; }
    const id = setInterval(() => setShowPct((v) => !v), 3000);
    return () => clearInterval(id);
  }, [islandExpanded]);

  function getDotColor(date: string): string | null {
    if (date > today) return null;
    let s: DaySummary;
    if (date === today) {
      s = { date: date, total: habits.length, completed: habits.filter((h) => h.isCompletedToday).length };
    } else {
      s = summaries.find((x) => x.date === date) ?? { date: date, total: 0, completed: 0 };
    }
    if (s.total === 0) return null;
    if (s.completed >= s.total) return "#22c55e";
    if (s.completed > 0)        return "var(--color-brand)";
    return "#ef4444";
  }

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !dropdownRef.current?.contains(t)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  function handleTodayTap() {
    if (!islandExpanded) {
      setIslandRect(todayCircleRef.current?.getBoundingClientRect() ?? null);
    }
    setIslandExpanded((v) => !v);
  }

  async function handleToggle(habitId: string, isCompleted: boolean) {
    if (pendingId) return;
    setPendingId(habitId);
    navigator.vibrate?.(50);
    if (isCompleted) {
      await uncheck(habitId, today);
    } else {
      await checkIn(habitId, today);
    }
    setPendingId(null);
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 md:hidden"
        style={{
          background:           dark ? "rgba(14,16,15,0.92)" : "rgba(252,252,252,0.94)",
          backdropFilter:       "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom:         dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)",
          borderRadius:         "0 0 20px 20px",
        }}
      >
        {/* ── Top row ── */}
        <div className="flex items-center justify-between px-5" style={{ height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-heading)", letterSpacing: "-0.5px", lineHeight: 1 }}>
              {month}
            </span>
            <ChevronDown size={14} style={{ color: "var(--color-text-muted)", marginTop: 2 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }} ref={menuRef}>
            <button
              onClick={() => openAdd()}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border:     dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.09)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
              aria-label="Add habit"
            >
              <Plus size={17} style={{ color: "var(--color-text-heading)" }} />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
              aria-label="Open profile menu"
            >
              <Avatar
                src={user.image ?? undefined}
                style={{ background: "var(--color-brand)", color: "var(--color-bg-page)", fontWeight: 700, fontSize: 13 }}
                size={34}
              >
                {!user.image && initials}
              </Avatar>
            </button>
          </div>
        </div>

        {/* ── Fixed 7-day strip · today always center ── */}
        <div style={{ paddingTop: 16, paddingBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-around", paddingLeft: 8, paddingRight: 8 }}>
            {windowDates.map((date) => {
              const isToday  = date === today;
              const isFuture = date > today;
              const dayNum   = parseInt(date.split("-")[2], 10);
              const dow      = dowIndex(date);
              const dotColor = getDotColor(date);

              return (
                <div key={date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: CELL_W, flexShrink: 0 }}>
                  {/* Day letter */}
                  <span style={{
                    fontSize: isToday ? 11 : 10,
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? "var(--color-brand)" : "var(--color-text-muted)",
                    letterSpacing: "0.03em", lineHeight: 1,
                  }}>
                    {DOW_LABEL[dow]}
                  </span>

                  {/* Date circle */}
                  {isToday ? (
                    <motion.div
                      ref={todayCircleRef}
                      onClick={handleTodayTap}
                      whileTap={{ scale: 0.82 }}
                      style={{ position: "relative", width: 44, height: 44, cursor: "pointer" }}
                    >
                      {/* Breathing ripple ring */}
                      <div
                        style={{
                          position: "absolute", inset: -5,
                          borderRadius: "50%",
                          border: "1.5px solid var(--color-brand)",
                          pointerEvents: "none",
                          animation: islandExpanded ? "none" : "breatheRing 3.1s ease-out infinite",
                          opacity: islandExpanded ? 0 : undefined,
                          transition: islandExpanded ? "opacity 0.15s" : undefined,
                        }}
                      />
                      {/* Circle blooms outward as island opens — creates "part of it" illusion */}
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: "var(--color-brand)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: islandExpanded ? 0 : 1,
                          transform: islandExpanded ? "scale(1.35)" : "scale(1)",
                          transition: "opacity 0.14s ease-out, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      >
                        <span style={{ fontSize: 24, fontWeight: 900, color: "var(--color-bg-page)", lineHeight: 1 }}>
                          {dayNum}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: dotColor === "var(--color-brand)" ? "inset 0 0 0 1.5px var(--color-brand)" : undefined,
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: 400,
                        color: isFuture ? "var(--color-text-muted)" : "var(--color-text-heading)",
                        lineHeight: 1,
                      }}>
                        {dayNum}
                      </span>
                    </div>
                  )}

                  {/* Status dot */}
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: dotColor ?? "transparent",
                    boxShadow: dotColor && dotColor !== "var(--color-brand)" ? `0 0 5px ${dotColor}66` : undefined,
                    transition: "background 0.2s",
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Dynamic Island ── */}
      {mounted && createPortal(
        <>
          {/* Invisible backdrop — tap anywhere outside to close */}
          {islandExpanded && islandRect && (
            <div
              onClick={() => setIslandExpanded(false)}
              style={{ position: "fixed", inset: 0, zIndex: 199 }}
            />
          )}
          <AnimatePresence>
          {islandExpanded && islandRect && (
            <motion.div
              key="dynamic-island"
              initial={{
                width:        islandRect.width,
                height:       islandRect.height,
                x:            islandRect.left,
                y:            islandRect.top,
                borderRadius: islandRect.height / 2,
              }}
              animate={{
                width:        PILL_W,
                height:       PILL_H,
                x:            islandX,
                y:            islandY,
                borderRadius: 24,
              }}
              exit={{
                width:        islandRect.width,
                height:       islandRect.height,
                x:            islandRect.left,
                y:            islandRect.top,
                borderRadius: islandRect.height / 2,
                opacity:      0,
              }}
              transition={ISLAND_SPRING}
              style={{
                position:             "fixed",
                top:                   0,
                left:                  0,
                /* Liquid glass — intentionally dark in all modes */
                background:            "rgba(8, 14, 8, 0.86)",
                backdropFilter:        "blur(40px) saturate(180%) brightness(1.06)",
                WebkitBackdropFilter:  "blur(40px) saturate(180%) brightness(1.06)",
                border:                "1px solid rgba(34,197,94,0.16)",
                boxShadow:             "0 20px 60px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(34,197,94,0.09)",
                zIndex:                200,
                overflow:              "hidden",
                display:               "flex",
                flexDirection:         "column",
              }}
            >
              {/* ── Combined header: date left · arc right ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={ISLAND_FADE_TRANSITION}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "18px 20px 18px",
                  borderBottom: `1px solid ${T.divider}`,
                  flexShrink: 0,
                  gap: 16,
                }}
              >
                {/* Left: live dot + Today·Month / day name / count */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <motion.div
                      animate={LIVE_DOT_ANIMATE}
                      transition={LIVE_DOT_TRANSITION}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 7px #22c55e", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.textSub, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Today · {todayMonth}
                    </span>
                  </div>
                  <span style={{ fontSize: 36, fontWeight: 900, color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {todayDayName} {todayDayNum}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 6 }}>
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28, duration: 0.3, ease: "easeOut" }}
                      style={{ fontSize: 47, fontWeight: 900, color: T.textPrimary, lineHeight: 1 }}
                    >
                      {todayDone}
                    </motion.span>
                    <span style={{ fontSize: 22, fontWeight: 500, color: T.textSub, lineHeight: 1 }}>
                      / {todayTotal}
                    </span>
                  </div>
                </div>

                {/* Right: enlarged arc — ticks between 100% and 4/4 every 3s */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg width="116" height="116" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", display: "block" }}>
                    <circle cx="18" cy="18" r={ARC_R} fill="none" stroke={T.arcTrack} strokeWidth="2" />
                    <motion.circle
                      cx="18" cy="18" r={ARC_R}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={ARC_CIRC}
                      initial={{ strokeDashoffset: ARC_CIRC }}
                      animate={{ strokeDashoffset: ARC_CIRC * (1 - todayPct) }}
                      transition={{ delay: 0.35, duration: 0.85, ease: "easeOut" }}
                      style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.75))" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <AnimatePresence mode="wait">
                      {showPct ? (
                        <motion.span
                          key="pct"
                          initial={{ y: 22, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -22, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          style={{ fontSize: 22, fontWeight: 900, color: T.textPrimary, lineHeight: 1 }}
                        >
                          {Math.round(todayPct * 100)}%
                        </motion.span>
                      ) : (
                        <motion.span
                          key="frac"
                          initial={{ y: 22, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -22, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          style={{ fontSize: 19, fontWeight: 900, color: T.textPrimary, lineHeight: 1 }}
                        >
                          {todayDone}/{todayTotal}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* ── Scrollable body: habit list only ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={ISLAND_BODY_TRANSITION}
                style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" as never }}
              >
                {/* Completed habits */}
                {completedHabits.length > 0 && (
                  <div style={{ padding: "10px 20px 4px" }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: T.sectionDone, marginBottom: 6,
                    }}>
                      Done
                    </div>
                    {completedHabits.map((habit, i) => (
                      <motion.button
                        key={habit._id}
                        onClick={() => handleToggle(habit._id, true)}
                        disabled={pendingId === habit._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: pendingId === habit._id ? 0.55 : 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.065, duration: 0.24, ease: "easeOut" }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "7px 6px",
                          margin: "0 -6px",
                          borderRadius: 10,
                          width: "calc(100% + 12px)",
                          borderBottom: i < completedHabits.length - 1
                            ? `1px solid ${T.rowBorder}` : "none",
                          background: "none",
                          border: "none",
                          cursor: pendingId === habit._id ? "not-allowed" : "pointer",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ backgroundColor: T.rowHoverBg }}
                      >
                        <div style={{ flexShrink: 0, opacity: 0.7 }}>
                          <HabitIcon name={habit.icon} size={19} color="#22c55e" />
                        </div>
                        <span style={{
                          fontSize: 17, fontWeight: 500, color: T.compText,
                          flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          textDecoration: "line-through", opacity: 0.7,
                        }}>
                          {habit.name}
                        </span>
                        {/* Check badge */}
                        <div style={{
                          width: 17, height: 17, borderRadius: "50%",
                          background: T.checkBg,
                          border: `1.5px solid ${T.checkBorder}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Check size={9} color="#22c55e" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Pending habits */}
                {pendingHabits.length > 0 && (
                  <div style={{ padding: completedHabits.length > 0 ? "4px 20px" : "10px 20px 4px" }}>
                    {completedHabits.length > 0 && (
                      <div style={{ height: 1, background: T.divider, marginBottom: 10 }} />
                    )}
                    <div style={{
                      fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: T.sectionPend, marginBottom: 6,
                    }}>
                      Remaining
                    </div>
                    {pendingHabits.map((habit, i) => (
                      <motion.button
                        key={habit._id}
                        onClick={() => handleToggle(habit._id, false)}
                        disabled={pendingId === habit._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: pendingId === habit._id ? 0.4 : 0.65, x: 0 }}
                        transition={{ delay: 0.35 + (completedHabits.length + i) * 0.065, duration: 0.24, ease: "easeOut" }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "7px 6px",
                          margin: "0 -6px",
                          borderRadius: 10,
                          width: "calc(100% + 12px)",
                          borderBottom: i < pendingHabits.length - 1
                            ? `1px solid ${T.rowBorder}` : "none",
                          background: "none",
                          border: "none",
                          cursor: pendingId === habit._id ? "not-allowed" : "pointer",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ opacity: 0.9, backgroundColor: T.rowHoverBg }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          <HabitIcon name={habit.icon} size={19} color={T.pendText} />
                        </div>
                        <span style={{
                          fontSize: 17, fontWeight: 400, color: T.pendText,
                          flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {habit.name}
                        </span>
                        <div style={{
                          width: 17, height: 17, borderRadius: "50%",
                          border: `1.5px solid ${T.pendBorder}`,
                          flexShrink: 0,
                        }} />
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Streak footer card */}
                {maxStreak > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42 + habits.length * 0.05, duration: 0.28, ease: "easeOut" }}
                    style={{
                      margin: "10px 20px 18px",
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: T.footerBg,
                      border: `1px solid ${T.footerBorder}`,
                      backdropFilter: "blur(8px)",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <Flame size={23} color="#f97316" style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.5))", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontSize: 19, fontWeight: 800, color: T.footerText }}>{maxStreak}</span>
                        <span style={{ fontSize: 16, fontWeight: 400, color: T.footerMuted }}>day streak</span>
                      </div>
                      <div style={{ fontSize: 13, color: T.footerMuted, marginTop: 1 }}>Keep it going!</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
        </>,
        document.body,
      )}

      {/* ── Profile dropdown ── */}
      {mounted && menuOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position:             "fixed",
            right:                12,
            top:                  60,
            background:           "var(--color-bg-elevated)",
            borderRadius:         16,
            overflow:             "hidden",
            minWidth:             164,
            boxShadow:            "0 8px 28px rgba(0,0,0,0.45)",
            border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.10)",
            zIndex: 200,
          }}
        >
          <button onClick={() => { router.push("/profile"); setMenuOpen(false); }} style={MENU_ITEM}>
            <User size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            Profile
          </button>
          <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" }} />
          <button onClick={() => { router.push("/settings"); setMenuOpen(false); }} style={MENU_ITEM}>
            <Settings2 size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            Settings
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}
