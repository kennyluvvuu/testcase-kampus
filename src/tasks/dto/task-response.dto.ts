import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TaskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['todo', 'in_progress', 'done']),
  userId: z.string(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export class TaskResponseDto extends createZodDto(TaskResponseSchema) {}

export const TaskListResponseSchema = z.object({
  data: z.array(TaskResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;

export class TaskListResponseDto extends createZodDto(TaskListResponseSchema) {}
