"use client";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "antd";
import { useRouter } from "next/navigation";
import { User, Settings2, ChevronDown, Plus } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { useHabitsStore } from "@/store/habits/habits.store";
import { useDarkMode } from "@/hooks/theme/useDarkMode";
import type { DaySummary } from "@/types/api/habits.types";

interface PageHeaderProps {
  user: { name: string; image: string | null };
}

const DOW = ["M", "T", "W", "T", "F", "S", "S"];

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

function buildWeekDates(): string[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), "yyyy-MM-dd"),
  );
}

export function PageHeader({ user }: PageHeaderProps) {
  const router  = useRouter();
  const dark    = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Date strip state */
  const today     = format(new Date(), "yyyy-MM-dd");
  const weekDates = buildWeekDates();
  const habits    = useHabitsStore((s) => s.habits);
  const [summaries, setSummaries] = useState<DaySummary[]>([]);

  useEffect(() => {
    fetch("/api/habits/week-summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DaySummary[] | null) => { if (data) setSummaries(data); })
      .catch(() => {});
  }, []);

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

  const monthLabel = format(new Date(), "MMM");

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 md:hidden"
      style={{
        background:          dark ? "rgba(18,18,18,0.88)" : "rgba(255,255,255,0.92)",
        backdropFilter:      "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom:        dark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.08)",
        borderRadius:        "0 0 20px 20px",
      }}
    >
      {/* Top row */}
      <div
        className="flex items-center justify-between px-5"
        style={{ height: 60 }}
      >
        {/* Month label */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              fontSize:      26,
              fontWeight:    700,
              color:         "var(--color-text-heading)",
              letterSpacing: "-0.4px",
              lineHeight:    1,
            }}
          >
            {monthLabel}
          </span>
          <ChevronDown
            size={15}
            style={{ color: "var(--color-text-muted)", marginTop: 3 }}
          />
        </div>

        {/* Right: add + avatar */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          ref={menuRef}
        >
          <button
            onClick={() => router.push("/habits/new")}
            style={{
              width:          36,
              height:         36,
              borderRadius:   "50%",
              background:     dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              border:         dark
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(0,0,0,0.10)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
            }}
            aria-label="Add habit"
          >
            <Plus size={18} style={{ color: "var(--color-text-heading)" }} />
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
              size={36}
            >
              {!user.image && initials}
            </Avatar>
          </button>

          {menuOpen && (
            <div
              style={{
                position:  "absolute",
                right:     12,
                top:       56,
                background: "var(--color-bg-elevated)",
                borderRadius: 16,
                overflow:  "hidden",
                minWidth:  164,
                boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                border:    dark
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
              <div
                style={{
                  height:     1,
                  background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
                }}
              />
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

      {/* Calendar date strip */}
      <div
        className="flex justify-between px-5"
        style={{ paddingBottom: 14, paddingTop: 2 }}
      >
        {weekDates.map((date, i) => {
          const isToday  = date === today;
          const isFuture = date > today;
          const dotColor = getDotColor(date);
          const dayNum   = parseInt(date.split("-")[2], 10);

          return (
            <div
              key={date}
              style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
                gap:           3,
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
                {DOW[i]}
              </span>

              {/* Date circle */}
              <div
                style={{
                  width:          32,
                  height:         32,
                  borderRadius:   "50%",
                  background:     isToday ? "var(--color-brand)" : "transparent",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize:   14,
                    fontWeight: isToday ? 700 : 400,
                    color:      isToday
                      ? "var(--color-brand-foreground)"
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
                  boxShadow:    dotColor ? `0 0 4px ${dotColor}` : "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </header>
  );
}
