import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { NotificationToggle } from '@/components/ui/NotificationToggle';

export default function ProfilePage() {
  return (
    <>
      <h2
        style={{
          margin: '0 0 24px',
          color: 'var(--color-text-heading)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
        }}
      >
        Profile
      </h2>
      <ProfileForm />
      <div style={{ marginTop: 32, maxWidth: 480 }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 12px',
          }}
        >
          Notifications
        </p>
        <NotificationToggle />
      </div>
    </>
  );
}
