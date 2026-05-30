import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserResponse, UserDoc } from './users.schema';

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

  async createOne(user: User): Promise<UserResponse> {
    const createdUser = await this.userModel.create(user);
    return this.toUserResponse(createdUser.toObject());
  }
}
