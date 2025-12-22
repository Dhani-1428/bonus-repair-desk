# Quick Database Setup Guide

## Step-by-Step Setup

### 1. Install MySQL (if not installed)

**Windows:**
- Download from: https://dev.mysql.com/downloads/installer/
- Run installer and remember your root password

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

### 2. Create Database

Open MySQL command line:
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE admin_panel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'admin_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON admin_panel_db.* TO 'admin_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Update .env File

Edit the `.env` file in your project root and replace the `DATABASE_URL` with:

```env
DATABASE_URL="mysql://admin_user:your_password_here@localhost:3306/admin_panel_db"
```

**Replace:**
- `admin_user` - Your MySQL username
- `your_password_here` - Your MySQL password
- `admin_panel_db` - Your database name

### 4. Run Setup Commands

```bash
# Install dependencies (if not done)
npm install

# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 5. Verify Setup

```bash
# Open database viewer
npx prisma studio
```

This opens a web interface where you can see your database tables.

### 6. Start Application

```bash
npm run dev
```

Visit http://localhost:3000 and login with:
- **Email**: `superadmin@admin.com`
- **Password**: `superadmin123`

## Troubleshooting

**Connection Error?**
- Check MySQL is running: `mysql -u root -p` (should connect)
- Verify `.env` file has correct `DATABASE_URL`
- Check username/password are correct

**Migration Error?**
- Make sure database exists
- Check user has permissions
- Try: `npx prisma db push` instead

**Need Help?**
- Check `DATABASE_SETUP.md` for detailed guide
- Verify MySQL version: `mysql --version` (should be 8.0+)

