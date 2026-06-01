import { InferSchemaType, Schema } from 'mongoose';

export const TasksSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // userId stores the link to the user, but it is not used in the current implementation
    // In future versions, populate may be needed, so I left it here
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

// index for searching tasks by user, status, and deletion; status is optional, so it goes last in the index
TasksSchema.index({
  userId: 1,
  deletedAt: 1,
  status: 1,
});

// TTL index for automatic deletion from archive
TasksSchema.index(
  {
    deletedAt: 1,
  },
  { expireAfterSeconds: 604800 },
);

export type Task = InferSchemaType<typeof TasksSchema>;
export type TaskDoc = Task & { _id: { toString(): string } };
