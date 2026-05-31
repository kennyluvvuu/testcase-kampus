import { InferSchemaType, Schema } from 'mongoose';

export const TasksSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // userId хранит связь с пользователем, но в текущей реализации мы ее не используем
    // В будущих версиях возможно понадобится использовать populate, поэтому оставил
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// индекс для поиска задач по пользователю, статусу и удалению, статус опционален так что в индексе последний
TasksSchema.index({
  userId: 1,
  deletedAt: 1,
  status: 1,
});

// ttl индекс для автоматического удаления из архива
TasksSchema.index(
  {
    deletedAt: 1,
  },
  { expireAfterSeconds: 604800 },
);

export type Task = InferSchemaType<typeof TasksSchema>;
export type TaskDoc = Task & { _id: { toString(): string } };
