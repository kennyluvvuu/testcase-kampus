import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterUserRequestSchema = z.object({
  email: z.email().describe('User email address'),
  password: z.string().describe('User password'),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;

export const RegisterUserResponseSchema = z.object({
  id: z.string().describe('User ID'),
  email: z.email().describe('User email address'),
  token: z.string().describe('JWT access token'),
});

export type RegisterUserResponse = z.infer<typeof RegisterUserResponseSchema>;

export class RegisterUserRequestDto extends createZodDto(
  RegisterUserRequestSchema,
) {}
export class RegisterUserResponseDto extends createZodDto(
  RegisterUserResponseSchema,
) {}
