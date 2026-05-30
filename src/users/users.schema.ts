import { InferSchemaType, Schema } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
});

UserSchema.index({
  email: 1,
});

export type User = InferSchemaType<typeof UserSchema>;
export type UserDoc = User & { _id: { toString(): string } };
export type UserResponse = Omit<User, 'password_hash'> & {
  id: string;
};
