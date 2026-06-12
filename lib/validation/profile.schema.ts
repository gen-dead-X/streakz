import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter a display name'),
});

export type ProfileValues = z.infer<typeof profileSchema>;
