import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserRequestDto, LoginUserResponseDto } from './dto/login.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from './dto/register.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // rate limited to 10 requests per minute
  @Public()
  @Throttle({
    default: { ttl: 60000, limit: 10 },
  })
  @Post('login')
  @ZodSerializerDto(LoginUserResponseDto)
  @HttpCode(200)
  @ApiOperation({ summary: 'Login and receive a JWT token' })
  @ApiOkResponse({
    description: 'User logged in successfully.',
    type: LoginUserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests. Limit: 10 per minute.',
  })
  async login(@Body() loginDto: LoginUserRequestDto) {
    return this.authService.login(loginDto);
  }

  // rate limited to 5 requests per minute
  @Public()
  @Throttle({
    default: { ttl: 60000, limit: 5 },
  })
  @Post('register')
  @ZodSerializerDto(RegisterUserResponseDto)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully.',
    type: RegisterUserResponseDto,
  })
  @ApiConflictResponse({ description: 'User with this email already exists.' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests. Limit: 5 per minute.',
  })
  async register(@Body() registerDto: RegisterUserRequestDto) {
    return this.authService.register(registerDto);
  }
}
