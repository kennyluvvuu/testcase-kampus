import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDoc } from './tasks.schema';
import { CreateTaskRequest } from './dto/create-task.dto';
import { UpdateTaskRequest } from './dto/update-task.dto';
import { QueryTask } from './dto/query-task.dto';
import { TaskResponse, TaskListResponse } from './dto/task-response.dto';

// scoped query pattern
// from the user perspective, archived and other users tasks simply dont exist
@Injectable()
export class TasksService {
  constructor(@InjectModel('Task') private readonly taskModel: Model<Task>) {}

  private toTaskResponse(task: TaskDoc): TaskResponse {
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId.toString(),
      deletedAt: task.deletedAt ? new Date(task.deletedAt).toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  async createOne(
    userId: string,
    task: CreateTaskRequest,
  ): Promise<TaskResponse> {
    const createdTask = await this.taskModel.create({
      title: task.title,
      description: task.description,
      userId,
    });
    return this.toTaskResponse(createdTask.toObject());
  }

  async findAll(userId: string, query: QueryTask): Promise<TaskListResponse> {
    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const filter = {
      userId,
      deletedAt: null,
      ...(status ? { status } : {}),
    };

    const [data, total] = await Promise.all([
      this.taskModel.find(filter).skip(skip).limit(limit).lean().exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map((t) => this.toTaskResponse(t)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string): Promise<TaskResponse> {
    const task = await this.taskModel
      .findOne({ _id: id, userId, deletedAt: null })
      .lean()
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.toTaskResponse(task);
  }

  async updateOne(
    id: string,
    userId: string,
    task: UpdateTaskRequest,
  ): Promise<TaskResponse> {
    const updated = await this.taskModel
      .findOneAndUpdate({ _id: id, userId, deletedAt: null }, task, {
        new: true,
      })
      .exec();
    if (!updated) {
      throw new NotFoundException('Task not found');
    }
    return this.toTaskResponse(updated.toObject());
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    const updated = await this.taskModel
      .findOneAndUpdate(
        { _id: id, userId, deletedAt: null },
        { deletedAt: new Date() },
        {
          new: true,
        },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Task not found');
    }
  }
}
