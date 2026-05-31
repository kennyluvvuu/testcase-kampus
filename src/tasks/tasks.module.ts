import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksSchema } from './tasks.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Task', schema: TasksSchema }])],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
