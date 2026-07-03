import { Avatar } from './Avatar';
import type { AvatarStackProps } from './Avatar.types';

export function AvatarStack({ users, max = 4, size = 32 }: AvatarStackProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((user, index) => (
        <div
          key={`${user.name}-${index}`}
          className={`relative rounded-full ring-2 ring-surface ${index === 0 ? '' : '-ml-2'}`}
          style={{ zIndex: visible.length - index }}
        >
          <Avatar name={user.name} src={user.image} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="relative -ml-2 flex items-center justify-center rounded-full border border-border-subtle bg-elevated text-xs font-medium text-muted ring-2 ring-surface"
          style={{ width: size, height: size, zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
