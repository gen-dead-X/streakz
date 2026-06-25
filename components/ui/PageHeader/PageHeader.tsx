"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "antd";
import { useRouter } from "next/navigation";
import { User, Settings2, ChevronDown, Plus } from "lucide-react";
import { useHabitSheetStore } from "@/store/habitSheet/habitSheet.store";
import { format, addDays, getDay } from "date-fns";
import { useHabitsStore } from "@/store/habits/habits.store";
import { useDarkMode } from "@/hooks/theme/useDarkMode";
import { useThemeStore } from "@/store/theme/theme.store";
import type { DaySummary } from "@/types/api/habits.types";

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

const DOW_LABEL = ["M", "T", "W", "T", "F", "S", "S"];
const CELL_W    = 44;

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
  const appStyle     = useThemeStore((s) => s.appStyle);
  const isGlassy     = appStyle === "glassy";
  const openAdd      = useHabitSheetStore((s) => s.openAdd);

  const [menuOpen, setMenuOpen]         = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [islandRect, setIslandRect]         = useState<DOMRect | null>(null);

  const menuRef        = useRef<HTMLDivElement>(null);
  const dropdownRef    = useRef<HTMLDivElement>(null);
  const todayCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const today      = format(new Date(), "yyyy-MM-dd");
  const month      = format(new Date(), "MMM");
  const todayLabel = format(new Date(today + "T00:00:00"), "EEE, MMM d");

  const windowDates = useMemo(() => buildWindowDates(today), [today]);

  const habits   = useHabitsStore((s) => s.habits);
  const [summaries, setSummaries] = useState<DaySummary[]>([]);

  const completedHabits = habits.filter((h) => h.isCompletedToday);
  const pendingHabits   = habits.filter((h) => !h.isCompletedToday);
  const todayDone       = completedHabits.length;
  const todayTotal      = habits.length;
  const todayPct        = todayTotal > 0 ? todayDone / todayTotal : 0;
  const maxStreak       = habits.reduce((m, h) => Math.max(m, h.currentStreak), 0);

  const ARC_R    = 13;
  const ARC_CIRC = 2 * Math.PI * ARC_R;
  const PILL_W   = 280;
  const PILL_H   = 216;

  const islandX = islandRect
    ? Math.max(8, islandRect.left + islandRect.width / 2 - PILL_W / 2)
    : 0;
  const islandY = islandRect ? islandRect.top : 0;

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

  function getDotColor(date: string): string | null {
    if (date > today) return null;
    let s: DaySummary;
    if (date === today) {
      s = { date, total: habits.length, completed: habits.filter((h) => h.isCompletedToday).length };
    } else {
      s = summaries.find((x) => x.date === date) ?? { date, total: 0, completed: 0 };
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

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 md:hidden"
        style={{
          background:           isGlassy ? "var(--color-bg-elevated)" : (dark ? "rgba(14,16,15,0.92)" : "rgba(252,252,252,0.94)"),
          backdropFilter:       "blur(var(--glass-blur, 20px)) saturate(var(--glass-saturation, 180%))",
          WebkitBackdropFilter: "blur(var(--glass-blur, 20px)) saturate(var(--glass-saturation, 180%))",
          borderBottom:         isGlassy ? (dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.55)") : (dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)"),
          borderRadius:         "0 0 20px 20px",
          boxShadow:            isGlassy ? "var(--shadow-md)" : undefined,
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
        <div style={{ paddingTop: 10, paddingBottom: 22 }}>
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
                    fontSize: 10, fontWeight: 500,
                    color: isToday ? "var(--color-brand)" : "var(--color-text-muted)",
                    letterSpacing: "0.03em", lineHeight: 1,
                  }}>
                    {DOW_LABEL[dow]}
                  </span>

                  {/* Date circle */}
                  {isToday ? (
                    <div
                      ref={todayCircleRef}
                      onClick={handleTodayTap}
                      style={{ position: "relative", width: 30, height: 30, cursor: "pointer" }}
                    >
                      {/* Breathing ripple ring — cleared extra space with inset so ring clips inside the padding area */}
                      <motion.div
                        style={{
                          position: "absolute", inset: -5,
                          borderRadius: "50%",
                          border: "1.5px solid var(--color-brand)",
                          pointerEvents: "none",
                        }}
                        animate={!islandExpanded
                          ? { scale: [1, 1.48, 1.48], opacity: [0.6, 0, 0] }
                          : { scale: 1, opacity: 0 }}
                        transition={!islandExpanded
                          ? { duration: 2.4, repeat: Infinity, repeatDelay: 0.7, ease: "easeOut" }
                          : { duration: 0.15 }}
                      />
                      <motion.div
                        animate={{ opacity: islandExpanded ? 0 : 1 }}
                        transition={{ duration: 0.08 }}
                        style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: "var(--color-brand)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-bg-page)", lineHeight: 1 }}>
                          {dayNum}
                        </span>
                      </motion.div>
                    </div>
                  ) : (
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
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

      {/* ── Dynamic Island — liquid glass expanded pill ── */}
      {mounted && createPortal(
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
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              style={{
                position:             "fixed",
                top:                   0,
                left:                  0,
                /* Liquid glass */
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
              {/* ── Island header ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.14, duration: 0.22 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 16px 10px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {/* Live pulse dot */}
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
                    transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 7px #22c55e" }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Today
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontWeight: 400 }}>
                    · {todayLabel}
                  </span>
                </div>
                <button
                  onClick={() => setIslandExpanded(false)}
                  style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(255,255,255,0.07)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0, flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>✕</span>
                </button>
              </motion.div>

              {/* ── Scrollable body ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.22 }}
                style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" as never }}
              >
                {/* Progress summary row */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px 10px" }}>
                  {/* Arc */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", display: "block" }}>
                      {/* Glass track */}
                      <circle cx="18" cy="18" r={ARC_R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                      {/* Progress fill */}
                      <motion.circle
                        cx="18" cy="18" r={ARC_R}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={ARC_CIRC}
                        initial={{ strokeDashoffset: ARC_CIRC }}
                        animate={{ strokeDashoffset: ARC_CIRC * (1 - todayPct) }}
                        transition={{ delay: 0.35, duration: 0.85, ease: "easeOut" }}
                        style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.6))" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.88)", lineHeight: 1 }}>
                        {Math.round(todayPct * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Fraction + label */}
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28, duration: 0.3, ease: "easeOut" }}
                        style={{ fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1 }}
                      >
                        {todayDone}
                      </motion.span>
                      <span style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.28)", lineHeight: 1 }}>
                        / {todayTotal}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.42)", fontWeight: 500 }}>
                      {todayDone === todayTotal && todayTotal > 0
                        ? "All done today 🎉"
                        : `${pendingHabits.length} remaining`}
                    </div>
                  </div>
                </div>

                {/* Thin separator */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginLeft: 16, marginRight: 16 }} />

                {/* Completed habits */}
                {completedHabits.length > 0 && (
                  <div style={{ padding: "10px 16px 4px" }}>
                    <div style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "rgba(34,197,94,0.55)", marginBottom: 6,
                    }}>
                      Done
                    </div>
                    {completedHabits.map((habit, i) => (
                      <motion.div
                        key={habit._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.065, duration: 0.24, ease: "easeOut" }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "7px 0",
                          borderBottom: i < completedHabits.length - 1
                            ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{habit.icon}</span>
                        <span style={{
                          fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)",
                          flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {habit.name}
                        </span>
                        {/* Check badge */}
                        <div style={{
                          width: 17, height: 17, borderRadius: "50%",
                          background: "rgba(34,197,94,0.14)",
                          border: "1.5px solid rgba(34,197,94,0.55)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 9, color: "#22c55e", lineHeight: 1 }}>✓</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pending habits */}
                {pendingHabits.length > 0 && (
                  <div style={{ padding: completedHabits.length > 0 ? "4px 16px" : "10px 16px 4px" }}>
                    {completedHabits.length > 0 && (
                      <div style={{ height: 1, background: "rgba(255,255,255,0.04)", marginBottom: 10 }} />
                    )}
                    <div style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.28)", marginBottom: 6,
                    }}>
                      Remaining
                    </div>
                    {pendingHabits.map((habit, i) => (
                      <motion.div
                        key={habit._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + (completedHabits.length + i) * 0.065, duration: 0.24, ease: "easeOut" }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "7px 0", opacity: 0.6,
                          borderBottom: i < pendingHabits.length - 1
                            ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{habit.icon}</span>
                        <span style={{
                          fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.55)",
                          flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {habit.name}
                        </span>
                        <div style={{
                          width: 17, height: 17, borderRadius: "50%",
                          border: "1.5px solid rgba(255,255,255,0.16)",
                          flexShrink: 0,
                        }} />
                      </motion.div>
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
                      margin: "10px 16px 16px",
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      backdropFilter: "blur(8px)",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>{maxStreak}</span>
                        <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.38)" }}>day streak</span>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 1 }}>Keep it going!</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
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
            backdropFilter:       isGlassy ? "blur(var(--glass-blur, 28px)) saturate(var(--glass-saturation, 185%))" : undefined,
            WebkitBackdropFilter: isGlassy ? "blur(var(--glass-blur, 28px)) saturate(var(--glass-saturation, 185%))" : undefined,
            borderRadius:         16,
            overflow:             "hidden",
            minWidth:             164,
            boxShadow:            isGlassy
              ? "0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)"
              : "0 8px 28px rgba(0,0,0,0.45)",
            border: isGlassy
              ? (dark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.72)")
              : (dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.10)"),
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
