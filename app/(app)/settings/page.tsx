import { AppearanceSection } from '@/components/features/settings/AppearanceSection';
import { NotificationsSection } from '@/components/features/settings/NotificationsSection';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8" style={{ maxWidth: 560 }}>
      <div>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: 0,
          }}
        >
          Preferences
        </p>
        <h2
          style={{
            margin: 0,
            color: 'var(--color-text-heading)',
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Settings
        </h2>
      </div>

      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 20,
          padding: '24px 20px',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <AppearanceSection />
      </div>

      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 20,
          padding: '24px 20px',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <NotificationsSection />
      </div>
    </div>
  );
}
