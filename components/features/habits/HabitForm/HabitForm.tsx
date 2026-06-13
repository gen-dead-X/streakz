'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Checkbox, Popconfirm, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Bell, BellOff, X, Trash2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { IconPicker } from '@/components/ui/IconPicker';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FREQUENCY_OPTIONS, DAY_OPTIONS } from '@/constants/habits/frequency.constants';
import { DEFAULT_ICON } from '@/constants/habits/icon.constants';
import { habitSchema, type HabitFormValues } from '@/lib/validation/habit.schema';
import type { CardStyle, Habit, Frequency } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';
import type { JSONContent } from '@tiptap/core';

const CARD_STYLES: { value: CardStyle; gradient: string; label: string }[] = [
  { value: 'wavy',     gradient: 'linear-gradient(135deg, #00c6ff 0%, #0061ff 55%, #0033dd 100%)',            label: 'Ocean'   },
  { value: 'geometric',gradient: 'linear-gradient(135deg, #e8b950 0%, #f0516b 38%, #8b2ff8 78%, #5a20dd 100%)',label: 'Sunset'  },
  { value: 'blob',     gradient: 'linear-gradient(125deg, #10b981 0%, #047857 50%, #065f46 100%)',             label: 'Forest'  },
  { value: 'aurora',   gradient: 'linear-gradient(135deg, #00b09b 0%, #57d06e 60%, #96c93d 100%)',            label: 'Aurora'  },
  { value: 'ember',    gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',                          label: 'Ember'   },
  { value: 'midnight', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)',            label: 'Midnight'},
  { value: 'rose',     gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 60%, #fd746c 100%)',            label: 'Rose'    },
];

interface HabitFormProps {
  initial?: Habit;
  onSave: (data: CreateHabitInput | UpdateHabitInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isEdit?: boolean;
}

const ROW_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
  minWidth: 88,
  flexShrink: 0,
};

const ROW_DIVIDER: React.CSSProperties = {
  height: 1,
  background: 'rgba(255,255,255,0.06)',
  margin: '0 16px',
};

export function HabitForm({ initial, onSave, onCancel, onDelete, isEdit = false }: HabitFormProps) {
  const [icon, setIcon] = useState(initial?.icon ?? DEFAULT_ICON);
  const [cardStyle, setCardStyle] = useState<CardStyle>(initial?.cardStyle ?? 'wavy');
  const [notifications, setNotifications] = useState(initial?.notifications ?? true);
  const [freqType, setFreqType] = useState<Frequency['type']>(initial?.frequency.type ?? 'daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descriptionJson, setDescriptionJson] = useState<JSONContent | undefined>(
    initial?.description && typeof initial.description === 'object'
      ? (initial.description as JSONContent)
      : undefined,
  );

  const { control, handleSubmit, formState: { errors } } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: initial?.name ?? '',
      tags: initial?.tags?.map((t) => `#${t}`).join(' ') ?? '',
      days: initial?.frequency.days ?? [],
    },
  });

  async function onSubmit(values: HabitFormValues) {
    setLoading(true);
    setError(null);
    if (freqType === 'specific' && (values.days ?? []).length === 0) {
      setError('Select at least one day');
      setLoading(false);
      return;
    }
    try {
      const tags = (values.tags ?? '')
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, '').trim())
        .filter(Boolean);
      await onSave({
        name: values.name.trim(),
        icon,
        description: descriptionJson,
        tags,
        cardStyle,
        notifications,
        frequency: {
          type: freqType,
          days: freqType === 'specific' ? (values.days ?? []) : [],
        },
      });
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedStyle = CARD_STYLES.find((s) => s.value === cardStyle) ?? CARD_STYLES[0];

  const themeMenuItems: MenuProps['items'] = CARD_STYLES.map(({ value, gradient, label }) => ({
    key: value,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 18, borderRadius: 5, background: gradient, flexShrink: 0 }} />
        <span style={{ fontSize: 14 }}>{label}</span>
      </div>
    ),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <motion.button
          type="button"
          onClick={onCancel}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 44, height: 44, borderRadius: 99,
            background: 'var(--color-bg-elevated)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <X size={18} color="var(--color-text-body)" />
        </motion.button>

        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--color-text-heading)', letterSpacing: '-0.5px' }}>
          {isEdit ? 'Edit Streak' : 'New Streak'}
        </h1>

        <motion.button
          type="button"
          onClick={() => setNotifications((v) => !v)}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 44, height: 44, borderRadius: 99,
            border: `2px solid ${notifications ? 'var(--color-brand)' : 'var(--color-bg-elevated)'}`,
            background: notifications ? 'rgba(16,185,129,0.12)' : 'var(--color-bg-elevated)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border 0.2s, background 0.2s',
          }}
          aria-label={notifications ? 'Disable notifications' : 'Enable notifications'}
          aria-pressed={notifications}
        >
          {notifications
            ? <Bell size={18} color="var(--color-brand)" />
            : <BellOff size={18} color="var(--color-text-muted)" />}
        </motion.button>
      </div>

      {/* ── Form ───────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <IconPicker value={icon} onChange={setIcon} />
          <Form.Item
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
            style={{ margin: 0, flex: 1 }}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Habit name"
                  maxLength={50}
                  variant="borderless"
                  style={{
                    background: 'transparent',
                    color: 'var(--color-text-heading)',
                    fontSize: 26, fontWeight: 900,
                    letterSpacing: '-0.5px',
                    height: 'auto', padding: '4px 0',
                  }}
                />
              )}
            />
          </Form.Item>
        </div>

        {/* Metadata surface */}
        <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 18, marginBottom: 16, overflow: 'hidden' }}>
          {/* Tags */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
            <span style={ROW_LABEL}>Tags</span>
            <Form.Item
              validateStatus={errors.tags ? 'error' : ''}
              help={errors.tags?.message}
              style={{ margin: 0, flex: 1 }}
            >
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="#fitness #health"
                    variant="borderless"
                    style={{ background: 'transparent', color: 'var(--color-text-body)', fontSize: 14, height: 'auto', padding: '2px 0' }}
                  />
                )}
              />
            </Form.Item>
          </div>

          <div style={ROW_DIVIDER} />

          {/* Theme */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
            <span style={ROW_LABEL}>Theme</span>
            <Dropdown
              menu={{
                items: themeMenuItems,
                onClick: ({ key }) => setCardStyle(key as CardStyle),
                selectedKeys: [cardStyle],
              }}
              trigger={['click']}
            >
              <button
                type="button"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--color-bg-surface)',
                  border: 'none', borderRadius: 10,
                  padding: '7px 14px', cursor: 'pointer',
                  color: 'var(--color-text-body)',
                }}
              >
                <div style={{ width: 28, height: 18, borderRadius: 5, background: selectedStyle.gradient, flexShrink: 0 }} />
                <span style={{ fontSize: 14 }}>{selectedStyle.label}</span>
                <ChevronDown size={14} color="var(--color-text-muted)" />
              </button>
            </Dropdown>
          </div>

          <div style={ROW_DIVIDER} />

          {/* Frequency */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
            <span style={ROW_LABEL}>Frequency</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FREQUENCY_OPTIONS.map((opt) => {
                const isActive = freqType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFreqType(opt.value)}
                    style={{
                      padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      background: isActive ? 'var(--color-text-heading)' : 'var(--color-bg-surface)',
                      color: isActive ? 'var(--color-bg-page)' : 'var(--color-text-muted)',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days (conditional) */}
          {freqType === 'specific' && (
            <>
              <div style={ROW_DIVIDER} />
              <div style={{ padding: '14px 16px' }}>
                <Form.Item
                  validateStatus={errors.days ? 'error' : ''}
                  help={errors.days?.message}
                  style={{ margin: 0 }}
                >
                  <Controller
                    name="days"
                    control={control}
                    render={({ field }) => (
                      <Checkbox.Group value={field.value} onChange={field.onChange}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {DAY_OPTIONS.map((day) => (
                            <Checkbox key={day.value} value={day.value}>
                              <span style={{ color: 'var(--color-text-body)', fontSize: 14 }}>{day.label}</span>
                            </Checkbox>
                          ))}
                        </div>
                      </Checkbox.Group>
                    )}
                  />
                </Form.Item>
              </div>
            </>
          )}
        </div>

        {/* Inline rich text editor */}
        <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 18, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px 0' }}>
            <span style={{ ...ROW_LABEL, display: 'block' }}>Description</span>
          </div>
          <RichTextEditor
            value={descriptionJson}
            onChange={setDescriptionJson}
            placeholder="Add a description…"
          />
        </div>

        <div style={{ flex: 1, minHeight: 12 }} />

        {error && (
          <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', height: 58, borderRadius: 99,
            background: loading ? 'var(--color-bg-elevated)' : 'var(--color-text-heading)',
            color: 'var(--color-bg-page)',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 17, fontWeight: 800, letterSpacing: '-0.2px',
            transition: 'background 0.2s',
            marginBottom: onDelete ? 12 : 0,
          }}
        >
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Streak'}
        </motion.button>

        {onDelete && (
          <Popconfirm
            title="Delete this streak?"
            description="All check-in history will be lost."
            onConfirm={onDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <button
              type="button"
              style={{
                width: '100%', height: 48, borderRadius: 99,
                background: 'transparent', border: '1.5px solid var(--color-error)',
                color: 'var(--color-error)', cursor: 'pointer',
                fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Trash2 size={16} />
              Delete Streak
            </button>
          </Popconfirm>
        )}
      </form>
    </div>
  );
}
