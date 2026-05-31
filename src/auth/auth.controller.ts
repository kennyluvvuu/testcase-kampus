import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserRequestDto, LoginUserResponseDto } from './dto/login.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from './dto/register.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ZodSerializerDto(LoginUserResponseDto)
  @HttpCode(200)
  @ApiOkResponse({
    description: 'User logged in successfully',
    type: LoginUserResponseDto,
  })
  async login(@Body() loginDto: LoginUserRequestDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ZodSerializerDto(RegisterUserResponseDto)
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: RegisterUserResponseDto,
  })
  async register(@Body() registerDto: RegisterUserRequestDto) {
    return this.authService.register(registerDto);
  }
}
