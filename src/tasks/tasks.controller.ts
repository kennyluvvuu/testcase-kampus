import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { TasksService } from './tasks.service';
import { CreateTaskRequestDto } from './dto/create-task.dto';
import { UpdateTaskRequestDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { TaskResponseDto, TaskListResponseDto } from './dto/task-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';

@ApiTags('tasks')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ZodSerializerDto(TaskResponseDto)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({
    description: 'The task has been successfully created.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createTaskDto: CreateTaskRequestDto,
  ) {
    return this.tasksService.createOne(user.userId, createTaskDto);
  }

  @Get()
  @ZodSerializerDto(TaskListResponseDto)
  @ApiOperation({
    summary: 'Get all active tasks with pagination and status filter',
  })
  @ApiOkResponse({
    description: 'List of active tasks returned successfully.',
    type: TaskListResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  async findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryTaskDto) {
    return this.tasksService.findAll(user.userId, query);
  }

  @Get(':id')
  @ZodSerializerDto(TaskResponseDto)
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiOkResponse({
    description: 'Task found and returned.',
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Task not found or does not belong to the current user.',
  })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ZodSerializerDto(TaskResponseDto)
  @ApiOperation({ summary: 'Update a task' })
  @ApiOkResponse({
    description: 'Task updated successfully.',
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Task not found or does not belong to the current user.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskRequestDto,
  ) {
    return this.tasksService.updateOne(id, user.userId, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Archive a task (soft delete)',
    description:
      'Sets `deletedAt` timestamp on the task. Archived tasks are permanently removed from the database after 7 days via a TTL index.',
  })
  @ApiNoContentResponse({ description: 'Task archived successfully.' })
  @ApiNotFoundResponse({ description: 'Task not found or already archived.' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.tasksService.deleteOne(id, user.userId);
  }
}
