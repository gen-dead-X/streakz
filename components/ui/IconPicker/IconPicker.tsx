'use client';
import { icons } from 'lucide-react';
import { HABIT_ICONS } from '@/constants/habits/icon.constants';
import type { HabitIconName } from '@/constants/habits/icon.constants';

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {HABIT_ICONS.map((name) => {
        const LucideIcon = icons[name as keyof typeof icons];
        if (!LucideIcon) return null;
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: selected
                ? '2px solid var(--color-brand)'
                : '2px solid transparent',
              background: selected
                ? 'var(--color-brand-subtle, rgba(16,185,129,0.15))'
                : 'var(--color-bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            aria-label={name}
            aria-pressed={selected}
          >
            <LucideIcon
              size={20}
              style={{ color: selected ? 'var(--color-brand)' : 'var(--color-text-muted)' }}
            />
          </button>
        );
      })}
    </div>
  );
}
