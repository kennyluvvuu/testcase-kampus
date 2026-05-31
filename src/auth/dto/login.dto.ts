import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginUserRequestSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginUserRequest = z.infer<typeof LoginUserRequestSchema>;
export const LoginUserResponseSchema = z.object({
  token: z.string(),
});

export type LoginUserResponse = z.infer<typeof LoginUserResponseSchema>;

export class LoginUserRequestDto extends createZodDto(LoginUserRequestSchema) {}
export class LoginUserResponseDto extends createZodDto(
  LoginUserResponseSchema,
) {}
