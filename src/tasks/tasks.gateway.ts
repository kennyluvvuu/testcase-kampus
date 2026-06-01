import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TaskResponse } from './dto/task-response.dto';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/tasks' })
export class TasksGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      await client.join(payload.userId);
    } catch {
      client.disconnect();
    }
  }

  notifyTaskCreated(userId: string, task: TaskResponse): void {
    this.server.to(userId).emit('task:created', task);
  }

  notifyTaskUpdated(userId: string, task: TaskResponse): void {
    this.server.to(userId).emit('task:updated', task);
  }

  notifyTaskDeleted(userId: string, taskId: string): void {
    this.server.to(userId).emit('task:deleted', { id: taskId });
  }

  private extractToken(client: Socket): string | undefined {
    // socket.io client auth
    const authToken = client.handshake.auth?.token as string | undefined;
    if (authToken) return authToken;

    // fallback for postman( Authorization header )
    const header = client.handshake.headers?.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);

    return undefined;
  }
}
