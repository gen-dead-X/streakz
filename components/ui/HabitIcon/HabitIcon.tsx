'use client';
import { icons, Flame } from 'lucide-react';

interface HabitIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function HabitIcon({ name, size = 24, color }: HabitIconProps) {
  const LucideIcon = icons[name as keyof typeof icons] ?? Flame;
  return <LucideIcon size={size} color={color} />;
}
