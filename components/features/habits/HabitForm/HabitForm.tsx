'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Checkbox, Popconfirm, Modal } from 'antd';
import { Bell, BellOff, X, Trash2, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { IconPicker } from '@/components/ui/IconPicker';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { RichTextPreview } from '@/components/ui/RichTextPreview';
import { FREQUENCY_OPTIONS, DAY_OPTIONS } from '@/constants/habits/frequency.constants';
import { DEFAULT_ICON } from '@/constants/habits/icon.constants';
import { habitSchema, type HabitFormValues } from '@/lib/validation/habit.schema';
import type { CardStyle, Habit, Frequency } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';
import type { JSONContent } from '@tiptap/core';

const CARD_STYLES: { value: CardStyle; gradient: string; label: string }[] = [
  { value: 'wavy',      gradient: 'linear-gradient(135deg, #00c6ff, #0061ff, #0033dd)', label: 'Ocean'    },
  { value: 'geometric', gradient: 'linear-gradient(135deg, #e8b950, #f0516b, #8b2ff8)', label: 'Sunset'   },
  { value: 'blob',      gradient: 'linear-gradient(125deg, #10b981, #047857, #065f46)', label: 'Forest'   },
];

interface HabitFormProps {
  initial?: Habit;
  onSave: (data: CreateHabitInput | UpdateHabitInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isEdit?: boolean;
}

const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--color-bg-elevated)',
  borderColor: 'transparent',
  color: 'var(--color-text-heading)',
  borderRadius: 14,
  fontSize: 16,
  height: 52,
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 10,
  display: 'block',
};

export function HabitForm({ initial, onSave, onCancel, onDelete, isEdit = false }: HabitFormProps) {
  const [icon, setIcon] = useState(initial?.icon ?? DEFAULT_ICON);
  const [cardStyle, setCardStyle] = useState<CardStyle>(
    initial?.cardStyle ?? (CARD_STYLES[Math.floor(Math.random() * 3)].value),
  );
  const [notifications, setNotifications] = useState(initial?.notifications ?? true);
  const [freqType, setFreqType] = useState<Frequency['type']>(initial?.frequency.type ?? 'daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descriptionJson, setDescriptionJson] = useState<JSONContent | undefined>(
    initial?.description && typeof initial.description === 'object'
      ? (initial.description as JSONContent)
      : undefined,
  );
  const [editorOpen, setEditorOpen] = useState(false);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* ── Header ────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28,
      }}>
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

        <h1 style={{
          margin: 0,
          fontSize: 22, fontWeight: 900,
          color: 'var(--color-text-heading)',
          letterSpacing: '-0.5px',
        }}>
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
            : <BellOff size={18} color="var(--color-text-muted)" />
          }
        </motion.button>
      </div>

      {/* ── Form ──────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Icon */}
        <div style={{ marginBottom: 24 }}>
          <span style={SECTION_LABEL}>Icon</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        {/* Name */}
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
                placeholder="Name"
                maxLength={50}
                style={INPUT_STYLE}
              />
            )}
          />
        </Form.Item>

        {/* Description — click to open TipTap modal */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setEditorOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setEditorOpen(true)}
          style={{
            background: 'var(--color-bg-elevated)',
            borderRadius: 14,
            minHeight: 52,
            padding: '14px 16px',
            cursor: 'pointer',
            marginBottom: 12,
            position: 'relative',
            display: 'flex',
            alignItems: descriptionJson ? 'flex-start' : 'center',
          }}
        >
          {descriptionJson ? (
            <div style={{ flex: 1, paddingRight: 24, maxHeight: 80, overflow: 'hidden' }}>
              <RichTextPreview content={descriptionJson} />
            </div>
          ) : (
            <span style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>
              Description (optional)
            </span>
          )}
          <Pencil
            size={14}
            color="var(--color-text-muted)"
            style={{ position: 'absolute', top: 10, right: 12, flexShrink: 0 }}
          />
        </div>

        {/* TipTap modal */}
        <Modal
          open={editorOpen}
          onCancel={() => setEditorOpen(false)}
          title="Edit Description"
          width={680}
          footer={null}
          destroyOnHidden
        >
          {editorOpen && (
            <RichTextEditor
              value={descriptionJson}
              onChange={setDescriptionJson}
              placeholder="Add a rich description…"
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <motion.button
              type="button"
              onClick={() => setEditorOpen(false)}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '10px 24px',
                borderRadius: 99,
                background: 'var(--color-text-heading)',
                color: 'var(--color-bg-page)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Done
            </motion.button>
          </div>
        </Modal>

        {/* Tags */}
        <Form.Item
          validateStatus={errors.tags ? 'error' : ''}
          help={errors.tags?.message}
          style={{ marginBottom: 24 }}
        >
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="#fitness #health (optional)"
                style={INPUT_STYLE}
              />
            )}
          />
        </Form.Item>

        {/* Card style */}
        <div style={{ marginBottom: 24 }}>
          <span style={SECTION_LABEL}>Card Style</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {CARD_STYLES.map(({ value, gradient, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCardStyle(value)}
                style={{
                  flex: 1, height: 52, borderRadius: 14, cursor: 'pointer',
                  background: gradient,
                  border: cardStyle === value ? '3px solid #fff' : '3px solid transparent',
                  outline: cardStyle === value ? '2px solid var(--color-brand)' : 'none',
                  transition: 'border 0.15s, outline 0.15s',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  paddingBottom: 7,
                  fontSize: 10, fontWeight: 700,
                  color: 'rgba(255,255,255,0.85)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
                aria-label={label}
                aria-pressed={cardStyle === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: freqType === 'specific' ? 12 : 24 }}>
          <span style={SECTION_LABEL}>Frequency</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FREQUENCY_OPTIONS.map((opt) => {
              const isActive = freqType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFreqType(opt.value)}
                  style={{
                    padding: '10px 18px', borderRadius: 99, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--color-text-heading)' : 'var(--color-bg-elevated)',
                    color: isActive ? 'var(--color-bg-page)' : 'var(--color-text-body)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific days picker */}
        {freqType === 'specific' && (
          <div style={{ marginBottom: 24 }}>
            <span style={SECTION_LABEL}>Days</span>
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
        )}

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 16 }} />

        {/* Error */}
        {error && (
          <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        {/* CTA */}
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

        {/* Delete (edit only) */}
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
