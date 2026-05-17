import { z } from 'zod';

export const updateProfileSchema = z.object({
  bio: z
    .string()
    .max(500, 'Bio không được quá 500 ký tự'),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
