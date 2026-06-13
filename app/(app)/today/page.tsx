import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { format } from "date-fns";
import { getHabitsForUser } from "@/services/habits/habits.service";
import { HabitList } from "@/components/features/habits/HabitList";
import { WeekStrip } from "@/components/features/habits/WeekStrip";

export default async function TodayPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const habits = await getHabitsForUser(session.user.id, todayStr);

  const total = habits.length;
  const completed = habits.filter((h) => h.isCompletedToday).length;
  const allDone = total && completed === total;

  return (
    <div className="flex flex-col gap-4">
      {/* Week strip calendar */}
      {total && (
        <div
          style={{
            background: "var(--color-bg-surface)",
            borderRadius: 20,
            padding: "12px 16px 8px",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {allDone && (
            <p
              style={{
                fontSize: 11,
                color: "var(--color-success)",
                fontWeight: 600,
                margin: "0 0 4px 4px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              All done today 🎉
            </p>
          )}
          <WeekStrip />
        </div>
      )}

      {/*
        Mobile: give the deck enough height.
        Desktop (md+): HabitList renders deck + list side by side, height is auto.
      */}
      <div className="h-[calc(100dvh-280px)] min-h-95 md:h-auto md:min-h-0">
        <HabitList />
      </div>
    </div>
  );
}
