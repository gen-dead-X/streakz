import { Typography } from 'antd';
import { ProfileForm } from '@/components/features/profile/ProfileForm';

const { Title } = Typography;

export default function ProfilePage() {
  return (
    <>
      <Title level={2} style={{ marginBottom: 24, color: 'var(--color-text-heading)' }}>
        Profile
      </Title>
      <ProfileForm />
    </>
  );
}
