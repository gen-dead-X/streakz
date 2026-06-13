'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Divider, Typography, Alert } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FireOutlined } from '@ant-design/icons';
import { signUp } from '@/lib/auth/auth-client';
import { registerSchema, type RegisterValues } from '@/lib/validation/auth.schema';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterValues) {
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
    } else {
      router.push('/today');
    }
    setLoading(false);
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

        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Name</Text>}
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
                  autoComplete="name"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Email</Text>}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Password</Text>}
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: 'var(--color-text-body)' }}>Confirm Password</Text>}
            validateStatus={errors.confirm ? 'error' : ''}
            help={errors.confirm?.message}
          >
            <Controller
              name="confirm"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              block
              loading={loading}
              style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
            >
              Create Account
            </Button>
          </Form.Item>
        </form>

        <Divider style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
          or
        </Divider>

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
