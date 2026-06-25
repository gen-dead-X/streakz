"use client";
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { Avatar } from "antd";
import { useRouter } from "next/navigation";
import { User, Settings2, ChevronDown, Plus } from "lucide-react";
import { useHabitSheetStore } from "@/store/habitSheet/habitSheet.store";
import { format, startOfWeek, addDays, getDay } from "date-fns";
import { useHabitsStore } from "@/store/habits/habits.store";
import { useDarkMode } from "@/hooks/theme/useDarkMode";
import type { DaySummary } from "@/types/api/habits.types";

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

// Mon=0 … Sun=6
const DOW_LABEL = ["M", "T", "W", "T", "F", "S", "S"];
const CELL_W    = 44; // px — each day cell width
const WEEKS_BEFORE = 3;
const WEEKS_AFTER  = 2;
const TOTAL_WEEKS  = WEEKS_BEFORE + 1 + WEEKS_AFTER;
const TOTAL_DAYS   = TOTAL_WEEKS * 7; // 42

const MENU_ITEM: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "13px 16px",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--color-text-heading)",
  fontSize: 15,
  fontWeight: 500,
  textAlign: "left",
};

function buildAllDates(todayStr: string): string[] {
  const weekStart = startOfWeek(new Date(todayStr + "T00:00:00"), { weekStartsOn: 1 });
  const origin    = addDays(weekStart, -WEEKS_BEFORE * 7);
  return Array.from({ length: TOTAL_DAYS }, (_, i) =>
    format(addDays(origin, i), "yyyy-MM-dd"),
  );
}

/** Convert date string to Mon-based DOW index 0–6 */
function dowIndex(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  return (getDay(d) + 6) % 7;
}

