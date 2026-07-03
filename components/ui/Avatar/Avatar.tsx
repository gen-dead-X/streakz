import Image from 'next/image';

import type { AvatarProps } from './Avatar.types';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, src, size = 40 }: AvatarProps) {
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-elevated font-medium text-heading"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      role="img"
      aria-label={name}
    >
      {src ? (
        <Image src={src} alt={name} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}
