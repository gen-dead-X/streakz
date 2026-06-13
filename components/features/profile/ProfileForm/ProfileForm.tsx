'use client';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, Button, Form, Input, Typography, Alert, Divider } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSession, signOut, authClient } from '@/lib/auth/auth-client';
import { profileSchema, type ProfileValues } from '@/lib/validation/profile.schema';

const { Title, Text } = Typography;

export function ProfileForm() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const user = session?.user;
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (user?.name) reset({ name: user.name });
  }, [user?.name, reset]);

  async function onSubmit(values: ProfileValues) {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    const { error } = await authClient.updateUser({ name: values.name.trim() });
    setSaving(false);
    if (error) {
      setSaveError(error.message ?? 'Failed to save changes');
    } else {
      setSaveSuccess(true);
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    try {
      const reg = await navigator.serviceWorker?.getRegistration('/sw.js');
      const sub = await reg?.pushManager?.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
    } catch {
      // Push cleanup failure must never block logout
    }
    await signOut({ fetchOptions: { onSuccess: () => router.push('/login') } });
  }

  if (isPending) return null;

  return (
    <div style={{ maxWidth: 480 }}>
      <div className="flex items-center gap-4 mb-8">
        <Avatar
          src={user?.image ?? undefined}
          size={64}
          icon={!user?.image ? <UserOutlined /> : undefined}
          style={{
            background: 'var(--color-brand)',
            color: 'var(--color-bg-page)',
            fontWeight: 700,
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {!user?.image && initials}
        </Avatar>
        <div>
          <Title level={4} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            {user?.name}
          </Title>
          <Text style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{user?.email}</Text>
        </div>
      </div>

      {saveError && (
        <Alert
          title={saveError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setSaveError(null)}
        />
      )}
      {saveSuccess && (
        <Alert
          title="Name updated successfully"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setSaveSuccess(false)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Form.Item
          label={<Text style={{ color: 'var(--color-text-body)' }}>Display Name</Text>}
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="Your name"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              />
            )}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={saving}
            style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
          >
            Save Changes
          </Button>
        </Form.Item>
      </form>

      <Divider style={{ borderColor: 'var(--color-border-subtle)', marginTop: 32 }} />

      <Button
        size="large"
        danger
        icon={<LogoutOutlined />}
        loading={loggingOut}
        onClick={onLogout}
        style={{
          background: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-error)',
        }}
      >
        Log Out
      </Button>
    </div>
  );
}
