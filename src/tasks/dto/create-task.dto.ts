import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTaskRequestSchema = z.object({
  title: z.string().min(1).max(200).describe('Task title (1–200 characters)'),
  description: z
    .string()
    .min(1)
    .max(2000)
    .describe('Task description (1–2000 characters)'),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

export class CreateTaskRequestDto extends createZodDto(
  CreateTaskRequestSchema,
) {}
