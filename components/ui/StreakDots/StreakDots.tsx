interface StreakDotsProps {
  days: boolean[]; // 7 booleans, index 0 = oldest, 6 = today
}

export function StreakDots({ days }: StreakDotsProps) {
  return (
    <div className="flex items-center gap-[4px]">
      {days.map((filled, i) => (
        <div
          key={i}
          style={{
            width: i === days.length - 1 ? 12 : 10,
            height: i === days.length - 1 ? 12 : 10,
            borderRadius: i === days.length - 1 ? 3 : '50%',
            background: filled ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
            border: !filled ? '1.5px solid var(--color-border-subtle)' : 'none',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}
