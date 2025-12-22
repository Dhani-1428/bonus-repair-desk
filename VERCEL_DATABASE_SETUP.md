# Fixing Database Connection on Vercel

If you're seeing "Database connection failed. Please try again later." on Vercel, follow these steps:

## Step 1: Check Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (`bonus-repair-desk`)
3. Go to **Settings** → **Environment Variables**
4. Make sure ALL these variables are set:

   ```
   DB_HOST=your-aiven-host.aivencloud.com
   DB_PORT=12345
   DB_USER=avnadmin
   DB_PASSWORD=your-database-password
   DB_NAME=admin_panel_db
   DB_SSL=true
   ```

5. **Important**: After adding/updating environment variables, you MUST:
   - Click **"Redeploy"** on your latest deployment, OR
   - Push a new commit to trigger a new deployment

## Step 2: Test Database Connection

After deploying, test the connection by visiting:

```
https://your-app.vercel.app/api/test-db-connection
```

This will show you:
- Which environment variables are set/missing
- Whether the connection is successful
- Detailed error messages if it fails

## Step 3: Check Vercel Function Logs

1. Go to your Vercel project dashboard
2. Click on **Deployments** → Select your latest deployment
3. Click on **Functions** tab
4. Look for errors in the logs, especially:
   - `[MySQL] Connection config:` - Shows what connection settings are being used
   - `[MySQL] ⚠️  Missing required environment variables:` - Lists missing env vars
   - `[API] Register error details:` - Shows the specific database error

## Common Issues and Solutions

### Issue 1: Environment Variables Not Set
**Symptom**: Logs show "✗ MISSING" for DB_HOST, DB_USER, etc.

**Solution**: 
- Add all required environment variables in Vercel Settings → Environment Variables
- Make sure to set them for **Production**, **Preview**, and **Development** environments
- Redeploy after adding variables

### Issue 2: Wrong Database Name
**Symptom**: Error code `ER_BAD_DB_ERROR` or "Database 'xxx' not found"

**Solution**:
- Check your Aiven database name
- Update `DB_NAME` in Vercel environment variables
- Common names: `admin_panel_db`, `defaultdb`

### Issue 3: SSL Configuration
**Symptom**: Connection timeout or SSL errors

**Solution**:
- Set `DB_SSL=true` in Vercel environment variables
- For Aiven databases, SSL is required

### Issue 4: Wrong Host/Port
**Symptom**: `ECONNREFUSED` or `ETIMEDOUT` errors

**Solution**:
- Double-check `DB_HOST` and `DB_PORT` from your Aiven dashboard
- Make sure there are no extra spaces in the values
- Aiven host format: `xxx.aivencloud.com`
- Aiven port is usually a 5-digit number (not 3306)

### Issue 5: Wrong Password
**Symptom**: `ER_ACCESS_DENIED_ERROR` or authentication failed

**Solution**:
- Get the correct password from Aiven dashboard
- Make sure there are no extra spaces or quotes in `DB_PASSWORD`
- Reset the password in Aiven if needed

## Step 4: Verify Aiven Database Settings

1. Log into your Aiven account
2. Go to your MySQL service
3. Check:
   - **Service URI**: Should match your `DB_HOST` and `DB_PORT`
   - **Database name**: Should match your `DB_NAME`
   - **Username**: Should match your `DB_USER`
   - **Password**: Should match your `DB_PASSWORD`
   - **SSL mode**: Should be enabled

## Quick Checklist

- [ ] All 6 environment variables are set in Vercel (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL)
- [ ] Environment variables are set for Production environment
- [ ] Values match your Aiven database settings exactly
- [ ] No extra spaces or quotes in environment variable values
- [ ] Redeployed after adding/updating environment variables
- [ ] Tested connection using `/api/test-db-connection` endpoint
- [ ] Checked Vercel function logs for detailed error messages

## Still Having Issues?

1. Visit `/api/test-db-connection` to see detailed diagnostics
2. Check Vercel function logs for `[MySQL]` and `[API]` messages
3. Verify your Aiven database is running and accessible
4. Make sure your Aiven database allows connections from Vercel's IP addresses (usually enabled by default)

