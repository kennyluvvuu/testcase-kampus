import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksGateway } from './tasks.gateway';
import { TasksSchema } from './tasks.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Task', schema: TasksSchema }])],
  providers: [TasksService, TasksGateway],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
