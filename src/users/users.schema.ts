import { InferSchemaType, Schema } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
});

export type User = InferSchemaType<typeof UserSchema>;
export type UserDoc = User & { _id: { toString(): string } };

export type UserResponse = Omit<User, 'password_hash'> & {
  id: string;
};
export type UserRequest = Omit<User, 'password_hash'> & {
  password: string;
};
