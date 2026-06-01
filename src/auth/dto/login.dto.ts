import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginUserRequestSchema = z.object({
  email: z.email().describe('User email address'),
  password: z.string().describe('User password'),
});

export type LoginUserRequest = z.infer<typeof LoginUserRequestSchema>;
export const LoginUserResponseSchema = z.object({
  token: z.string().describe('JWT access token'),
});

export type LoginUserResponse = z.infer<typeof LoginUserResponseSchema>;

export class LoginUserRequestDto extends createZodDto(LoginUserRequestSchema) {}
export class LoginUserResponseDto extends createZodDto(
  LoginUserResponseSchema,
) {}
