import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TaskResponseSchema = z.object({
  id: z.string().describe('Task ID'),
  title: z.string().describe('Task title'),
  description: z.string().describe('Task description'),
  status: z
    .enum(['todo', 'in_progress', 'done'])
    .describe('Current task status'),
  userId: z.string().describe('ID of the user who owns the task'),
  deletedAt: z.iso
    .datetime()
    .nullable()
    .describe('Archive timestamp (null for active tasks)'),
  createdAt: z.iso.datetime().describe('Creation timestamp (ISO 8601)'),
  updatedAt: z.iso.datetime().describe('Last update timestamp (ISO 8601)'),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export class TaskResponseDto extends createZodDto(TaskResponseSchema) {}

export const TaskListResponseSchema = z.object({
  data: z
    .array(TaskResponseSchema)
    .describe('List of tasks for the current page'),
  total: z.number().int().describe('Total number of tasks matching the filter'),
  page: z.number().int().describe('Current page number'),
  limit: z.number().int().describe('Number of items per page'),
});

export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;

export class TaskListResponseDto extends createZodDto(TaskListResponseSchema) {}
