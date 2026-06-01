import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const QueryTaskSchema = z.object({
  status: z
    .enum(['todo', 'in_progress', 'done'])
    .optional()
    .describe('Filter tasks by status'),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .describe('Page number (starting from 1)'),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(20)
    .describe('Number of items per page (default: 20)'),
});

export type QueryTask = z.infer<typeof QueryTaskSchema>;

export class QueryTaskDto extends createZodDto(QueryTaskSchema) {}
