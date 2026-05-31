import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTaskRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

export class CreateTaskRequestDto extends createZodDto(
  CreateTaskRequestSchema,
) {}
