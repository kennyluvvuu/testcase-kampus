import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserResponse, UserDoc, UserRequest } from './users.schema';

import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  private readonly toUserResponse = (user: UserDoc): UserResponse => ({
    id: user._id.toString(),
    email: user.email,
  });

  async findById(id: string): Promise<UserResponse | null> {
    const user = await this.userModel.findById(id).lean().exec();
    return user ? this.toUserResponse(user) : null;
  }

  async findByEmail(email: string): Promise<UserResponse | null> {
    const user = await this.userModel.findOne({ email }).lean().exec();
    return user ? this.toUserResponse(user) : null;
  }

  async createOne(user: UserRequest): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await this.userModel.create({
      email: user.email,
      password_hash: hashedPassword,
    });
    return this.toUserResponse(createdUser.toObject());
  }

  async verifyPasswordByEmail(
    email: string,
    password: string,
  ): Promise<[boolean, string | null]> {
    const foundUser = await this.userModel.findOne({ email }).lean().exec();
    if (!foundUser) return [false, null];
    const isValid = await bcrypt.compare(password, foundUser.password_hash);
    return [isValid, foundUser._id.toString()];
  }
}
