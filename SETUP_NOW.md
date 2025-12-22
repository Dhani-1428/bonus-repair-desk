# 🚀 Setup Instructions - Do This Now

## ✅ What's Already Done
- ✅ Database `admin_panel_db` created
- ✅ Dependencies installed (mysql2, uuid, bcryptjs)
- ✅ Setup scripts created

## 📝 What You Need to Do (3 Steps)

### STEP 1: Update .env File

1. **Open `.env` file** in your project root
2. **Add these lines** (or update if they exist):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=admin_panel_db
   ```
3. **Replace `your_mysql_password_here`** with your actual MySQL root password
4. **Save the file**

### STEP 2: Run SQL Script in MySQL

You're in MySQL command line. Do this:

```sql
USE admin_panel_db;
SOURCE scripts/init-database.sql;
```

**OR** copy all SQL from `scripts/init-database.sql` and paste into MySQL.

Then verify:
```sql
SHOW TABLES;
```

You should see 5 tables. Then exit:
```sql
EXIT;
```

### STEP 3: Run Setup & Start App

In your terminal (project folder):

```bash
npm run setup
```

This will:
- Test database connection
- Create super admin automatically
- Verify everything is ready

Then start the app:
```bash
npm run dev
```

Open: http://localhost:3000

## 🎯 Quick Commands Summary

**In MySQL:**
```sql
USE admin_panel_db;
SOURCE scripts/init-database.sql;
SHOW TABLES;
EXIT;
```

**In Terminal:**
```bash
# 1. Edit .env file (add DB_PASSWORD)
# 2. Run setup
npm run setup

# 3. Start app
npm run dev
```

## ✅ Checklist

- [ ] .env file has `DB_PASSWORD=your_password`
- [ ] SQL script run in MySQL (5 tables created)
- [ ] `npm run setup` completed successfully
- [ ] `npm run dev` started
- [ ] Browser opened to http://localhost:3000

## 🆘 If Something Fails

**"DB_PASSWORD not set"**
→ Edit `.env` file, add your MySQL password

**"Can't connect to MySQL"**
→ Check password in `.env` is correct

**"Tables don't exist"**
→ Go back to MySQL, run the SQL script again

**"npm run setup fails"**
→ Check MySQL is running and password is correct

