# MySQL Direct Database Setup

This application now uses **direct MySQL queries** instead of Prisma ORM.

## Quick Start

### 1. Install Dependencies

```bash
npm install mysql2 uuid @types/uuid
```

### 2. Configure Environment Variables

Create/update `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=admin_panel_db
```

### 3. Create Database

```sql
CREATE DATABASE admin_panel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Initialize Database Tables

Run the SQL script:

```bash
mysql -u root -p admin_panel_db < scripts/init-database.sql
```

Or manually execute the SQL from `scripts/init-database.sql`

### 5. Start Application

```bash
npm run dev
```

## How It Works

### Connection Pool

The application uses `mysql2` connection pool:

```typescript
import { query, queryOne, execute } from "@/lib/mysql"

// Query with results
const users = await query("SELECT * FROM users")

// Get single result
const user = await queryOne("SELECT * FROM users WHERE id = ?", [userId])

// Execute INSERT/UPDATE/DELETE
await execute("INSERT INTO users (name, email) VALUES (?, ?)", [name, email])
```

### Multi-Tenant Tables

Each user gets their own tables:
- `tenant_{tenantId}_repair_tickets`
- `tenant_{tenantId}_team_members`
- `tenant_{tenantId}_deleted_tickets`
- `tenant_{tenantId}_deleted_members`

Tables are created automatically on user registration or first use.

## API Routes

All routes use direct MySQL queries:
- `/api/users` - User management
- `/api/auth/login` - Authentication
- `/api/auth/register` - Registration (creates tenant tables)
- `/api/repairs` - Repair tickets (tenant-specific)
- `/api/subscriptions` - Subscriptions
- `/api/payments` - Payment requests
- `/api/team-members` - Team members (tenant-specific)
- `/api/super-admin/tenants` - Super admin access

## Default Login

- **Email**: `superadmin@admin.com`
- **Password**: `superadmin123`

Change this password immediately!

## Documentation

- `MYSQL_SETUP.md` - Detailed setup guide
- `MULTI_TENANT_SETUP.md` - Multi-tenant architecture details
- `DATABASE_SETUP.md` - Database setup instructions

