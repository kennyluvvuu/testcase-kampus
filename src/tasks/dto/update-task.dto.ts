import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateTaskRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;

export class UpdateTaskRequestDto extends createZodDto(
  UpdateTaskRequestSchema,
) {}
