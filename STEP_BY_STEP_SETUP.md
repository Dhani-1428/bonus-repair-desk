# Step-by-Step MySQL Database Setup

Follow these steps in order:

## Step 1: Run SQL Script in MySQL

You're currently in MySQL command line. Do this:

1. **Switch to your database:**
   ```sql
   USE admin_panel_db;
   ```

2. **Run the initialization script:**
   
   **Option A - Using SOURCE command:**
   ```sql
   SOURCE scripts/init-database.sql;
   ```
   
   **Option B - Copy and paste the SQL:**
   - Open `scripts/init-database.sql` in a text editor
   - Copy all the SQL commands
   - Paste into MySQL command line
   - Press Enter

3. **Verify tables were created:**
   ```sql
   SHOW TABLES;
   ```
   
   You should see 5 tables:
   - users
   - subscriptions
   - subscription_history
   - login_history
   - payment_requests

4. **Exit MySQL:**
   ```sql
   EXIT;
   ```

## Step 2: Configure Environment Variables

1. **Open your project folder** in a text editor (VS Code, Notepad++, etc.)

2. **Create or edit `.env` file** in the root directory (same level as `package.json`)

3. **Add these lines** (replace `your_mysql_password` with your actual MySQL password):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=admin_panel_db
   ```

4. **Save the file**

## Step 3: Install Dependencies (if not done)

Open a new terminal/command prompt in your project folder and run:

```bash
npm install
```

This ensures all packages (mysql2, uuid, etc.) are installed.

## Step 4: Start the Application

In the same terminal, run:

```bash
npm run dev
```

Wait for the message: "Ready on http://localhost:3000"

## Step 5: Access the Application

1. **Open your web browser**
2. **Go to:** http://localhost:3000
3. **You should see the login/register page**

## Step 6: Create Super Admin (First Time)

The super admin will be created automatically when you first try to login, OR you can register a new user.

### Option A: Register a New User
1. Click "Register" or go to http://localhost:3000/register
2. Fill in the form:
   - Name: Your name
   - Email: your-email@example.com
   - Password: (choose a password)
   - Shop Name: Your shop name
3. Click "Register"
4. You'll be automatically logged in
5. Tenant tables will be created automatically for you

### Option B: Login as Super Admin
1. Go to http://localhost:3000/login
2. Try to login with:
   - Email: `superadmin@admin.com`
   - Password: `superadmin123`
3. If it doesn't work, the super admin will be created automatically on first attempt

## Step 7: Test the Application

1. **Create a Repair Ticket:**
   - Go to "New Repair Device" page
   - Fill in the form
   - Submit
   - Your tenant tables are created automatically!

2. **Check Database:**
   - Go back to MySQL
   - Run: `SHOW TABLES;`
   - You should see tenant tables like `tenant_xxx_repair_tickets`

## Troubleshooting

### Error: "Can't connect to MySQL"
- Check `.env` file has correct password
- Verify MySQL is running
- Check DB_HOST and DB_PORT are correct

### Error: "Table doesn't exist"
- Make sure you ran the SQL script (Step 1)
- Check: `SHOW TABLES;` in MySQL

### Error: "Access denied"
- Check MySQL password in `.env` file
- Verify MySQL user has permissions

### Application won't start
- Check all dependencies: `npm install`
- Check `.env` file exists
- Look at terminal for error messages

## Summary Checklist

- [ ] Database created: `admin_panel_db`
- [ ] SQL script run: Tables created
- [ ] `.env` file configured with MySQL credentials
- [ ] Dependencies installed: `npm install`
- [ ] Application started: `npm run dev`
- [ ] Browser opened: http://localhost:3000
- [ ] User registered or super admin logged in
- [ ] Tested creating a repair ticket

## Next Steps After Setup

Once everything is working:
1. Create repair tickets
2. View them in "Devices Information"
3. Print receipts
4. Manage subscriptions
5. Super admin can view all tenant data

