import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Enter a display name').trim(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
