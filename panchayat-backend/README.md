# Panchayat Backend (Node.js)

Express + Prisma + MySQL backend for Village Panchayat Management System.

## Quick Start

```bash
cd panchayat-backend-node
npm install
npm run prisma:generate
npm run prisma:push       # push schema to existing MySQL DB
node prisma/seed.js       # seed demo users
npm run dev               # start on http://localhost:8000
```

## Demo Login Credentials

| Role    | Email               | Password     |
|---------|---------------------|--------------|
| Admin   | admin@gram.in       | password123  |
| Clerk   | clerk@gram.in       | password123  |
| Citizen | citizen@gram.in     | password123  |

## API Endpoints

| Method | Path                      | Auth     |
|--------|---------------------------|----------|
| POST   | /api/auth/login           | Public   |
| POST   | /api/auth/register        | Public   |
| GET    | /api/users                | Admin    |
| GET    | /api/users/me             | Any      |
| GET    | /api/citizens             | Admin/Clerk |
| POST   | /api/complaints           | Citizen  |
| GET    | /api/complaints           | Any      |
| POST   | /api/certificates         | Citizen  |
| GET    | /api/certificates         | Any      |
| GET    | /api/schemes              | Any      |
| POST   | /api/schemes              | Admin    |
| GET    | /api/notices              | Any      |
| GET    | /api/registrations        | Admin    |
| PUT    | /api/registrations/:id    | Admin    |

## Environment Variables

Copy `.env.example` to `.env` and fill in values.
