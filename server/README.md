# SocietyHub API

The Express API uses a local JSON file for development persistence. It serves the React app at `http://localhost:8443` (or the configured Vite port) and listens on port `4000` by default. Set `API_PORT` to override the API port; `PORT=8443` is treated as the frontend host port.

## Setup

From the repository root:

```sh
npm install
cp .env.example .env
```

Set `JWT_SECRET` in `.env` to a private random value of at least 32 characters before starting the server. Do not commit `.env` or use the demo secret for deployment.

## Commands

```sh
npm run db             # Seed only if the database is empty
npm run dev             # Vite frontend
npm run dev:server      # Express API with watch mode
npm run dev:full        # Frontend and API together
npm run build           # Frontend production build
npm run build:server    # Backend TypeScript check/build
npm run start:server    # Start the compiled API
npm run db:seed         # Restore demo seed data
npm run db:reset        # Reset the development database
```

The equivalent `pnpm` commands are available through the package scripts. The app reads `VITE_API_URL`; the default is `http://localhost:4000/api`.

## Demo Accounts

These development accounts are created by `db:seed` and `db:reset`:

- Committee: `committee@societyhub.local` / `ChangeMe123!`
- Resident: `resident@societyhub.local` / `ChangeMe123!`

Change demo credentials and secrets before using any non-development environment.

## Database

The database is `server/data/db.json` by default. Override it with `DATABASE_PATH`. Collections are `users`, `societies`, `residents`, `complaints`, `notices`, `payments`, `transactions`, `activities`, and `monthlyCollections`. Passwords are stored as bcrypt hashes. JSON writes are serialized in-process and replace the database via a temporary file.

Run `npm run db:reset` to replace all local records with a fresh copy generated from `src/lib/data.ts`. This is a development command, not an HTTP endpoint.

## Authentication And Roles

Call `POST /api/auth/login` with an email and password. Save the returned JWT and send it as `Authorization: Bearer <token>` on protected requests. `GET /api/auth/me` validates the session. Residents are restricted to their own profile, payments, transactions, and complaints; committee routes and all society records are scoped by the authenticated society ID.

## Endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/health` | Public |
| POST | `/api/auth/register` | Public, existing unlinked unit required |
| POST | `/api/auth/login` | Public, rate limited |
| GET | `/api/auth/units` | Public, unlinked units only |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/profile` | Authenticated, own profile |
| GET | `/api/dashboard` | Committee |
| GET | `/api/dashboard/me` | Resident, own data |
| GET, POST | `/api/residents` | Committee |
| GET, PATCH | `/api/residents/:id` | Committee |
| GET | `/api/residents/export` | Committee CSV |
| GET | `/api/complaints` | Committee |
| GET | `/api/complaints/me` | Resident, own complaints |
| POST | `/api/complaints` | Resident |
| GET, PATCH | `/api/complaints/:id` | Committee; residents can read their own |
| GET, POST | `/api/notices` | Authenticated read; committee create |
| GET, PATCH, DELETE | `/api/notices/:id` | Authenticated read; committee edit/archive |
| GET, POST | `/api/payments` | Committee |
| GET | `/api/payments/me` | Resident, own payments |
| GET | `/api/payments/:id` | Committee; residents can read their own |
| GET | `/api/transactions` | Committee; residents get only their own |
| GET | `/api/transactions/:id` | Committee; residents can read their own |
| GET | `/api/transactions/export` | Committee CSV |
| GET | `/api/activities` | Committee |

List endpoints accept `page` and `limit`. Resident notice requests exclude archived notices. Complaint and notice search/category/status filters are validated by the API.

Real payment processing is intentionally not implemented; committee users can record offline payments manually.

## Deployment Notes

Build the frontend with `VITE_API_URL` set at build time. For separate frontend/API hosts, set it to the public API base URL and set `CLIENT_URL` to the exact frontend origin(s), comma-separated. For a same-origin deployment, omit `VITE_API_URL` and route `/api` to the Express service with a reverse proxy. The API's CORS allowlist is not a substitute for authentication.

Build with `npm run build` and `npm run build:server`; serve the generated frontend `dist/` directory with a static host and run the API with `npm run start:server`. Configure `API_PORT`, a private `JWT_SECRET` (32+ characters), and an absolute writable `DATABASE_PATH`. The host must mount durable storage for that path and back it up; ephemeral filesystems lose records on restart/redeploy. Run only one API process/instance against this JSON database because write serialization is process-local. Migrate to a transactional shared database before horizontal scaling or production workloads.