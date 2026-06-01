import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AppModule } from '../src/app.module';

type HttpServer = Parameters<typeof request>[0];
type ResponseBody<T> = { body: T };

type HealthResponse = {
  status: 'ok';
  timestamp: string;
};

type AuthRegisterResponse = {
  id: string;
  email: string;
  token: string;
};

type AuthLoginResponse = {
  token: string;
};

type TaskStatus = 'todo' | 'in_progress' | 'done';

type TaskResponse = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  userId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskListResponse = {
  data: TaskResponse[];
  total: number;
  page: number;
  limit: number;
};

describe('App (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let taskId: string;

  const httpServer = (): HttpServer => app.getHttpServer() as HttpServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.JWT_SECRET = 'e2e-test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('Health', () => {
    it('GET /health → 200', async () => {
      const res = (await request(httpServer())
        .get('/health')
        .expect(200)) as ResponseBody<HealthResponse>;

      expect(res.body).toMatchObject({ status: 'ok' });
      expect(typeof res.body.timestamp).toBe('string');
      expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
    });
  });

  describe('Auth', () => {
    const credentials = { email: 'user@example.com', password: 'P@ssw0rd!' };

    it('POST /auth/register → 201', async () => {
      const res = (await request(httpServer())
        .post('/auth/register')
        .send(credentials)
        .expect(201)) as ResponseBody<AuthRegisterResponse>;

      expect(res.body).toMatchObject({ email: credentials.email });
      expect(typeof res.body.id).toBe('string');
      expect(res.body.id).toBeTruthy();
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token).toBeTruthy();
    });

    it('POST /auth/register → 409 (duplicate email)', async () => {
      const res = (await request(httpServer())
        .post('/auth/register')
        .send(credentials)
        .expect(409)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 409 });
    });

    it('POST /auth/login → 200', async () => {
      const res = (await request(httpServer())
        .post('/auth/login')
        .send(credentials)
        .expect(200)) as ResponseBody<AuthLoginResponse>;

      expect(typeof res.body.token).toBe('string');
      expect(res.body.token).toBeTruthy();
      authToken = res.body.token;
    });

    it('POST /auth/login → 401 (wrong password)', async () => {
      const res = (await request(httpServer())
        .post('/auth/login')
        .send({ email: credentials.email, password: 'wrong-password' })
        .expect(401)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 401 });
    });

    it('POST /auth/login → 401 (unknown email)', async () => {
      const res = (await request(httpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'any' })
        .expect(401)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 401 });
    });
  });

  describe('Tasks', () => {
    it('GET /tasks → 401 (missing Bearer token)', async () => {
      const res = (await request(httpServer())
        .get('/tasks')
        .expect(401)) as ResponseBody<{
        statusCode: number;
      }>;

      expect(res.body).toMatchObject({ statusCode: 401 });
    });

    it('POST /tasks → 401 (missing Bearer token)', async () => {
      const res = (await request(httpServer())
        .post('/tasks')
        .send({ title: 'Unauthorized', description: 'Should fail' })
        .expect(401)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 401 });
    });

    it('POST /tasks → 201 (create task)', async () => {
      const payload = { title: 'Buy groceries', description: 'Milk and eggs' };

      const res = (await request(httpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201)) as ResponseBody<TaskResponse>;

      expect(res.body).toMatchObject({
        title: payload.title,
        description: payload.description,
        status: 'todo',
        deletedAt: null,
      });
      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.userId).toBe('string');
      expect(typeof res.body.createdAt).toBe('string');
      expect(typeof res.body.updatedAt).toBe('string');

      taskId = res.body.id;
    });

    it('POST /tasks → 400 (empty title)', async () => {
      const res = (await request(httpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '', description: 'Valid description' })
        .expect(400)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('POST /tasks → 400 (missing description)', async () => {
      const res = (await request(httpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Valid title' })
        .expect(400)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('GET /tasks → 200 (list with pagination)', async () => {
      await request(httpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Read a book', description: 'Any good one' })
        .expect(201);

      const res = (await request(httpServer())
        .get('/tasks')
        .query({ page: 1, limit: 1 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)) as ResponseBody<TaskListResponse>;

      expect(res.body).toMatchObject({ page: 1, limit: 1, total: 2 });
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({
        status: 'todo',
        deletedAt: null,
      });
    });

    it('GET /tasks?page=2&limit=1 → 200 (second page)', async () => {
      const res = (await request(httpServer())
        .get('/tasks')
        .query({ page: 2, limit: 1 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)) as ResponseBody<TaskListResponse>;

      expect(res.body).toMatchObject({ page: 2, limit: 1, total: 2 });
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /tasks?status=todo → 200 (filter by status)', async () => {
      const res = (await request(httpServer())
        .get('/tasks')
        .query({ status: 'todo' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)) as ResponseBody<TaskListResponse>;

      expect(typeof res.body.total).toBe('number');
      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.data.every((t) => t.status === 'todo')).toBe(true);
    });

    it('GET /tasks?status=done → 200 (empty list when no done tasks)', async () => {
      const res = (await request(httpServer())
        .get('/tasks')
        .query({ status: 'done' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)) as ResponseBody<TaskListResponse>;

      expect(res.body).toMatchObject({ total: 0, data: [] });
    });

    it('GET /tasks/:id → 200 (get task by id)', async () => {
      const res = (await request(httpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)) as ResponseBody<TaskResponse>;

      expect(res.body).toMatchObject({
        id: taskId,
        title: 'Buy groceries',
        description: 'Milk and eggs',
        status: 'todo',
        deletedAt: null,
      });
    });

    it('GET /tasks/:id → 400 (invalid ObjectId format)', async () => {
      const res = (await request(httpServer())
        .get('/tasks/not-a-valid-mongo-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('GET /tasks/:id → 404 (task does not exist)', async () => {
      const nonExistentId = '000000000000000000000001';

      const res = (await request(httpServer())
        .get(`/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 404 });
    });

    it('PATCH /tasks/:id → 200 (update title and status)', async () => {
      const res = (await request(httpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Buy groceries (updated)', status: 'in_progress' })
        .expect(200)) as ResponseBody<TaskResponse>;

      expect(res.body).toMatchObject({
        id: taskId,
        title: 'Buy groceries (updated)',
        status: 'in_progress',
        deletedAt: null,
      });
    });

    it('PATCH /tasks/:id → 400 (invalid id format)', async () => {
      const res = (await request(httpServer())
        .patch('/tasks/bad-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'done' })
        .expect(400)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 400 });
    });

    it('PATCH /tasks/:id → 404 (task does not exist)', async () => {
      const nonExistentId = '000000000000000000000002';

      const res = (await request(httpServer())
        .patch(`/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'done' })
        .expect(404)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 404 });
    });

    it('DELETE /tasks/:id → 204 (soft delete)', async () => {
      await request(httpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('GET /tasks/:id → 404 (get task after soft delete)', async () => {
      const res = (await request(httpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 404 });
    });

    it('DELETE /tasks/:id → 404 (delete already-archived task)', async () => {
      const res = (await request(httpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 404 });
    });

    it('DELETE /tasks/:id → 400 (invalid id format)', async () => {
      const res = (await request(httpServer())
        .delete('/tasks/bad-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)) as ResponseBody<{ statusCode: number }>;

      expect(res.body).toMatchObject({ statusCode: 400 });
    });
  });
});
