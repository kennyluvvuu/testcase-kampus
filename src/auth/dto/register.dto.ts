import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterUserRequestSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;

export const RegisterUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  token: z.string(),
});

export type RegisterUserResponse = z.infer<typeof RegisterUserResponseSchema>;

export class RegisterUserRequestDto extends createZodDto(
  RegisterUserRequestSchema,
) {}
export class RegisterUserResponseDto extends createZodDto(
  RegisterUserResponseSchema,
) {}
