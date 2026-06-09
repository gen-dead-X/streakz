'use client';
import { Typography } from 'antd';
import { HABIT_EMOJIS } from '@/constants/habits/emoji.constants';

const { Text } = Typography;

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div>
      <Text style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
        Choose an icon
      </Text>
      <div className="flex flex-wrap gap-2">
        {HABIT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            style={{
              width: 44,
              height: 44,
              fontSize: 22,
              borderRadius: 12,
              border: `2px solid ${value === emoji ? 'var(--color-brand)' : 'transparent'}`,
              background: value === emoji ? 'rgba(29,185,84,0.12)' : 'var(--color-bg-elevated)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
