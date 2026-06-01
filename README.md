# Todo API

Backend for a mobile task management application built with NestJS, MongoDB, and Socket.IO.

## Tech Stack

- **NestJS** — framework
- **MongoDB + Mongoose** — database
- **JWT** — authentication
- **Socket.IO** — real-time notifications
- **Zod** — validation
- **Swagger** — API documentation

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose

### Running with Docker

1. Clone the repository:
```bash
git clone https://github.com/kennyluvvuu/testcase-kampus.git 
cd testcase-kampus
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start the application:
```bash
docker compose up --build
```

API will be available at `http://localhost:3000`
Swagger UI at `http://localhost:3000/api`

### Running locally

```bash
npm install
npm run start:dev
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/todo` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_here` |
| `PORT` | Application port | `3000` |

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all active tasks |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create a new task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Archive a task |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Query Parameters

`GET /tasks` supports filtering and pagination:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | `todo \| in_progress \| done` | — | Filter by status |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page |

## curl Examples

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Create task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

### Get tasks with filter
```bash
curl http://localhost:3000/tasks?status=todo&page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

### Update task status
```bash
curl -X PATCH http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "in_progress"}'
```

### Archive task
```bash
curl -X DELETE http://localhost:3000/tasks/<id> \
  -H "Authorization: Bearer <token>"
```

## WebSocket Events

Connect to `/tasks` namespace with JWT token:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/tasks', {
  auth: { token: 'your_jwt_token' }
});
```

### Server → Client events

| Event | Payload | Description |
|-------|---------|-------------|
| `task:created` | `TaskResponse` | Emitted when a task is created |
| `task:updated` | `TaskResponse` | Emitted when a task is updated |
| `task:deleted` | `{ id: string }` | Emitted when a task is archived |

## Architecture Notes

- **Scoped query pattern** — archived tasks and tasks belonging to other users return 404 instead of 403, avoiding information leakage about resource existence
- **Soft delete** — deleted tasks are archived via `deletedAt` timestamp and automatically removed from the database after 7 days using a MongoDB TTL index
- **Global JWT guard** — all endpoints are protected by default, public routes are marked with `@Public()` decorator
```
