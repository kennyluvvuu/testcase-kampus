import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterUserRequest, RegisterUserResponse } from './dto/register.dto';
import { LoginUserRequest, LoginUserResponse } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(user: RegisterUserRequest): Promise<RegisterUserResponse> {
    const existingUser = await this.usersService.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const createdUser = await this.usersService.createOne(user);
    const token = await this.jwtService.signAsync({ userId: createdUser.id });
    return { ...createdUser, token };
  }

  async login(user: LoginUserRequest): Promise<LoginUserResponse> {
    const [isValid, userId] = await this.usersService.verifyPasswordByEmail(
      user.email,
      user.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.jwtService.signAsync({ userId });
    return { token };
  }
}
