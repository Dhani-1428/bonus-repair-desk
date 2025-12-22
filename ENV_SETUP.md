# Environment Variables Setup Guide

## For Local Development

### Step 1: Create `.env` File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor

3. Fill in your actual database credentials:

   **For Aiven (Cloud Database):**
   ```env
   DB_HOST=your-db-12345.aivencloud.com
   DB_PORT=12345
   DB_USER=avnadmin
   DB_PASSWORD=your-actual-password
   DB_NAME=admin_panel_db
   DB_SSL=true
   ```

   **For Local MySQL:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your-mysql-password
   DB_NAME=admin_panel_db
   DB_SSL=false
   ```

4. Add email configuration:
   ```env
   FROM_EMAIL=bonusrepairdesk@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   ADMIN_EMAIL=bonusrepairdesk@gmail.com
   ```

5. Save the file

### Step 2: Verify `.env` is Working

The app automatically loads `.env` files when you run:
```bash
npm run dev
```

Next.js automatically loads these files in order (first one found wins):
- `.env.local` (highest priority, ignored by git)
- `.env.development` (for development)
- `.env.production` (for production)
- `.env` (lowest priority)

### Step 3: Test Connection

Visit: `http://localhost:3000/api/test-db-connection`

This will show you if the environment variables are being read correctly.

## For Vercel Production Deployment

**IMPORTANT**: `.env` files are NOT deployed to Vercel for security reasons. You MUST set environment variables in Vercel's dashboard.

### Steps:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add each variable:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SSL`
   - `FROM_EMAIL`
   - `EMAIL_PASSWORD`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_BASE_URL` (your Vercel app URL)

3. **Select Environment**: Make sure to select **Production**, **Preview**, and **Development**

4. **Redeploy**: After adding variables, go to **Deployments** → Click **Redeploy**

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host address | `your-db.aivencloud.com` or `localhost` |
| `DB_PORT` | Database port | `12345` or `3306` |
| `DB_USER` | Database username | `avnadmin` or `root` |
| `DB_PASSWORD` | Database password | Your actual password |
| `DB_NAME` | Database name | `admin_panel_db` |
| `DB_SSL` | Enable SSL connection | `true` or `false` |

### Email Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FROM_EMAIL` | Email address to send from | `bonusrepairdesk@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | Your Gmail app password |
| `ADMIN_EMAIL` | Admin notification email | `bonusrepairdesk@gmail.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | Base URL for the app | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Generated if missing |
| `NEXTAUTH_URL` | NextAuth URL | `http://localhost:3000` |

## Security Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Never share `.env` files** - They contain sensitive credentials
3. **Use `.env.example`** - This file shows what variables are needed without actual values
4. **For Vercel** - Always set variables in the dashboard, never in code

## Troubleshooting

### Variables Not Loading?

1. **Check file name**: Must be exactly `.env` (not `.env.txt` or `.env file`)
2. **Check location**: Must be in the project root (same folder as `package.json`)
3. **Restart dev server**: After changing `.env`, restart with `npm run dev`
4. **Check syntax**: No spaces around `=` sign, no quotes needed for values

### Example of Correct Format:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mypassword123
```

### Example of Wrong Format:
```env
DB_HOST = localhost  ❌ (spaces around =)
DB_HOST="localhost"  ❌ (quotes not needed)
DB_HOST= localhost   ❌ (space after =)
```

## Quick Start

1. Copy `.env.example` to `.env`
2. Fill in your database credentials
3. Run `npm run dev`
4. Test at `http://localhost:3000/api/test-db-connection`

