'use client';
import { useState, useEffect } from 'react';
import { Avatar, Button, Form, Input, Typography, Alert, Divider } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSession, signOut, authClient } from '@/lib/auth/auth-client';

const { Title, Text } = Typography;

export function ProfileForm() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form] = Form.useForm();

  const user = session?.user;
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (user?.name) {
      form.setFieldsValue({ name: user.name });
    }
  }, [user?.name, form]);

  async function onSave(values: { name: string }) {
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

      <Form form={form} layout="vertical" onFinish={onSave} requiredMark={false}>
        <Form.Item
          name="name"
          label={<Text style={{ color: 'var(--color-text-body)' }}>Display Name</Text>}
          rules={[
            { required: true, message: 'Enter a display name' },
            { whitespace: true, message: 'Name cannot be blank' },
          ]}
        >
          <Input
            size="large"
            placeholder="Your name"
            style={{
              background: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border-subtle)',
            }}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={saving}
            style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>

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
