'use client';
import { useState } from 'react';
import { Button, Form, Input, Divider, Typography, Alert } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FireOutlined } from '@ant-design/icons';
import { signUp, signIn } from '@/lib/auth/auth-client';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish(values: { name: string; email: string; password: string; confirm: string }) {
    if (values.password !== values.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: '/today',
    });
    if (err) {
      setError(err.message ?? 'Could not create account');
      setLoading(false);
    } else {
      router.push('/today');
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: 'google', callbackURL: '/today' });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div className="w-full" style={{ maxWidth: 360 }}>
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-3"
            style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-brand)' }}
          >
            <FireOutlined style={{ fontSize: 28, color: 'var(--color-bg-page)' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: 'var(--color-text-heading)' }}>
            Get Started
          </Title>
          <Text style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Create your account
          </Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="name"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Name</Text>}
            rules={[{ required: true, message: 'Enter your name' }]}
          >
            <Input
              size="large"
              placeholder="Your name"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Email</Text>}
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input
              size="large"
              placeholder="you@example.com"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Password</Text>}
            rules={[{ required: true, min: 8, message: 'At least 8 characters' }]}
          >
            <Input.Password
              size="large"
              placeholder="••••••••"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            label={<Text style={{ color: 'var(--color-text-body)' }}>Confirm Password</Text>}
            rules={[{ required: true, message: 'Confirm your password' }]}
          >
            <Input.Password
              size="large"
              placeholder="••••••••"
              style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>or</Divider>

        <Button
          size="large"
          block
          disabled
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-muted)',
            marginBottom: 24,
            cursor: 'not-allowed',
          }}
        >
          Continue with Google
        </Button>

        <Text style={{ color: 'var(--color-text-muted)', display: 'block', textAlign: 'center' }}>
          Have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-brand)' }}>
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