export function PageHeader({ user }: PageHeaderProps) {
  const router   = useRouter();
  const dark     = useDarkMode();
  const openAdd  = useHabitSheetStore((s) => s.openAdd);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef  = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today  = format(new Date(), "yyyy-MM-dd");
  const month  = format(new Date(), "MMM");

  const allDates = useMemo(() => buildAllDates(today), [today]);

  const habits    = useHabitsStore((s) => s.habits);
  const [summaries, setSummaries] = useState<DaySummary[]>([]);

  useEffect(() => {
    fetch("/api/habits/week-summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DaySummary[] | null) => { if (data) setSummaries(data); })
      .catch(() => {});
  }, []);

  // Scroll to center today on mount
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const todayIdx = allDates.indexOf(today);
    if (todayIdx === -1) return;
    const offset = todayIdx * CELL_W - el.offsetWidth / 2 + CELL_W / 2;
    el.scrollLeft = Math.max(0, offset);
  }, [allDates, today]);

  function getDotColor(date: string): string | null {
    if (date > today) return null;
    let s: DaySummary;
    if (date === today) {
      const total     = habits.length;
      const completed = habits.filter((h) => h.isCompletedToday).length;
      s = { date, total, completed };
    } else {
      s = summaries.find((x) => x.date === date) ?? { date, total: 0, completed: 0 };
    }
    if (s.total === 0) return null;
    if (s.completed >= s.total) return "#22c55e";
    if (s.completed > 0) return "var(--color-brand)";
    return "#ef4444";
  }

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Gradient color to match header backdrop
  const fadeColor = dark ? "rgb(14,16,15)" : "rgb(252,252,252)";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 md:hidden"
      style={{
        background:           dark ? "rgba(14,16,15,0.92)" : "rgba(252,252,252,0.94)",
        backdropFilter:       "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom:         dark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.07)",
        borderRadius:         "0 0 20px 20px",
      }}
    >
      {/* ── Top row: month · add + avatar ── */}
      <div
        className="flex items-center justify-between px-5"
        style={{ height: 56 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              fontSize:      24,
              fontWeight:    800,
              color:         "var(--color-text-heading)",
              letterSpacing: "-0.5px",
              lineHeight:    1,
            }}
          >
            {month}
          </span>
          <ChevronDown
            size={14}
            style={{ color: "var(--color-text-muted)", marginTop: 2 }}
          />
        </div>

        {/* Right: add + avatar */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          ref={menuRef}
        >
          <button
            onClick={() => openAdd()}
            style={{
              width:          34,
              height:         34,
              borderRadius:   "50%",
              background:     dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              border:         dark
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(0,0,0,0.09)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
            }}
            aria-label="Add habit"
          >
            <Plus size={17} style={{ color: "var(--color-text-heading)" }} />
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              background: "none",
              border:     "none",
              cursor:     "pointer",
              padding:    0,
              lineHeight: 0,
            }}
            aria-label="Open profile menu"
          >
            <Avatar
              src={user.image ?? undefined}
              style={{
                background: "var(--color-brand)",
                color:      "var(--color-bg-page)",
                fontWeight: 700,
                fontSize:   13,
              }}
              size={34}
            >
              {!user.image && initials}
            </Avatar>
          </button>

          {menuOpen && (
            <div
              style={{
                position:     "absolute",
                right:        12,
                top:          52,
                background:   "var(--color-bg-elevated)",
                borderRadius: 16,
                overflow:     "hidden",
                minWidth:     164,
                boxShadow:    "0 8px 28px rgba(0,0,0,0.45)",
                border:       dark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(0,0,0,0.10)",
                zIndex: 100,
              }}
            >
              <button
                onClick={() => { router.push("/profile"); setMenuOpen(false); }}
                style={MENU_ITEM}
              >
                <User size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                Profile
              </button>
              <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" }} />
              <button
                onClick={() => { router.push("/settings"); setMenuOpen(false); }}
                style={MENU_ITEM}
              >
                <Settings2 size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Calendar date strip ── */}
      <div
        style={{
          position:     "relative",
          paddingBottom: 12,
          paddingTop:   2,
        }}
      >
        {/* Left fade */}
        <div
          aria-hidden
          style={{
            position:       "absolute",
            left:            0,
            top:             0,
            bottom:          0,
            width:           52,
            background:      `linear-gradient(to right, ${fadeColor} 30%, transparent 100%)`,
            zIndex:          2,
            pointerEvents:   "none",
          }}
        />

        {/* Right fade */}
        <div
          aria-hidden
          style={{
            position:       "absolute",
            right:           0,
            top:             0,
            bottom:          0,
            width:           52,
            background:      `linear-gradient(to left, ${fadeColor} 30%, transparent 100%)`,
            zIndex:          2,
            pointerEvents:   "none",
          }}
        />

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          style={{
            display:            "flex",
            overflowX:          "auto",
            scrollbarWidth:     "none",
            WebkitOverflowScrolling: "touch" as never,
            paddingLeft:         12,
            paddingRight:        12,
          }}
        >
          {allDates.map((date) => {
            const isToday   = date === today;
            const isFuture  = date > today;
            const dayNum    = parseInt(date.split("-")[2], 10);
            const dow       = dowIndex(date);
            const dotColor  = getDotColor(date);

            return (
              <div
                key={date}
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  gap:            3,
                  width:          CELL_W,
                  flexShrink:     0,
                }}
              >
                {/* Day letter */}
                <span
                  style={{
                    fontSize:      10,
                    fontWeight:    500,
                    color:         isToday
                      ? "var(--color-brand)"
                      : "var(--color-text-muted)",
                    letterSpacing: "0.03em",
                    lineHeight:    1,
                  }}
                >
                  {DOW_LABEL[dow]}
                </span>

                {/* Date circle */}
                <div
                  style={{
                    width:          30,
                    height:         30,
                    borderRadius:   "50%",
                    background:     isToday
                      ? "var(--color-brand)"
                      : "transparent",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    // Subtle ring for days with partial completion
                    boxShadow:      !isToday && dotColor === "var(--color-brand)"
                      ? "inset 0 0 0 1.5px var(--color-brand)"
                      : undefined,
                  }}
                >
                  <span
                    style={{
                      fontSize:   13,
                      fontWeight: isToday ? 800 : 400,
                      color:      isToday
                        ? "var(--color-bg-page)"
                        : isFuture
                        ? "var(--color-text-muted)"
                        : "var(--color-text-heading)",
                      lineHeight: 1,
                    }}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Habit status dot */}
                <div
                  style={{
                    width:        5,
                    height:       5,
                    borderRadius: "50%",
                    background:   dotColor ?? "transparent",
                    boxShadow:    dotColor && dotColor !== "var(--color-brand)"
                      ? `0 0 5px ${dotColor}66`
                      : undefined,
                    transition:   "background 0.2s",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
