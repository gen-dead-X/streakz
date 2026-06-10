'use client';
import { useState } from 'react';
import { Form, Input, Radio, Button, Checkbox, Typography, Alert } from 'antd';
import { EmojiPicker } from '@/components/ui/EmojiPicker';
import { FREQUENCY_OPTIONS, DAY_OPTIONS } from '@/constants/habits/frequency.constants';
import { DEFAULT_EMOJI } from '@/constants/habits/emoji.constants';
import type { Habit } from '@/types/models/habit.types';
import type { CreateHabitInput, UpdateHabitInput } from '@/types/api/habits.types';

const { Text } = Typography;

interface HabitFormProps {
  initial?: Habit;
  onSave: (data: CreateHabitInput | UpdateHabitInput) => Promise<void>;
  onCancel: () => void;
}

export function HabitForm({ initial, onSave, onCancel }: HabitFormProps) {
  const [emoji, setEmoji] = useState(initial?.icon ?? DEFAULT_EMOJI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const watchFreqType = Form.useWatch('frequencyType', form);

  async function onFinish(values: {
    name: string;
    frequencyType: 'daily' | 'weekly' | 'specific';
    days?: number[];
  }) {
    setLoading(true);
    setError(null);
    try {
      await onSave({
        name: values.name.trim(),
        icon: emoji,
        frequency: {
          type: values.frequencyType,
          days: values.frequencyType === 'specific' ? (values.days ?? []) : [],
        },
      });
    } catch {
      setError('Failed to save habit. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: initial?.name ?? '',
        frequencyType: initial?.frequency.type ?? 'daily',
        days: initial?.frequency.days ?? [],
      }}
      onFinish={onFinish}
      requiredMark={false}
    >
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      {/* Emoji */}
      <Form.Item>
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Form.Item>

      {/* Name */}
      <Form.Item
        name="name"
        label={<Text style={{ color: 'var(--color-text-body)' }}>Habit name</Text>}
        rules={[
          { required: true, message: 'Give your habit a name' },
          { max: 50, message: 'Max 50 characters' },
        ]}
      >
        <Input
          size="large"
          placeholder="e.g. Read 20 pages"
          maxLength={50}
          showCount
          style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)' }}
        />
      </Form.Item>

      {/* Frequency type */}
      <Form.Item
        name="frequencyType"
        label={<Text style={{ color: 'var(--color-text-body)' }}>Frequency</Text>}
      >
        <Radio.Group>
          {FREQUENCY_OPTIONS.map((opt) => (
            <Radio
              key={opt.value}
              value={opt.value}
              style={{ color: 'var(--color-text-body)', marginBottom: 4 }}
            >
              {opt.label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>

      {/* Specific days selector */}
      {watchFreqType === 'specific' && (
        <Form.Item
          name="days"
          label={<Text style={{ color: 'var(--color-text-body)' }}>Days</Text>}
          rules={[{ required: true, type: 'array', min: 1, message: 'Select at least one day' }]}
        >
          <Checkbox.Group>
            <div className="flex gap-2 flex-wrap">
              {DAY_OPTIONS.map((day) => (
                <Checkbox key={day.value} value={day.value}>
                  <Text style={{ color: 'var(--color-text-body)' }}>{day.label}</Text>
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          size="large"
          onClick={onCancel}
          style={{
            flex: 1,
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-body)',
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          style={{
            flex: 1,
            background: 'var(--color-brand)',
            borderColor: 'var(--color-brand)',
          }}
        >
          {initial ? 'Save changes' : 'Add habit'}
        </Button>
      </div>
    </Form>
  );
}
