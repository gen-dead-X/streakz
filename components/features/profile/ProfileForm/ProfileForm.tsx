'use client';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Typography, Alert } from 'antd';
import { UserOutlined, LogoutOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut, authClient } from '@/lib/auth/auth-client';
import { useHabitsStore } from '@/store/habits/habits.store';
import { profileSchema, type ProfileValues } from '@/lib/validation/profile.schema';

const { Text } = Typography;

const WAVE_LINES: string[] = Array.from({ length: 28 }, (_, i) => {
  const baseX = (i / 27) * 500;
  const phase = i * 0.6;
  const amp = 8 + Math.sin(i * 0.85) * 4;
  return Array.from({ length: 40 }, (_, j) => {
    const y = (j / 39) * 200;
    const x = baseX + Math.sin((j / 39) * Math.PI * 3.2 + phase) * amp;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
});

function HeroWaves() {
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 500 200"
      preserveAspectRatio="xMidYMid slice"
    >
      {WAVE_LINES.map((pts, i) => (
        <polyline key={i} points={pts} stroke="white" strokeWidth="0.8" fill="none" opacity="0.12" />
      ))}
    </svg>
  );
}

export function ProfileForm() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const habits = useHabitsStore((s) => s.habits);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const user = session?.user;
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.isCompletedToday).length;

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
      setEditingName(false);
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
      // Push cleanup must never block logout
    }
    try {
      await signOut({ fetchOptions: { onSuccess: () => router.push('/login') } });
    } finally {
      setLoggingOut(false);
    }
  }

  if (isPending) return null;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          marginBottom: 16,
          position: 'relative',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 65%, #6d28d9 100%)',
          boxShadow: '0 16px 48px rgba(99,60,180,0.35)',
        }}
      >
        <HeroWaves />

        {/* Orb accents */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -30,
          width: 150, height: 150, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '36px 28px 28px', textAlign: 'center' }}>
          {/* Avatar */}
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 16 }}>
            {/* Animated ring */}
            <div style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #a78bfa, #818cf8, #6366f1, #4f46e5, #a78bfa)',
              animation: 'spin-ring 3s linear infinite',
              zIndex: 0,
            }} />
            <div style={{
              position: 'absolute', inset: -2, borderRadius: '50%',
              background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
              zIndex: 1,
            }} />
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 900, color: '#e0d9ff',
              position: 'relative', zIndex: 2,
              overflow: 'hidden',
            }}>
              {user?.image
                ? <img src={user.image} alt={user.name ?? 'avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{initials || <UserOutlined />}</span>
              }
            </div>
          </div>

          {/* Name + email */}
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
            {user?.name ?? 'Your Name'}
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(196,181,253,0.85)', margin: '0 0 22px', fontWeight: 500 }}>
            {user?.email}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {[
              { value: totalHabits, label: 'Habits' },
              { value: completedToday, label: 'Done today' },
              { value: totalHabits > 0 ? `${Math.round((completedToday / totalHabits) * 100)}%` : '—', label: "Today's rate" },
            ].map(({ value, label }) => (
              <div key={label} style={{
                flex: 1, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                borderRadius: 16, padding: '10px 8px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(196,181,253,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Edit name card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 22px',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editingName ? 16 : 0 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>
              Display Name
            </p>
            {!editingName && (
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-heading)', margin: 0 }}>
                {user?.name ?? '—'}
              </p>
            )}
          </div>
          <button
            onClick={() => { setEditingName((v) => !v); setSaveError(null); setSaveSuccess(false); }}
            style={{
              width: 34, height: 34, borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-muted)', transition: 'background 0.15s ease',
            }}
            aria-label={editingName ? 'Cancel edit' : 'Edit name'}
          >
            {editingName ? <Text style={{ fontSize: 13 }}>✕</Text> : <EditOutlined style={{ fontSize: 14 }} />}
          </button>
        </div>

        <AnimatePresence>
          {editingName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden' }}
            >
              {saveError && (
                <Alert
                  title={saveError}
                  type="error"
                  showIcon
                  style={{ marginBottom: 12 }}
                  closable={{ onClose: () => setSaveError(null) }}
                />
              )}
              {saveSuccess && (
                <Alert
                  title="Name updated successfully"
                  type="success"
                  showIcon
                  style={{ marginBottom: 12 }}
                  closable={{ onClose: () => setSaveSuccess(false) }}
                />
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Form.Item
                  validateStatus={errors.name ? 'error' : ''}
                  help={errors.name?.message}
                  style={{ marginBottom: 12 }}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="large"
                        placeholder="Your display name"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          borderColor: 'var(--color-border-subtle)',
                        }}
                      />
                    )}
                  />
                </Form.Item>
                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  loading={saving}
                  icon={<CheckOutlined />}
                  style={{ background: 'var(--color-brand)', borderColor: 'var(--color-brand)', width: '100%' }}
                >
                  Save Changes
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Account / danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)',
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          border: '1px solid rgba(239,68,68,0.15)',
          padding: '20px 22px',
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(239,68,68,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
          Account
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-heading)', margin: 0 }}>Sign out</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>You can sign back in any time</p>
          </div>
          <Button
            danger
            size="middle"
            icon={<LogoutOutlined />}
            loading={loggingOut}
            onClick={onLogout}
            style={{
              background: 'rgba(239,68,68,0.12)',
              borderColor: 'rgba(239,68,68,0.3)',
              color: '#fca5a5',
              fontWeight: 600,
            }}
          >
            Log Out
          </Button>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
