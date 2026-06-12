import { ProfileForm } from '@/components/features/profile/ProfileForm';

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
    </>
  );
}
