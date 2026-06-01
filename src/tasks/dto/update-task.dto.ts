import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateTaskRequestSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe('New task title (1–200 characters)'),
  description: z
    .string()
    .min(1)
    .max(2000)
    .optional()
    .describe('New task description (1–2000 characters)'),
  status: z
    .enum(['todo', 'in_progress', 'done'])
    .optional()
    .describe('New task status'),
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;

export class UpdateTaskRequestDto extends createZodDto(
  UpdateTaskRequestSchema,
) {}
