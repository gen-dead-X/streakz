import { z } from 'zod';

export const habitSchema = z.object({
  name: z.string().trim().min(1, 'Give your streak a name').max(50, 'Max 50 characters'),
  tags: z.string().optional(),
  days: z.array(z.number()).optional(),
});

export type HabitFormValues = z.infer<typeof habitSchema>;
