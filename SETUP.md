# Setup Instructions

## 1. Environment Variables

Create a `.env` file in the root directory with:

```env
# MongoDB Connection String
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 2. Database Setup

### Initialize Database Schema
```bash
npx prisma db push
```

This will create the collections in MongoDB:
- `users` - User accounts
- `subscriptions` - User subscriptions

### Create Super Admin User

Run the script to create the super admin:
```bash
npx tsx scripts/create-super-admin.ts
```

Or manually create via registration API with:
- Email: `superadmin@admin.com`
- Password: `superadmin123`

## 3. Test Database Connection

Visit `/api/test-db` in your browser to verify the MongoDB connection.

## 4. Authentication Flow

### Registration
- Users register at `/register`
- Data is saved to MongoDB with hashed passwords
- After registration, users are redirected to `/login`

### Login
- Users login at `/login`
- Credentials are verified against MongoDB
- Session is stored in localStorage (for backward compatibility)
- Redirects:
  - Super admin → `/super-admin`
  - Regular users → `/dashboard`

## 5. Admin Panel Features

All existing features are preserved:
- **Dashboard** - Main dashboard with stats and recent devices
- **Tickets** - Repair ticket management
- **Team** - Team member management
- **Trash** - Deleted items
- **Super Admin** - User and subscription management
- **Checkout** - Subscription checkout flow
- **Contact** - Contact page

## 6. Data Storage

- **Users & Authentication**: MongoDB (via Prisma)
- **Repair Tickets, Team Members, etc.**: localStorage (user-specific, per user ID)
- **Subscriptions**: Can be stored in MongoDB or localStorage (hybrid approach)

## Notes

- The landing page UI remains unchanged
- All admin panel functionality works as before
- Authentication now uses MongoDB instead of localStorage
- User data (tickets, team) still uses localStorage for backward compatibility

