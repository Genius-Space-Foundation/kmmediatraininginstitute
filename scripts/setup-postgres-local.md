# PostgreSQL Local Setup Guide

Since Docker isn't available, here's how to set up PostgreSQL locally:

## Option 1: Install PostgreSQL on Windows

### Step 1: Download PostgreSQL

1. Go to https://www.postgresql.org/download/windows/
2. Download the PostgreSQL installer for Windows
3. Run the installer and follow the setup wizard

### Step 2: Installation Settings

- **Installation Directory**: Use default (C:\Program Files\PostgreSQL\15)
- **Data Directory**: Use default (C:\Program Files\PostgreSQL\15\data)
- **Password**: Use `chris00` (as configured in your .env file)
- **Port**: Use default (5432)
- **Locale**: Use default

### Step 3: Create Database

After installation, open Command Prompt and run:

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres -h localhost

# Create the database
CREATE DATABASE kmmedia;

# Verify the database was created
\l

# Exit psql
\q
```

## Option 2: Use PostgreSQL Cloud Service (Free)

### Step 1: Sign up for a free PostgreSQL service

- **Neon**: https://neon.tech (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)

### Step 2: Get Connection Details

After creating a database, you'll get connection details like:

- Host: `ep-cool-name-123456.us-east-1.aws.neon.tech`
- Port: `5432`
- Database: `neondb`
- Username: `your_username`
- Password: `your_password`

### Step 3: Update Environment Variables

Update your `server/.env` file with the cloud database details:

```env
DB_HOST=ep-cool-name-123456.us-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your_username
DB_PASSWORD=your_password
DATABASE_URL=postgresql://your_username:your_password@ep-cool-name-123456.us-east-1.aws.neon.tech:5432/neondb
```

## Option 3: Use SQLite Temporarily (Quick Fix)

If you want to get the app running immediately while setting up PostgreSQL:

1. Install SQLite dependencies:

   ```bash
   cd server
   npm install sqlite3 sqlite
   ```

2. Use the SQLite setup I created earlier (database-sqlite.ts)

## Recommended: Option 1 (Local PostgreSQL)

I recommend installing PostgreSQL locally as it's the most straightforward and matches your current configuration.

After setting up PostgreSQL, restart your server:

```bash
cd server
npm run dev
```

The server should now connect to PostgreSQL successfully!
